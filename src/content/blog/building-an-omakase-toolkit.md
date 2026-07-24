---
title: Building An Omakase Toolkit
date: 2099-12-03
tags:
  - Research
---


## **What Is Omakase?**

> The phrase omakase (お任せ), literally 'I leave it up to you', is most commonly used when dining at Japanese restaurants where the customer leaves it up to the chef to select and serve seasonal specialties.

[Wikipedia](https://en.wikipedia.org/wiki/Omakase)

In the context of web development, an "omakase toolkit" refers to a curated set of tools, libraries, and frameworks that a developer or team chooses to use for building web applications. You trade a ready-made, opinionated set of tools that work well together, for a less flexible but more streamlined development.

The best example of such a toolkit is [Ruby on Rails](https://rubyonrails.org/), which provides a comprehensive framework for building web applications with a strong emphasis on convention over configuration.

The goal of an omakase toolkit is to streamline the development process by providing a well-integrated set of tools that work seamlessly together, allowing developers to focus on building features rather than worry about tool compatibility and configuration. It also encourages best practices and helps maintain consistency across projects.

This is different from the starter kit approach, where developers pick and choose individual tools based on their specific needs and preferences, often leading to a more customized but piecemeal setup.

## **Getting started**

I chose to name my omakase toolkit "Omoikane", after the ship's AI in the Nadesico anime and manga series. Omoikane is also the Shinto deity of wisdom and intelligence.

## **Convention over Configuration**

One of the key principles of an omakase toolkit is "convention over configuration." This means that the toolkit provides sensible defaults and conventions for how things should be done, reducing the need for extensive configuration and boilerplate code.

For example, in a web application built with Omoikane, you might have a specific folder structure, naming conventions, and built-in best practices that guide your development process. This allows developers to focus on building features rather than spending time on setup and configuration.

Likewise for database design, Omoikane provides conventions for naming tables, columns, and relationships, making it easier to work with the database without having to define everything from scratch.

## **Tool Selection**

The idea is to choose a set of tools that work well together and cover the essential aspects of web development. Here are some considerations for each category.

This experiment also allows me to explore and use new technologies, like Fastify and Jotai, that I haven't used before.

### Typescript

All code is written in TypeScript to ensure type safety and better developer experience.

Working with Typescript provides several benefits:

* **Type Safety:** Typescript adds static typing to JavaScript, which helps catch errors at compile time rather than runtime. This can lead to more robust and reliable code.
* **Improved Developer Experience:** Typescript offers features like autocompletion, type inference, and better navigation in code editors, which can enhance productivity and reduce the likelihood of bugs.
* **Better Documentation:** Types and interfaces serve as a form of documentation, making it easier for developers.
* **Gradual Migration:** The ability to import Javascript code into the project allows for gradual migration of existing codebases.

Yes, Typescript requires a build process, but we're running a build process anyways, so this is not a significant drawback.

### Frontend Framework: React

Choosing React as the frontend framework wasn't an easy choice.

While Vue and Svelte are also excellent options, React's vast ecosystem, strong community support, and flexibility make it a solid choice for building complex web applications.

#### State Management: Jotai

Rather than use the native state management (useState or useReducer) or heavy libraries like Redux, I chose **Jotai**.

**Why Jotai?**

Jotai relies on an **Atomic** model. Instead of a single giant state tree (Redux) or prop-drilling hell, state is broken down into tiny, independent units called "atoms". Components subscribe only to the specific atoms they need, which dramatically reduces unnecessary re-renders compared to React Context.

**How it works:**

1. **Define an Atom:** Atoms are defined outside of your components, usually in src/client/stores/.
2. **Use in Component:** You use the useAtom hook, which feels exactly like useState, but the state is shared globally across the app.

**Example: A Theme Toggler:**

```ts
// src/client/stores/theme.atoms.ts
import { atom } from 'jotai';

// 1. The primitive atom
export const themeModeAtom = atom<'light' | 'dark'>('light');

// 2. A derived atom (Read-only)
// This automatically updates whenever themeModeAtom changes.
// It acts like a "computed property" in Vue or MobX.
export const isDarkAtom = atom((get) => get(themeModeAtom) === 'dark');
```

```tsx
// src/client/components/ThemeToggle.tsx
import { useAtom } from 'jotai';
import { themeModeAtom, isDarkAtom } from '../stores/theme.atoms';

export const ThemeToggle = () => {
  // 3. Read and write state just like useState
  const [mode, setMode] = useAtom(themeModeAtom);
  const [isDark] = useAtom(isDarkAtom); // Derived atoms are read-only

  const toggle = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <button
      onClick={toggle}
      className={isDark ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}
    >
      Current mode: {mode}
    </button>
  );
};
```

This approach decouples state logic from UI components without the boilerplate of Reducers, Actions, or Providers.

### Backend Framework: Fastify

For the backend, I selected Fastify over Express or NestJS.

* **Performance:** As the name implies, it has extremely low overhead.
* **Schema-Based Validation:** Fastify treats JSON schemas as first-class citizens. This allows us to validate inputs and serialize outputs efficiently.
* **Type Sharing:** By combining Fastify with tools like zod or @fastify/type-provider-typebox, we can share TypeScript types between the frontend and backend, creating end-to-end type safety without the complexity of GraphQL.

### Data Layer: Active Record with MikroORM

While Prisma is the darling of the modern TypeScript ecosystem, it strictly enforces a Data Mapper pattern. This often leads to "Anemic Domain Models"—where your database entities are just dumb objects, and all your business logic is scattered across services or controllers.

To capture the true spirit of Rails, I want my data to have behavior. I want to call user.promote() or order.calculateTotal() directly on the object. I want the Active Record pattern.

For Omoikane, I chose [MikroORM](https://mikro-orm.io/).

MikroORM supports the Active Record pattern out of the box while leveraging TypeScript's decorators to ensure strictly typed entities. It allows us to encapsulate business logic within the class itself, keeping the codebase clean and object-oriented.

Here is how an entity looks in Omoikane:

```ts
import { Entity, Property, BaseEntity } from '@mikro-orm/core';

@Entity()
export class User extends BaseEntity {
  @Property()
  email!: string;

  @Property()
  role: 'user' | 'admin' = 'user';

  @Property()
  isActive: boolean = false;

  constructor(email: string) {
    super();
    this.email = email;
  }

  // Business logic lives ON the model, not in a service
  activate() {
    if (!this.email.includes('@')) {
       throw new Error("Invalid email");
    }
    this.isActive = true;
  }

  promoteToAdmin() {
    if (!this.isActive) {
      throw new Error("Cannot promote inactive user");
    }
    this.role = 'admin';
  }
}
```

This drastically simplifies the usage in our Fastify controllers. We don't need to inject a repository or a service just to perform basic domain operations. We simply interact with the object:

```ts
// Usage in a controller
const user = await User.findOne({ email: 'shinji@nadesico.jp' });

if (user) {
  // Logic is encapsulated
  user.promoteToAdmin();

  // The Active Record "save" functionality
  await user.save();
}
```

This approach restores the "Convention over Configuration" feel of Rails, where the model is the source of truth for both data structure and business rules.

I am particularly excited about the ability to add extensions like [pgvector](https://www.google.com/search?q=https://www.pgvector.org/) for vector similarity search, which is useful for AI applications.

### Communication: React Email & Nodemailer

Rails made sending emails trivial with **Action Mailer**. In the JavaScript ecosystem, this has historically been painful, often requiring developers to manage raw HTML strings or archaic templating engines like Handlebars or EJS.

For Omoikane, we bridge this gap using [React Email](https://react.email/).

This library allows us to write email templates using the exact same React components we use for the frontend. It handles the messy business of converting modern CSS/HTML into the table-based layouts required by legacy email clients (Outlook, Gmail).

We combine this with [Nodemailer](https://nodemailer.com/) to create a unified sending interface.

**The Convention:**

Mailers live in src/server/mailers and extend a base class to handle rendering and transport.

**The Template:**

```tsx
// src/server/mailers/templates/WelcomeEmail.tsx
import { Html, Button, Text } from "@react-email/components";
import * as React from 'react';

export const WelcomeEmail = ({ name }: { name: string }) => (
  <Html>
    <Text>Welcome, {name}!</Text>
    <Button
      href="https://omoikane.dev"
      style={\{ background: "#000", color: "#fff", padding: "12px 20px" \}}
    >
      Get Started
    </Button>
  </Html>
);
```

**The Mailer:**

```ts
// src/server/mailers/UserMailer.ts
import { BaseMailer } from './BaseMailer'; // Abstract wrapper around Nodemailer
import { WelcomeEmail } from './templates/WelcomeEmail';

export class UserMailer extends BaseMailer {
  async sendWelcome(user: User) {
    // The BaseMailer handles rendering the component to HTML
    await this.mail({
      to: user.email,
      subject: 'Welcome aboard',
      component: <WelcomeEmail name={user.name} />
    });
  }
}
```

This brings the "View" and "Controller" pattern of Action Mailer to our TypeScript backend, providing type safety for both the email logic and the template props.

### Background Jobs: Active Job with BullMQ

In a robust web application, you shouldn't block the HTTP request for heavy tasks like sending emails, generating PDFs, or processing uploads. Rails solves this with **Active Job**.

For Omoikane, we implement this using [BullMQ](https://docs.bullmq.io/) (a robust Redis-based queue system).

We create a `BaseJob` abstraction that handles the queue connections and worker instantiation, so developers only focus on the handle method.

**The Base Job:**

```ts
// src/server/jobs/BaseJob.ts
import { Queue, Worker, Job } from 'bullmq';

// In production, use a shared Redis connection
const connection = { host: 'localhost', port: 6379 };

export abstract class BaseJob {
  static queueName = 'default';

  // The logic to execute
  abstract handle(data: any): Promise<void>;

  // Dispatch a job to the queue (Active Job style)
  static async dispatch<T>(this: new () => BaseJob, data: T) {
    const self = this as any;
    const queue = new Queue(self.queueName, { connection });
    await queue.add(self.name, data);
    await queue.close();
  }

  // Start a worker for this job type
  static work() {
    const self = this as any;
    new Worker(self.queueName, async (job: Job) => {
      const instance = new self();
      await instance.handle(job.data);
    }, { connection });
  }
}
```

**The Job Implementation:**

```ts
// src/server/jobs/WelcomeEmailJob.ts
import { BaseJob } from './BaseJob';
import { UserMailer } from '../mailers/UserMailer';

export class WelcomeEmailJob extends BaseJob {
  static queueName = 'mailers';

  async handle(data: { email: string }) {
    // This runs in the background worker
    const mailer = new UserMailer();
    await mailer.send(data.email);
  }
}
```

**Usage in Controller:**

```ts
// Fire and forget!
await WelcomeEmailJob.dispatch({ email: user.email });
```

### File Storage: Active Storage

Handling file uploads in Node.js can be messy. You have to deal with multipart streams, temp files, and different cloud providers. Rails simplified this with **Active Storage**, and Omoikane follows suit.

We use **@fastify/multipart** for high-performance streaming uploads and pair it with a standardized **StorageService** and **Attachment** entity.

#### The Attachment Entity

Instead of storing file paths directly on your User table (e.g., avatar_url), we point to a dedicated Attachment record. This keeps metadata centralized.

```ts
// src/server/modules/storage/Attachment.entity.ts
import { Entity, Property, BaseEntity } from '@mikro-orm/core';

@Entity()
export class Attachment extends BaseEntity {
  @Property()
  filename!: string;

  @Property()
  mimeType!: string;

  @Property()
  size!: number;

  @Property()
  path!: string; // The S3 key or local file path

  @Property()
  url!: string; // Publicly accessible URL

  constructor(filename: string, mimeType: string, size: number, path: string) {
    super();
    this.filename = filename;
    this.mimeType = mimeType;
    this.size = size;
    this.path = path;
    // In a real app, URL generation depends on the driver (S3 signed URL vs static)
    this.url = '/uploads/${filename}';
  }
}
```

#### The Storage Service

We define a service that handles the raw stream from Fastify and pipes it to the configured provider (Local Disk for dev, S3 for prod).

```ts
// src/server/modules/storage/StorageService.ts
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { MultipartFile } from '@fastify/multipart';
import { Attachment } from './Attachment.entity';

export class StorageService {
  private uploadDir = path.join(process.cwd(), 'public/uploads');

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: MultipartFile): Promise<Attachment> {
    const filename = `${Date.now()}-${file.filename}`;
    const filePath = path.join(this.uploadDir, filename);

    // Stream the file to disk (or S3 in production)
    await pipeline(file.file, fs.createWriteStream(filePath));

    // Return the agnostic Entity
    const attachment = new Attachment(
      filename,
      file.mimetype,
      0, // Size would be calculated here
      filePath
    );

    // In a real app, you'd persist this using the EntityManager
    return attachment;
  }
}
```

#### Usage in Controller

```ts
// src/server/modules/users/user.controller.ts
import { StorageService } from '../storage/StorageService';

export async function uploadAvatar(req: FastifyRequest, reply: FastifyReply) {
  const data = await req.file(); // Standard Fastify Multipart API
  if (!data) throw new Error("No file uploaded");

  const storage = new StorageService();
  const attachment = await storage.upload(data);

  // Associate with User (Active Record style)
  req.user.avatar = attachment;
  await req.user.save();

  return reply.send(attachment);
}
```

### Real-Time: Action Cable with Fastify Websocket

Modern web apps need to feel alive. Users expect real-time notifications, chat messages, and live updates. Rails solves this with **Action Cable**.

In Omoikane, we leverage [@fastify/websocket](https://github.com/fastify/fastify-websocket). While Fastify provides the low-level plumbing, we need an abstraction to make it manageable. We implement a **Channel** pattern.

**1. The Channel Abstraction:**

We create a base class that handles connection management and broadcasting.

```ts
// src/server/channels/BaseChannel.ts
import { SocketStream } from '@fastify/websocket';
import { FastifyRequest } from 'fastify';

// A simple in-memory store for active connections.
// In production, you would use Redis Pub/Sub to scale across nodes.
const connections = new Set<any>();

export abstract class BaseChannel {
  protected connection: any;
  protected req: FastifyRequest;

  constructor(connection: SocketStream, req: FastifyRequest) {
    this.connection = connection.socket;
    this.req = req;
    connections.add(this.connection);

    this.connection.on('close', () => connections.delete(this.connection));
  }

  abstract handle(message: any): Promise<void>;

  // Broadcast to all connected clients in this channel
  static broadcast(data: any) {
    connections.forEach(socket => {
      if (socket.readyState === 1\) { // OPEN
        socket.send(JSON.stringify(data));
      }
    });
  }
}
```

**2. A Concrete Channel:**

Here is a ChatChannel that listens for messages and broadcasts them to everyone.

```ts
// src/server/channels/ChatChannel.ts
import { BaseChannel } from './BaseChannel';

export class ChatChannel extends BaseChannel {
  async handle(message: any) {
    // When a client sends a message, broadcast it to everyone else
    console.log('Received: ${message}');
    ChatChannel.broadcast({
      event: 'new\_message',
      data: message
    });
  }
}
```

**3. The Frontend Hook:**

On the client, we expose a useChannel hook. This manages the WebSocket connection lifecycle, automatically connecting on mount and disconnecting on unmount.

```ts
// src/client/hooks/useChannel.ts
import { useEffect, useRef } from 'react';

export function useChannel(url: string, onMessage: (data: any) => void) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Connect
    const socket = new WebSocket(url);
    socketRef.current = socket;

    // 2. Listen
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    // 3. Cleanup
    return () => {
      socket.close();
    };
  }, [url]);

  const send = (data: any) => {
    socketRef.current?.send(JSON.stringify(data));
  };

  return { send };
}
```

### Authentication: The Guard

Rails has Devise. Omoikane has **The Guard**.

We don't rely on massive, opaque auth libraries that are hard to customize. Instead, we compose robust, industry-standard primitives into a standardized **AuthService**.

* **Local Auth:** We use **Argon2** (the winner of the Password Hashing Competition) for state-of-the-art security.
* **Sessions:** We use **@fastify/secure-session** for encrypted, HTTP-only cookies.
* **OAuth:** We use **@fastify/oauth2** to handle the handshake with Google and GitHub.

**Prerequisites: Provider Credentials:**

To use social login, you must register your application with Google Cloud Console and GitHub Developer Settings. You cannot use Omoikane's defaults here; you must generate your own CLIENT_ID and CLIENT_SECRET for each provider.

Configure these in your .env file (and ensure it is added to .gitignore):

GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret

#### The User Entity (Updated)

We store the hash for local auth and IDs for social providers.

```ts
// src/server/modules/users/user.entity.ts
import { Entity, Property, BaseEntity } from '@mikro-orm/core';

@Entity()
export class User extends BaseEntity {
  @Property() email!: string;

  // Local Auth
  @Property({ hidden: true, nullable: true })
  passwordHash?: string;

  // Social Auth
  @Property({ nullable: true }) googleId?: string;
  @Property({ nullable: true }) githubId?: string;

  // ... other fields
}
```

#### The Auth Service

This service handles the core logic: hashing passwords, verifying credentials, and finding/creating users from OAuth profiles.

```ts
// src/server/modules/auth/AuthService.ts
import argon2 from 'argon2';
import { User } from '../users/user.entity';
import { em } from '../../db'; // Global Entity Manager instance

export class AuthService {
  // Local: Login
  async validateLocal(email: string, plain: string): Promise<User | null> {
    const user = await em.findOne(User, { email });
    if (!user || !user.passwordHash) return null;

    const valid = await argon2.verify(user.passwordHash, plain);
    return valid ? user : null;
  }

  // Local: Register
  async registerLocal(email: string, plain: string): Promise<User> {
    const hash = await argon2.hash(plain);
    const user = new User(email);
    user.passwordHash = hash;
    await em.persistAndFlush(user);
    return user;
  }

  // OAuth: Find or Create
  async handleProvider(provider: 'google' | 'github', profile: any): Promise<User> {
    const email = profile.email;
    const providerId = profile.id;

    // 1. Try to find by Provider ID
    let user = await em.findOne(User, { ['${provider}Id']: providerId });
    if (user) return user;

    // 2. Try to find by Email (Link accounts)
    user = await em.findOne(User, { email });
    if (user) {
      user['${provider}Id'] = providerId;
      await em.flush();
      return user;
    }

    // 3. Create new user
    user = new User(email);
    user['${provider}Id'] = providerId;
    await em.persistAndFlush(user);
    return user;
  }
}
```

#### The Auth Controller (Routes)

We configure the routes to handle the login form and the OAuth redirects.

```ts
// src/server/modules/auth/auth.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './AuthService';

const auth = new AuthService();

// POST /auth/login
export async function login(req: FastifyRequest, reply: FastifyReply) {
  const { email, password } = req.body as any;
  const user = await auth.validateLocal(email, password);

  if (!user) return reply.code(401).send({ error: "Invalid credentials" });

  // Set encrypted session cookie
  req.session.set('userId', user.id);
  return reply.send({ success: true, user });
}

// GET /auth/callback/google
export async function googleCallback(req: FastifyRequest, reply: FastifyReply) {
  // @fastify/oauth2 attaches the token to the request
  const token = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
  const profile = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token.token.access_token}` }
  }).then(r => r.json());

  const user = await auth.handleProvider('google', profile);

  req.session.set('userId', user.id);
  return reply.redirect('/dashboard');
}
```

### Infrastructure: Zero-Config Services

To truly fulfill the promise of "Omakase," a developer shouldn't have to spend hours installing PostgreSQL and Redis on their local machine. Dependencies should be declarative, not manual.

We include a `docker-compose.yml` file in the base template. This allows a developer to spin up the entire data infrastructure with a single command: `docker compose up -d`. This requires only that Docker is installed on their machine.

To prevent conflicts with any local instances of Postgres or Redis you might already have running (which would cause the container to fail), we map the containers to higher, non-standard ports on your host machine.

```yaml
# docker-compose.yml
version: '3.8'
services:
  # The Primary Database (MikroORM)
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: omoikane
      POSTGRES_PASSWORD: password
      POSTGRES_DB: omoikane_dev
    ports:
      # Map container port 5432 to host port 54320
      # avoiding conflicts with local Postgres installations
      - "54320:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # The Job Queue Store (BullMQ)
  redis:
    image: redis:alpine
    ports:
      # Map container port 6379 to host port 63790
      # avoiding conflicts with local Redis installations
      - "63790:6379"

volumes:
  postgres_data:
```

By standardizing these ports and credentials in the template's .env file, the application connects automatically the moment the containers are running.

### Build Tool: Vite

Vite is chosen as the build tool for its speed and simplicity. It leverages native ES modules and provides a fast development server with hot module replacement.

#### The Secret Sauce: A Custom Vite Plugin

While Vite is fast, its configuration file can quickly become cluttered with plugins and path aliases. To adhere to our "zero-config" goal, I am creating a custom Vite plugin: vite-plugin-omoikane.

This plugin acts as the bridge between our specific toolkit conventions and Vite's build process. It abstracts away the complexity of setting up React, proxies, and path resolution.

Here is what the implementation looks like:

```ts
// packages/vite-plugin-omoikane/src/index.ts
import { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export function omoikane(): Plugin[] {
  return [
    // 1. Automatically include the React plugin so the user doesn't have to
    react(),
    {
      name: 'vite-plugin-omoikane',
      config: () => ({
        resolve: {
          // 2. Enforce the convention that "@" always resolves to the src directory
          alias: {
            '@': path.resolve(process.cwd(), './src'),
          },
        },
        server: {
          port: 3000,
          // 3. Automatically proxy API requests to the Fastify backend
          // avoiding CORS issues during development
          proxy: {
            '/api': {
              target: 'http://localhost:4000',
              changeOrigin: true,
            },
          },
        },
      }),
    },
  ];
}
```

This drastically simplifies the user's vite.config.ts. Instead of 20 lines of boilerplate configuration, the end developer simply imports the Omoikane plugin:

```ts
// vite.config.ts
import { omoikane } from 'omoikane/vite';

export default {
  plugins: [omoikane()]
}
```

By owning the plugin, we can update build requirements, add new transpilers, or change proxy settings centrally. All projects using the toolkit get the updates simply by upgrading the omoikane dependency.

#### Production Considerations: No Proxy Needed

It is important to note that the `server.proxy` configuration above only applies to the **development server**. In production, we don't run two separate servers (Vite and Fastify). Instead, we use a "Monolithic" approach where Fastify serves the static frontend files generated by Vite.

In your `src/server/index.ts`, you would typically include logic like this to serve the built assets:

```ts
import fastifyStatic from '@fastify/static';
import path from 'path';

// Serve the static files created by 'vite build' (usually in dist/client)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../client/dist'),
});

// Catch-all for React Router (Single Page App behavior)
fastify.setNotFoundHandler((req, res) => {
  res.sendFile('index.html');
});
```

This unifies the frontend and backend under a single origin, eliminating CORS issues and the need for a proxy in the production environment.

### Testing: Playwright & Vitest

Testing isn't an afterthought; it's a first-class citizen.

#### Unit Testing: Vitest

For unit testing, **Vitest** is the logical choice. Since we are already using Vite, Vitest allows us to reuse the exact same configuration pipeline. We simply extend our vite.config.ts to include the test configuration.

```ts
// vite.config.ts
/// <reference types="vitest" />
import { omoikane } from 'omoikane/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [omoikane()],
  // Vitest configuration is typed automatically via the reference above
  test: {
    globals: true, // Use describe/it/expect without imports
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/shared/tests/setup.ts'],
  },
});
```

#### E2E Testing: Playwright

I chose to do end-to-end testing with **Playwright**, which provides a powerful and flexible framework for testing web applications across different browsers.

One critical feature of Playwright is its ability to spin up your local server before running tests. This fits perfectly with our unified build process.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  webServer: {
    // This command starts both our React frontend and Fastify backend
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

### UI Design: Storybook

Storybook is used for developing and testing UI components in isolation. It allows for better component organization and documentation.

### Styling: Tailwind CSS

For styling, we choose Tailwind CSS. It aligns perfectly with our "Convention over Configuration" philosophy by providing a constraint-based design system out of the box.

* **Utility-First**: We style components directly in the markup, which pairs excellently with React's component model (as seen in our DatePicker wrapper).
* **Design Tokens**: We configure our theme (colors, spacing, fonts) in tailwind.config.js, acting as the single source of truth for the design system.

#### Configuration & Customization (Tailwind v3)

The CLI automatically creates the `tailwind.config.js` file.

We explicitly choose Tailwind CSS v3 over v4 for Omoikane. While v4 is the future, Omoikane optimizes for stability and "boring" tech:

* **Tooling Maturity**: The VS Code IntelliSense experience is currently most robust with the tailwind.config.js format.
* **Ecosystem Compatibility**: The vast majority of third-party plugins and component libraries in the React ecosystem are built for the v3 configuration engine.
* **Predictability**: v4 introduces a CSS-first configuration that, while powerful, represents a paradigm shift. We prefer the known stability of the JavaScript-based configuration for now.

**Why Tailwind and not Open Props?**

Tailwind requires learning utility names (px-4), whereas Open Props allows you to use standard CSS (padding: var(--size-3)). However, we choose Tailwind to solve the **"Tax of Naming Things."**

1. **The Naming Fatigue:** With Open Props, you must invent class names for every element (e.g., `.profile-wrapper`, `.card-inner`, `.flex-container`). This adds cognitive load and forces you to maintain a mapping between your markup and your stylesheet. Tailwind removes this step entirely.
2. **Context Switching:** In a component-driven architecture, jumping between a .tsx file and a .css file breaks flow. Tailwind allows you to style and structure simultaneously in a single file.
3. **Predictability:** Even without IDE IntelliSense (e.g., in Emacs or older Vim), Tailwind's rigid scale is easier to internalize than arbitrary CSS. Once you know the pattern `{property}-{size}` or `{property}-{color}-{shade}` you can type px-4 or text-blue-500 with high confidence, whereas custom CSS classes often require checking the stylesheet to recall if you named it .btn-primary or .primary-button.
4. **Strict Consistency:** While Open Props provides variables, it doesn't prevent a developer from writing padding: `calc(var(--size-3) + 2px)`. Tailwind's utility classes enforce that *only* the defined scale can be used, preventing "magic numbers" from leaking into the codebase.

**Configuration & Customization:**

The CLI automatically creates the tailwind.config.js file. To implement corporate branding, you use the extend key. This allows you to add your specific colors and sizes without losing the default Tailwind utilities.

```ts
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Adds a new color family available as text-brand-light, bg-brand, etc.
      colors: {
        brand: {
          light: '#3ab7bf',
          DEFAULT: '#0e7490', // The default "brand" color
          dark: '#155e75',
        },
        // Semantic aliases
        primary: '#0e7490',
        secondary: '#64748b',
      },
      // Adds specific spacing values if the default scale isn't enough
      spacing: {
        '128': '32rem', // Enables w-128, p-128, etc.
      },
      // Custom fonts
      fontFamily: {
        sans: ['Graphik', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
```

```css
/* src/client/styles/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Alternative Path: Open Props & Layout Primitives

For teams that find Tailwind's non-standard syntax unacceptable, Omoikane offers an alternative styling strategy: **Open Props + Layout Primitives**.

This approach combines standard CSS variables (Open Props) with React components that handle all whitespace and positioning (Layout Primitives).

**1. The "Anti-Naming" Strategy:**

Instead of writing CSS classes for layout (.wrapper, .flex-row), you us:**
components.

* &lt;Stack>: Handles vertical rhythm.
* &lt;Cluster>: Handles horizontal groups.
* &lt;Grid>: Handles 2D layouts.

**The Trade-off: Extreme Rigidity:**

This is a "straitjacket" solution. While Tailwind restricts you to a *scale* of values, Layout Primitives restrict you to specific *combinations* of layout rules.

* **In Tailwind:** You can quickly add `mt-2` to a specific button to nudge it down.
* **In Layout Primitives:** You **cannot** do this. Margins on children are forbidden. The parent &lt;Stack> owns the whitespace. If you need a specific exception, you must either edit the &lt;Stack> component to support a new prop or create a entirely new component.

This enforces a level of consistency that is nearly impossible to break, but it removes the ability to make "quick fixes" in the UI.

// Example: No CSS classes used for layout
<Stack gap="3">
  <h2>Login</h2>
  {/* Visual styles (colors, fonts) use CSS Modules + Open Props */}
  <input className={styles.input} />
  <Cluster justify="between">
    <Button>Login</Button>
  </Cluster>
</Stack>

### Storybook Configuration: Zero-Config Vite Integration

Since Omoikane is built on Vite, our Storybook configuration is incredibly lean.

We use the @storybook/react-vite framework, which automatically reuses our existing Vite configuration (including aliases and plugins). This means we don't need to duplicate build logic.

```ts
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
```

We also configure the preview to include our global styles, ensuring components look exactly as they do in the app.

```ts
// .storybook/preview.tsx
import type { Preview } from "@storybook/react";
import '../src/client/styles/index.css'; // Global styles

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
```

#### Example: Documenting Wrappers

In Omoikane, we wrap third-party libraries to maintain control. Storybook becomes the living documentation for these wrappers, showing exactly how *our* application uses the library, rather than how the library generically works.

Here is an example of a Story for a custom DatePicker wrapper. It defines the specific "presets" our app allows, locking down the flexible API of the underlying library into a strict set of props.

```tsx
// src/client/components/DatePicker/DatePicker.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  // We document only the props we expose, not the full underlying library API
  argTypes: {
    value: { control: 'date' },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    placeholder: 'Select a start date',
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Select a start date',
    error: 'Date cannot be in the past',
  },
};
```

### Third-Party Component Integration

One of the risks of using an "omakase" toolkit is that you might feel locked into the provided tools. Omoikane mitigates this by embracing the broader React ecosystem, but it enforces strict conventions on how third-party libraries are integrated.

1. **Strict Type Safety:** All third-party libraries **must** have TypeScript definitions. If a library doesn't ship with types, you must install @types/library-name or create a definition file in src/shared/types.
2. **The Wrapper Pattern:** You should never import a third-party UI component (like a date picker or complex grid) directly into your page logic. Instead, wrap it in a custom component within src/client/components. This practice serves several critical functions:
   * **Prevent Vendor Lock-in:** Migrating to a different library later only requires refactoring one file, not every individual instance of the component.
   * **Enforce Design Consistency:** You can bake in your design system's specific Tailwind classes inside the wrapper, ensuring identical styling across the app.
   * **Limit API Surface:** It allows you to restrict the exposed props to only what your application supports, preventing accidental misuse.
   * **Simplify Maintenance:** If a library introduces breaking changes, you handle the translation layer once inside the wrapper.
3. **Isolation:** Create a Storybook story for your wrapper. This ensures the component works in isolation and allows you to swap out the underlying library later without refactoring your entire application.

#### Concrete Example: Wrapping react-datepicker

Here is what the Wrapper Pattern looks like in practice. We take a flexible library like react-datepicker and wrap it to enforce our design system and limit the API surface area.

```tsx
// src/client/components/DatePicker/DatePicker.tsx
import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// 1. Define a restricted interface. We intentionally DO NOT extend the full
// library props. We want to prevent developers from using arbitrary flags
// that might break our design system (e.g., inline styles or weird portals).
interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  error?: string;
  minDate?: Date;
}

// 2. The Wrapper Component
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder,
  error,
  minDate
}) => {
  return (
    <div className="flex flex-col">
      <ReactDatePicker
        selected={value}
        onChange={onChange}
        placeholderText={placeholder}
        minDate={minDate}
        // We apply our Tailwind classes here, completely hiding the
        // library's default styling logic from the consumer.
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm outline-none transition-all
          ${error
            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
          }
        `}
      />
      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
    </div>
  );
};
```

To make this easier, the CLI provides automation for installing libraries and ensuring their types are present.

### Logic Library Integration

Not all third-party tools are UI components. When integrating "pure logic" libraries—like **LangChain** for AI or **TensorFlow.js** for client-side ML—we do not use the Component Wrapper pattern. Instead, we use the **Service Pattern** (Backend) and the **Hook Pattern** (Frontend).

#### 1. Backend: The Service Pattern

If you are using a library like LangChain to process data on the server, encapsulate it in a **Service Class** within a module. This keeps your Fastify controllers clean and testable.

**Bad:** Importing LangChain directly inside a Fastify route handler.

**Good:** Encapsulating it in a dedicated service.

```ts
// src/server/modules/ai/LangChainService.ts
import { OpenAI } from "langchain/llms/openai";

export class LangChainService {
  private model: OpenAI;

  constructor() {
    this.model = new OpenAI({ temperature: 0.9 });
  }

  async generateSummary(text: string) {
    return await this.model.call(`Summarize this: ${text}`);
  }
}
```

#### 2. Frontend: The Hook Pattern

If you are using a library like TensorFlow.js that runs in the browser, encapsulate the loading state, initialization logic, and prediction methods inside a custom **React Hook**.

**Good:**

```ts
// src/client/hooks/useImageClassifier.ts
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { useState, useEffect } from 'react';

export const useImageClassifier = () => {
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);

  useEffect(() => {
    // Encapsulate the messy async loading logic here
    mobilenet.load().then(setModel);
  }, []);

  const classify = async (img: HTMLImageElement) => {
    if (!model) return null;
    return await model.classify(img);
  };

  return { classify, isReady: !!model };
};

// Summary of Conventions:
// * UI Libraries (DatePicker, Charts) -> Wrap in Components.
// * Logic Libraries (LangChain, TF.js) -> Wrap in Services (Backend) or Hooks (Frontend).
```

### Linting: The Omoikane Standard

We previously considered using Google's style guide, but their configuration packages are legacy and do not support the modern ESLint 9 "Flat Config" system natively.

Instead of fighting with compatibility layers, Omoikane defines its own **Shareable Config**. This extends the official 'typescript-eslint' recommended rules but adds our specific framework opinions (like React Hooks rules and Prettier integration).

This allows us to ship a single dev dependency, '@omoikane/eslint-config', which encapsulates all linting logic.

**The Configuration File:**

In a new Omoikane project, the 'eslint.config.js' is incredibly clean:

```ts
// eslint.config.js
import omoikane from '@omoikane/eslint-config';

export default [
  ...omoikane,
  {
    // Project specific overrides can go here
    ignores: ['dist', 'public'],
  }
];
```

**What's inside the package?**

Under the hood, our config composes the best-in-class tools:

```ts
// packages/eslint-config/index.js (The implementation)
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import globals from 'globals';

export default tseslint.config(
  // 1. Base JavaScript Recommendations
  js.configs.recommended,

  // 2. Strict TypeScript Rules
  ...tseslint.configs.recommended,

  // 3. React & Hooks Rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,

      // Omoikane Specific Opinions
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react/prop-types': 'off',
    },
  }
);
```

### The Glue: A Custom CLI

A true Omakase experience requires more than just a list of tools; it requires a way to weave them together effortlessly. Just as a chef doesn't ask you to chop your own vegetables, Omoikane shouldn't ask you to manually configure Webpack or set up folder structures.

To solve this, I am building a CLI tool using **Commander.js** for command handling and **@clack/prompts** for a beautiful, interactive terminal UI. We also use **degit** to efficiently clone our project templates.

To satisfy the "lazy developer" (efficiency expert) in all of us, we configure the package.json bin field to expose the binary as both omoikane and om. We also provide single-letter aliases for every command, so you can run om n my-app instead of omoikane new my-app.

The CLI handles the "boring" parts of development:

1. **Scaffolding:** om n &lt;project-name> clones the template, installs dependencies, and initializes the git repository.
2. **Smart Installation:** om a &lt;library> installs the package and automatically attempts to find and install the corresponding @types package, ensuring strict type safety compliance.
3. **Generators:** om g &lt;type> &lt;name> scaffolds architectural components. For example, om g mailer Welcome creates both the Mailer class and the React Email template automatically. It also handles resources like om g resource User.
4. **Shortcuts:** It abstracts complex underlying commands. Instead of remembering specific flags for database migrations, you simply run om db:migrate (mapped via package.json scripts).

This CLI is the mechanism that transforms "Convention over Configuration" from a philosophy into a tangible workflow. Here is a glimpse of how the entry point is structured:

```ts
#!/usr/bin/env node
import { Command } from 'commander';
import { intro, text, outro, spinner } from '@clack/prompts';
import color from 'picocolors';
import degit from 'degit';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs'; // Added for generators

const program = new Command();

program
  .name('omoikane')
  .description('The Omakase CLI for the discerning developer')
  .version('0.0.1');

program
  .command('new <project-name>')
  .alias('n') // Alias for lazy developers
  .description('Scaffold a new Omoikane project')
  .action(async (projectName) => {
    console.clear();
    intro(color.bgCyan(color.black(' OMOIKANE ')));

    const s = spinner();
    s.start('Scaffolding project structure');

    try {
      // Clone the template from the GitHub repository
      const emitter = degit('omoikane-stack/template#main', {
        cache: false,
        force: true,
      });

      await emitter.clone(projectName);

      // Initialize Git repository
      const projectPath = path.join(process.cwd(), projectName);
      execSync('git init', { cwd: projectPath, stdio: 'ignore' });
      execSync('git add .', { cwd: projectPath, stdio: 'ignore' });
      execSync('git commit -m "Initial commit from Omoikane CLI"', { cwd: projectPath, stdio: 'ignore' });

      s.stop('Project created and git initialized successfully');
    } catch (e) {
      s.stop('Failed to scaffold project', 1);
      console.error(e);
      process.exit(1);
    }

    outro(`You're all set! Run "cd ${projectName}" and enjoy.`);
  });

program
  .command('add <library>')
  .alias('a') // Alias for lazy developers
  .description('Install a third-party library with types')
  .action(async (library) => {
    const s = spinner();
    s.start(`Installing ${library}`);

    try {
      // Install the main library
      execSync(`npm install ${library}`, { stdio: 'ignore' });

      // Attempt to install types
      try {
        s.message(`Checking for @types/${library}...`);
        execSync(`npm install -D @types/${library}`, { stdio: 'ignore' });
        s.stop(`Installed ${library} and @types/${library}`);
      } catch (e) {
        // Types might be included in the main package or not exist
        s.stop(`Installed ${library} (Types not found or already included)`);
      }
    } catch (e) {
      s.stop(`Failed to install ${library}`, 1);
      console.error(e);
      process.exit(1);
    }
  });

program
  .command('generate <type> <name>')
  .alias('g') // Alias for lazy developers
  .description('Scaffold a new architectural component (mailer, resource)')
  .action(async (type, name) => {
    const s = spinner();
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
    const className = capitalize(name);

    if (type === 'mailer') {
      s.start(`Scaffolding ${className}Mailer...`);

      const mailerPath = path.join(process.cwd(), 'src/server/mailers');
      const templatesPath = path.join(mailerPath, 'templates');

      // Ensure directories exist
      if (!fs.existsSync(templatesPath)) {
        fs.mkdirSync(templatesPath, { recursive: true });
      }

      // 1. Generate the Template
      const templateCode = `
import { Html, Text } from "@react-email/components";
import * as React from 'react';

export const ${className}Email = () => (
  <Html>
    <Text>Hello from ${className}!</Text>
  </Html>
);
      `.trim();
      fs.writeFileSync(path.join(templatesPath, `${className}Email.tsx`), templateCode);

      // 2. Generate the Mailer Class
      const mailerCode = `
import { BaseMailer } from './BaseMailer';
import { ${className}Email } from './templates/${className}Email';

export class ${className}Mailer extends BaseMailer {
  async send(to: string) {
    await this.mail({
      to,
      subject: '${className} Notification',
      component: <${className}Email />
    });
  }
}
      `.trim();
      fs.writeFileSync(path.join(mailerPath, `${className}Mailer.ts`), mailerCode);

      s.stop(`Created src/server/mailers/${className}Mailer.ts`);

    } else if (type === 'resource') {
      s.start(`Scaffolding resource module: ${className}...`);
      // Logic for creating Entity, Controller, and Service would go here
      await new Promise(r => setTimeout(r, 800)); // Simulating work
      s.stop(`Created src/server/modules/${className.toLowerCase()}/`);

    } else if (type === 'job') {
      s.start(`Scaffolding job: ${className}Job...`);
      const jobsPath = path.join(process.cwd(), 'src/server/jobs');

      if (!fs.existsSync(jobsPath)) {
        fs.mkdirSync(jobsPath, { recursive: true });
      }

      const jobCode = `
import { BaseJob } from './BaseJob';

export class ${className}Job extends BaseJob {
  static queueName = 'default';

  async handle(data: any) {
    console.log('${className}Job processing:', data);
    // Add your background logic here
  }
}
      `.trim();
      fs.writeFileSync(path.join(jobsPath, `${className}Job.ts`), jobCode);

      s.stop(`Created src/server/jobs/${className}Job.ts`);

    } else if (type === 'storage') {
      s.start(`Scaffolding Active Storage...`);
      const storagePath = path.join(process.cwd(), 'src/server/modules/storage');

      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }

      // 1. Generate Entity
      const entityCode = `
import { Entity, Property, BaseEntity } from '@mikro-orm/core';

@Entity()
export class Attachment extends BaseEntity {
  @Property() filename!: string;
  @Property() mimeType!: string;
  @Property() size!: number;
  @Property() path!: string;
  @Property() url!: string;
}
      `.trim();
      fs.writeFileSync(path.join(storagePath, 'Attachment.entity.ts'), entityCode);

      // 2. Generate Service
      const serviceCode = `
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Attachment } from './Attachment.entity';

export class StorageService {
  async upload(file: any): Promise<Attachment> {
    // Implementation placeholder
    return new Attachment();
  }
}
      `.trim();
      fs.writeFileSync(path.join(storagePath, 'StorageService.ts'), serviceCode);

      s.stop(`Created Attachment Entity and StorageService in src/server/modules/storage`);

    } else if (type === 'channel') {
      s.start(`Scaffolding channel: ${className}Channel...`);
      const channelsPath = path.join(process.cwd(), 'src/server/channels');

      if (!fs.existsSync(channelsPath)) {
        fs.mkdirSync(channelsPath, { recursive: true });
      }

      const channelCode = `
import { BaseChannel } from './BaseChannel';

export class ${className}Channel extends BaseChannel {
  async handle(message: any) {
    // Handle incoming messages
    console.log('${className}Channel received:', message);

    // Example: Broadcast back
    ${className}Channel.broadcast({ event: 'update', data: message });
  }
}
      `.trim();
      fs.writeFileSync(path.join(channelsPath, `${className}Channel.ts`), channelCode);

      s.stop(`Created src/server/channels/${className}Channel.ts`);

    } else if (type === 'auth') {
      s.start(`Scaffolding Authentication System...`);
      const authPath = path.join(process.cwd(), 'src/server/modules/auth');

      if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
      }

      // 1. Generate Service
      const serviceCode = `
import argon2 from 'argon2';
// In a real app, imports would be resolved to your entity location
export class AuthService {
  async validateLocal(email: string, plain: string) { /* Implementation */ }
  async registerLocal(email: string, plain: string) { /* Implementation */ }
  async handleProvider(provider: string, profile: any) { /* Implementation */ }
}
      `.trim();
      fs.writeFileSync(path.join(authPath, 'AuthService.ts'), serviceCode);

      // 2. Generate Controller
      const controllerCode = `
import { AuthService } from './AuthService';
const auth = new AuthService();

export async function login(req, reply) {
  // Login logic
}

export async function googleCallback(req, reply) {
  // Google OAuth logic
}
      `.trim();
      fs.writeFileSync(path.join(authPath, 'auth.controller.ts'), controllerCode);

      s.stop(`Created AuthService and AuthController. Don't forget to update your User entity!`);

    } else {
      console.log(color.red(`\nUnknown generator type: ${type}`));
    }
  });

program
  .command('dev')
  .alias('d') // Alias for lazy developers
  .description('Start the full-stack development environment')
  .action(async () => {
    console.clear();
    intro(color.bgCyan(color.black(' OMOIKANE DEV ')));

    const s = spinner();
    s.start('Igniting servers...');

    // We use spawn to run both processes in parallel, piping their output
    // to the main console. In a real app, we might use a dedicated
    // library like 'concurrently' API to handle output prefixing.
    const { spawn } = await import('child_process');

    const backend = spawn('npx', ['tsx', 'watch', 'src/server/index.ts'], { stdio: 'inherit', shell: true });
    const frontend = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

    s.stop('Servers running');

    // Handle graceful shutdown
    const cleanup = () => {
      backend.kill();
      frontend.kill();
      process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  });

program.parse();
```

### The Base Template

The CLI is only useful if it delivers a solid foundation. The "Base Template" is a Git repository that acts as the seed for all new Omoikane projects.

It solves the "Two-Server Problem" (running Vite and Fastify simultaneously) out of the box and includes all the configuration files we discussed.

**Directory Structure:**

```text
/my-app
├── /.storybook          # Storybook Config
│   ├── main.ts
│   └── preview.tsx
├── /src
│   ├── /client          # React Frontend
│   │   ├── /components
│   │   ├── /hooks
│   │   └── /styles      # Tailwind Entry
│   │       └── index.css
│   ├── /server          # Fastify Backend
│   │   ├── /modules     # Domain Modules (User, Order, etc.)
│   │   └── /plugins     # Fastify Plugins
│   └── /shared          # Shared Types/Zod Schemas
├── docker-compose.yml   # Redis & Postgres
├── eslint.config.js     # Google Style Guide
├── playwright.config.ts # E2E Testing
├── postcss.config.js    # PostCSS Config
├── tailwind.config.js   # Tailwind Config
├── vite.config.ts       # Uses vite-plugin-omoikane (includes Vitest config)
├── package.json
└── tsconfig.json
```

**Pre-configured Scripts:**

With the CLI handling the orchestration, our package.json becomes incredibly clean, acting strictly as an entry point:

```json
{
  "scripts": {
    "dev": "omoikane dev",
    "build": "omoikane build",
    "start": "omoikane start",
    "test": "omoikane test"
  }
}
```

This setup ensures that when a developer runs npm run dev (or omoikane dev), they get a fully working full-stack environment in seconds, with hot-reloading active for both the frontend and the backend.

## Appendix: Dependency Reference

To manually assemble the Omoikane stack (or if you are building the template from scratch), here are the packages you need.

**Frontend & Backend Core:**

```bash
npm install react react-dom jotai fastify @mikro-orm/core @mikro-orm/postgresql @mikro-orm/reflection zod
```

**Authentication:**

```bash
npm install argon2 @fastify/secure-session @fastify/oauth2
```

**Styling:**

```bash
npm install -D tailwindcss postcss autoprefixer
```

**Real-Time (Action Cable):**

```bash
npm install @fastify/websocket
```

**File Storage:**

```bash
npm install @fastify/multipart
```

**Background Jobs:**

```bash
npm install bullmq ioredis
```

**Email Communication:**

```bash
npm install react-email @react-email/components @react-email/render nodemailer @types/nodemailer
```

**Development & Build Tools:**

```bash
npm install -D vite @vitejs/plugin-react typescript tsx concurrently @types/react @types/react-dom @types/node
```

**Linting (The Omoikane Standard):**

```bash
npm install -D @omoikane/eslint-config
```

**Testing:**

```bash
npm install -D vitest jsdom @playwright/test
```

**CLI Tooling (For the Omoikane CLI itself):**

```bash
npm install commander @clack/prompts picocolors degit
```

## Appendix: Creating the Shared ESLint Config

To enforce the "Omoikane Standard" across multiple projects without copy-pasting, we create and publish a standalone NPM package. This allows you to update linting rules centrally and propagate them to all apps via npm update.

### Directory Structure

Create a separate repository or a folder within your monorepo:

```text
/packages/eslint-config
├── package.json
└── index.js
```

### The Package Manifest

We use `peerDependencies` for ESLint itself to ensure the consumer project installs the compatible version, while bundling the specific plugins as regular dependencies.

```json
// packages/eslint-config/package.json
{
  "name": "@omoikane/eslint-config",
  "version": "1.0.0",
  "main": "index.js",
  "type": "module",
  "peerDependencies": {
    "eslint": "^9.0.0",
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "@eslint/js": "^9.0.0",
    "typescript-eslint": "^8.0.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.0",
    "globals": "^15.0.0"
  }
}
```

### The Configuration Logic

This file exports the configuration array. It composes the recommended rulesets and applies our framework-specific overrides.

```ts
// packages/eslint-config/index.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import globals from 'globals';

export default tseslint.config(
  // 1. Base JavaScript Recommendations
  js.configs.recommended,

  // 2. Strict TypeScript Rules
  ...tseslint.configs.recommended,

  // 3. React & Hooks Rules
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,

      // Omoikane Specific Opinions
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react/prop-types': 'off',
    },
  }
);
```

### Publishing & Consumption

* Run npm publish --access public inside the package directory.
* In your Omoikane project, install it: npm install -D @omoikane/eslint-config.
* Extend it in your local eslint.config.js:

```ts
import omoikane from '@omoikane/eslint-config';

export default [
  ...omoikane,
  {
    // Local overrides
    ignores: ['dist', 'coverage'],
  }
];
```

## Appendix: Full Docker Compose Configuration

Here is the complete docker-compose.yml file used to spin up the Omoikane infrastructure with zero configuration. Note the use of non-standard host ports to prevent conflicts with existing local services.

```yaml
version: '3.8'
services:
  # The Primary Database (MikroORM)
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: omoikane
      POSTGRES_PASSWORD: password
      POSTGRES_DB: omoikane_dev
    ports:
      # Map container port 5432 to host port 54320
      # avoiding conflicts with local Postgres installations
      - "54320:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # The Job Queue Store (BullMQ)
  redis:
    image: redis:alpine
    ports:
      # Map container port 6379 to host port 63790
      # avoiding conflicts with local Redis installations
      - "63790:6379"

volumes:
  postgres_data:
```

## Conclusion

Building Omoikane is an exercise in restraint. It is tempting to add every tool under the sun, but the goal here is curation. By strictly selecting tools that adhere to the philosophy of type safety, convention, and performance—like Fastify and MikroORM—we create a developer experience that feels magical, just like the best Omakase service.
