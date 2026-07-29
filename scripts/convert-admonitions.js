import fs from 'fs/promises';
import path from 'path';

async function *walk(dir) {
  const entries = await fs.opendir(dir);
  for await (const d of entries) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile() && (entry.endsWith('.md') || entry.endsWith('.mdx'))) yield entry;
  }
}

async function processFiles(directory) {
  // Matches:
  // !!! <type> <title>
  // <content>
  // !!!
  const admonitionRegex = /^!!!\s*([a-zA-Z0-9_-]+)(?:\s+(.*?))?\n([\s\S]*?)^!!!/gm;

  let totalReplaced = 0;
  let filesModified = 0;

  for await (const file of walk(directory)) {
    const originalContent = await fs.readFile(file, 'utf-8');
    
    let replacedCount = 0;
    const newContent = originalContent.replace(admonitionRegex, (match, type, rawTitle, content) => {
      replacedCount++;
      
      // Clean up the title (remove **, __, and trailing colons)
      let title = rawTitle ? rawTitle.trim() : '';
      title = title.replace(/^[\*\*_]+|[\*\*_]+$/g, ''); // Remove surrounding ** or __
      title = title.replace(/:$/, ''); // Remove trailing colon
      title = title.trim();
      
      // Wrap paragraphs. 
      const paragraphs = content.trim().split(/\n\s*\n/);
      const htmlContent = paragraphs.map(p => {
        const trimmed = p.trim();
        if (trimmed.startsWith('<')) return `\t${trimmed}`; // already HTML
        // Replace single inner newlines with a space or keep them (browser treats as space)
        return `\t<p>${trimmed}</p>`;
      }).join('\n');

      let result = `<custom-admonition type="${type}"`;
      if (title) {
        result += ` title="${title}"`;
      }
      result += `>\n${htmlContent}\n</custom-admonition>`;
      return result;
    });

    if (replacedCount > 0) {
      await fs.writeFile(file, newContent, 'utf-8');
      filesModified++;
      totalReplaced += replacedCount;
      console.log(`Updated ${replacedCount} admonition(s) in ${file}`);
    }
  }

  console.log(`\nDone! Replaced ${totalReplaced} admonitions across ${filesModified} files.`);
}

const targetDir = process.argv[2] || process.cwd();
console.log(`Scanning directory: ${targetDir}`);
processFiles(targetDir).catch(console.error);
