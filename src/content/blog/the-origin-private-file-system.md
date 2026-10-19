---
title: "The origin private file system (OPFS)"
date: 2026-11-20
tags:
  - Web APIs
  - File System
  - OPFS
---

The Origin Private File System (OPFS) provides a storage endpoint that is private to the origin of the page, allowing web applications to store and manipulate files in their own virtual file system. Unlike the traditional user-visible file system, OPFS is highly optimized for performance and is subject to standard browser storage quota restrictions. Because OPFS writes to a sandboxed environment, permission prompts are not required for access.

This guide demonstrates how to build a robust file management architecture using the OPFS API, handle file iteration, manage background web workers, export data, and configure persistent storage limits.

## Core API basics

### Initialize the OPFS and create directory structures

Calling `navigator.storage.getDirectory()` is the single action that automatically provisions the OPFS for your origin. If the OPFS does not exist for the web application, the browser creates it at that exact moment.

Once you obtain the root directory, creating directories and files are two distinct operations managed by separate methods. You create directories using `getDirectoryHandle()`, and you can chain these handles to organize files hierarchically.

```ts
async function createDirectoryStructure(): Promise<void> {
  // Retrieves the root, provisioning the OPFS if it's the first time
  const opfsRoot = await navigator.storage.getDirectory();

  // Create a subdirectory named 'project-files'
  const subDir = await opfsRoot.getDirectoryHandle('project-files', { create: true });

  // Create a file INSIDE the new subdirectory, not the root
  await subDir.getFileHandle('config.json', { create: true });
}

```

### Write data asynchronously

For main-thread operations, the OPFS provides Promise-based APIs. To write to a file, call `createWritable()` on the file handle. This returns a `FileSystemWritableFileStream` object. Write the content, and then close the stream to persist the changes.

```ts
async function writeToOpfsFile(
  fileHandle: FileSystemFileHandle,
  content: string
): Promise<void> {
  const writableStream = await fileHandle.createWritable();

  await writableStream.write(content);
  await writableStream.close();
}
```

### Read data from a file

Reading files asynchronously also happens via the file handle. Calling `getFile()` returns a standard `File` object, which functions as a specialized `Blob`. You can extract text, an `ArrayBuffer`, or a stream directly from this object.

```ts
async function readFromOpfsFile(fileHandle: FileSystemFileHandle): Promise<string> {
  const file = await fileHandle.getFile();

  // Read the contents as a string
  return file.text();
}

```

### Read and iterate through directories

To read the contents of an OPFS directory, use the asynchronous iterator provided by the `FileSystemDirectoryHandle`. You can iterate over the directory's entries using a `for await...of` loop. The iterator returns handles for both files and subdirectories, allowing you to build recursive functions to traverse the entire file tree.

```ts
async function listDirectoryContents(
  dirHandle: FileSystemDirectoryHandle,
  currentPath: string = ''
): Promise<void> {
  // .values() returns an async iterator of FileSystemHandle objects
  for await (const entry of dirHandle.values()) {
    const fullPath = `${currentPath}/${entry.name}`;
    console.log(`Found ${entry.kind}: ${fullPath}`);

    // If the entry is a directory, recursively list its contents
    if (entry.kind === 'directory') {
      const subDirHandle = entry as FileSystemDirectoryHandle;
      await listDirectoryContents(subDirHandle, fullPath);
    }
  }
}
```

### Delete files and directories

Managing storage quotas requires cleaning up files you no longer need. Use the `removeEntry()` method on a directory handle to delete a specific file or subdirectory.

```ts
async function cleanUpOpfs(fileName: string, dirName: string): Promise<void> {
  const opfsRoot = await navigator.storage.getDirectory();

  await opfsRoot.removeEntry(fileName);

  // Delete a directory and all of its contents using the recursive option
  await opfsRoot.removeEntry(dirName, { recursive: true });
}

```

## Advanced integrations

### Maximize performance with synchronous Web Workers

The primary advantage of using OPFS inside a Web Worker is access to the `createSyncAccessHandle()` method. Synchronous access is blocked on the main thread because it would freeze the user interface during I/O operations. The example overwrites a file with each message, checks that the full buffer was written, truncates any trailing bytes from a longer previous message, flushes the changes, and reads the result back. It closes the access handle even if an operation fails.

First, create the worker script to handle the synchronous operations:

```ts
// opfs-worker.ts
self.onmessage = async (event: MessageEvent) => {
  try {
    const opfsRoot = await navigator.storage.getDirectory();
    const fileHandle = await opfsRoot.getFileHandle('worker-data.bin', { create: true });

    // Request the synchronous access handle
    const accessHandle = await fileHandle.createSyncAccessHandle();
    let readString = '';

    try {
      // Write data synchronously
      const encoder = new TextEncoder();
      const writeBuffer = encoder.encode(event.data);
      const bytesWritten = accessHandle.write(writeBuffer, { at: 0 });

      if (bytesWritten !== writeBuffer.byteLength) {
        throw new Error('Failed to write the complete buffer to OPFS.');
      }

      // Remove any trailing bytes left by a longer previous message
      accessHandle.truncate(writeBuffer.byteLength);
      accessHandle.flush();

      // Read data synchronously
      const readBuffer = new ArrayBuffer(accessHandle.getSize());
      accessHandle.read(readBuffer, { at: 0 });

      const decoder = new TextDecoder();
      readString = decoder.decode(readBuffer);
    } finally {
      accessHandle.close();
    }

    self.postMessage({ status: 'success', data: readString });
  } catch (error) {
    self.postMessage({ status: 'error', error: String(error) });
  }
};
```

Then, instantiate the worker in your main thread. This example assumes a TypeScript-aware bundler, such as Vite, that compiles both files and processes the `new URL(..., import.meta.url)` worker pattern; browsers do not load `.ts` files directly.

```ts
// main.ts
function runOpfsWorker(data: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./opfs-worker.ts', import.meta.url), {
      type: 'module'
    });

    worker.onmessage = (event: MessageEvent) => {
      if (event.data.status === 'success') {
        resolve(event.data.data);
      } else {
        reject(new Error(event.data.error));
      }
      worker.terminate();
    };

    worker.postMessage(data);
  });
}

```

### Export files to the user's hard drive

Because OPFS is sandboxed, users cannot open their operating system's file explorer and view the files. To extract a single file from OPFS to the user's local hard drive, you bridge OPFS with the File System Access API using `showSaveFilePicker()`. This prompts the user to select a download location, and then you stream the OPFS data into the local file.

Both `showSaveFilePicker()` and `showDirectoryPicker()` require a secure context, such as HTTPS or localhost, and transient user activation, so call them in response to a user action. They are currently supported in Chromium-based browsers but not Firefox or Safari; provide an alternate export path for unsupported browsers.

```ts
async function exportFromOpfsToLocalDisk(opfsFileName: string): Promise<void> {
  const opfsRoot = await navigator.storage.getDirectory();

  // 1. Retrieve the file from OPFS
  const opfsFileHandle = await opfsRoot.getFileHandle(opfsFileName);
  const opfsFile = await opfsFileHandle.getFile();

  // 2. Prompt the user to select a save location on their local machine
  const localFileHandle = await window.showSaveFilePicker({
    suggestedName: opfsFileName,
  });

  // 3. Write the OPFS data to the local file
  const localWritableStream = await localFileHandle.createWritable();
  await localWritableStream.write(opfsFile);
  await localWritableStream.close();
}

```

### Export OPFS directories to the local file system

Exporting OPFS data is useful when users need to edit files with desktop tools, keep a user-controlled copy, or move their work out of the browser. Prefer an explicit export or opt-in synchronization: automatically mirroring all data duplicates storage and can expose private files. An ongoing mirror also needs clear rules for conflicts, deletions, permissions, and interrupted writes.

The example below performs a one-way copy to a directory the user selects. It does not keep the two directories synchronized. To let a user export an entire directory structure, such as a project folder, use `showDirectoryPicker()`.

Because both OPFS and the local file system use the same `FileSystemDirectoryHandle` and `FileSystemFileHandle` interfaces, you can recursively copy entries from the source OPFS directory to the destination local directory.

```ts
async function exportDirectoryToLocal(opfsDirName: string): Promise<void> {
  try {
    const opfsRoot = await navigator.storage.getDirectory();
    // Get the OPFS directory you want to export
    const sourceDirHandle = await opfsRoot.getDirectoryHandle(opfsDirName);

    // Prompt the user to select a destination folder on their local device
    const targetDirHandle = await window.showDirectoryPicker({
      mode: 'readwrite'
    });

    // Recursively copy the contents
    await copyDirectory(sourceDirHandle, targetDirHandle);
    console.log('Directory export complete.');

  } catch (error) {
    console.error('Export failed:', error);
  }
}

// Recursive helper function
async function copyDirectory(
  sourceHandle: FileSystemDirectoryHandle,
  targetHandle: FileSystemDirectoryHandle
): Promise<void> {

  for await (const entry of sourceHandle.values()) {
    if (entry.kind === 'file') {
      // 1. Get the source file from OPFS
      const sourceFileHandle = entry as FileSystemFileHandle;
      const file = await sourceFileHandle.getFile();

      // 2. Create a corresponding file in the target local directory
      const targetFileHandle = await targetHandle.getFileHandle(entry.name, { create: true });

      // 3. Stream the data
      const writable = await targetFileHandle.createWritable();
      await writable.write(file);
      await writable.close();

    } else if (entry.kind === 'directory') {
      // 1. Create a matching subdirectory in the target
      const newTargetDirHandle = await targetHandle.getDirectoryHandle(entry.name, { create: true });
      const newSourceDirHandle = entry as FileSystemDirectoryHandle;

      // 2. Recurse into the subdirectory
      await copyDirectory(newSourceDirHandle, newTargetDirHandle);
    }
  }
}
```

## Storage management and debugging

### OPFS storage quotas

OPFS shares the browser's overall storage quota for your origin alongside IndexedDB, the Cache API, and local storage. You can check the current usage and available quota using the Storage Manager API's `estimate()` method.

If your application attempts to write data that exceeds the remaining quota, the write operation fails and the browser throws a `QuotaExceededError` (`DOMException`). The file system does not truncate the file or partially write the data; the promise simply rejects.

```ts
async function checkStorageQuota(): Promise<void> {
  if (navigator.storage && navigator.storage.estimate) {
    const { quota, usage } = await navigator.storage.estimate();

    const usageMb = (usage ?? 0) / (1024 * 1024);
    const quotaMb = (quota ?? 0) / (1024 * 1024);
    const percentage = ((usage ?? 0) / (quota ?? 1)) * 100;

    console.log(`Usage: ${usageMb.toFixed(2)} MB (${percentage.toFixed(1)}%)`);
    console.log(`Total Quota: ${quotaMb.toFixed(2)} MB`);
  }
}
```

### Eviction policies and persistent storage

The browser does not evict individual files within your OPFS to make room for new ones. Instead, if the user's underlying device runs low on disk space, the browser reclaims storage by evicting data based on a Least Recently Used (LRU) policy.

This eviction is strictly all-or-nothing per origin. If your origin is selected for eviction, the browser deletes the entire OPFS, your entire IndexedDB instance, and all Cache API data simultaneously.

To prevent the browser from silently clearing your OPFS when the device is under storage pressure, request persistent storage.

```ts
async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage && navigator.storage.persist) {
    const isPersistent = await navigator.storage.persist();
    console.log(`Storage is persistent: ${isPersistent}`);
    return isPersistent;
  }
  return false;
}
```

If the user grants permission, or the browser grants it automatically based on site engagement metrics, the browser will not evict your origin's data without explicit user intervention.

### How to debug OPFS in the browser

Unlike IndexedDB or Local Storage, the OPFS is not natively visible in the **Storage** tab of Chrome DevTools or Firefox. Because OPFS is a sandboxed, low-level virtual file system, browsers do not expose its contents by default.

Install the OPFS Explorer extension from the Chrome Web Store to inspect and debug OPFS in Chrome:

1. Open Chrome DevTools (`F12` or `Cmd+Option+I`).
2. Navigate to the new **OPFS Explorer** tab.
3. The extension will automatically analyze the OPFS for the current origin and display the file hierarchy.

From this interface, you can click on any file to download its contents to your local machine, or delete files and directories to reset your application's state.

## Appendices

### Integrate SQLite with OPFS

If your application needs relational queries and file-oriented database performance, SQLite with OPFS is an option to consider. The official `@sqlite.org/sqlite-wasm` package includes an OPFS VFS. This example uses the standard `opfs` VFS through `OpfsDb` in a Web Worker; it requires a cross-origin-isolated page served with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers.

Traditional browser storage mechanisms like IndexedDB are asynchronous and key-value based, which conflicts with SQLite's architecture. SQLite is written in C and expects a traditional, synchronous file system (a Virtual File System, or VFS) to execute queries efficiently. The OPFS `SyncAccessHandle` (used in Web Workers) perfectly matches this requirement.

The code below must run inside a Web Worker.

```ts
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

async function initializePersistentDatabase(): Promise<void> {
  // Initialize the SQLite Wasm module
  const sqlite3 = await sqlite3InitModule();

  // Check if the OPFS Virtual File System is supported in this browser
  if (sqlite3.oo1.OpfsDb) {
    // Instantiate a database utilizing the OPFS backend
    const db = new sqlite3.oo1.OpfsDb('/my-app-database.sqlite3');
    console.log('Database created/opened successfully in OPFS.');

    // Execute standard synchronous SQL commands
    db.exec('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT)');
    db.exec("INSERT INTO users(name) VALUES('Grace Hopper')");

    // Retrieve data
    const results = db.exec({
      sql: 'SELECT * FROM users',
      rowMode: 'object',
      returnValue: 'resultRows'
    });

    console.log(results);
  } else {
    console.warn('OPFS is not supported; falling back to memory database.');
    const db = new sqlite3.oo1.DB();
  }
}

```

### When to migrate from IndexedDB to OPFS

You do not always need to migrate from IndexedDB to OPFS. They serve different purposes, and many applications use both simultaneously. You should migrate data to OPFS when:

1. **You need a real relational database (SQLite):** IndexedDB is a NoSQL key-value store. If your application needs complex SQL queries, JOINs, or triggers, you can run a WebAssembly build of SQLite and use OPFS through a VFS for file-backed storage in the browser.
2. **You are storing large binary blobs:** IndexedDB can store `Blob` and `ArrayBuffer` objects, but its record-based API is not designed for in-place byte updates to a large file. OPFS may perform better for large files or partial updates, but results depend on the browser and workload, so benchmark with representative data.
3. **You need byte-level updates:** If a 500 MB file is stored as a single IndexedDB value and you need to change a few bytes in the middle, you generally need to read and rewrite the whole value. OPFS lets you seek to a byte offset and overwrite only the changed bytes.

**When to stick with IndexedDB:** Keep using IndexedDB for structured JSON data, lightweight user settings, offline request queues, and simple key-value caching where the payload size is small.

### How to migrate data from IndexedDB to OPFS

If you determine that your files or large binary objects are better suited for OPFS, you can write a migration script that runs on startup. This script opens the IndexedDB database, extracts the stored files, writes them to OPFS, and then cleans up the IndexedDB records.

Here is a programmatic example of how to migrate a store of `Blob` objects from IndexedDB into OPFS:

Calling `indexedDB.open()` without a version opens the existing database at its current version, or creates it at version 1 if it does not exist. This example expects `large-files-store` to already exist; a newly created database needs an `onupgradeneeded` handler to create that object store before the migration can run.

```ts
async function migrateIdbToOpfs(): Promise<void> {
  const opfsRoot = await navigator.storage.getDirectory();

  // 1. Open your existing IndexedDB
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('my-legacy-database');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  try {
    const storeName = 'large-files-store';
    const keys = await requestToPromise(
      db.transaction(storeName, 'readonly').objectStore(storeName).getAllKeys()
    );

    for (const key of keys) {
      // Read each blob in its own transaction so OPFS writes do not hold an IndexedDB transaction open
      const fileData = await requestToPromise(
        db.transaction(storeName, 'readonly').objectStore(storeName).get(key)
      ) as Blob;
      const fileKey = key.toString(); // e.g., "video-chunk-1.mp4"

      const opfsFileHandle = await opfsRoot.getFileHandle(fileKey, { create: true });
      const writableStream = await opfsFileHandle.createWritable();
      await writableStream.write(fileData);
      await writableStream.close();

      // Delete the source only after the OPFS write has committed
      const deleteTransaction = db.transaction(storeName, 'readwrite');
      deleteTransaction.objectStore(storeName).delete(key);
      await transactionToPromise(deleteTransaction);

      console.log(`Migrated ${fileKey} to OPFS and removed it from IndexedDB.`);
    }

    console.log('Migration complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    db.close();
  }
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
  });
}

```
