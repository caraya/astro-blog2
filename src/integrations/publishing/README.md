# TODO: Production Publishing Workflow

This integration is currently configured as a **Local-Only DX Tool**. It operates safely by hiding the UI behind `import.meta.env.DEV` checks and saving markdown files directly to the local filesystem using Node.js `fs` APIs via a Vite dev-server plugin.

If this package is ever upgraded to a **Production CMS** (allowing users to log into the live hosted site and edit posts), the following architectural changes must be implemented.

## Authentication Layer

Serverless production environments are entirely public by default. We must guard the `/editor` and `/calendar` routes.

- **Option A: GitHub OAuth + Astro Middleware**
  - Use `lucia-auth` or `auth.js` to create an OAuth flow with GitHub.
  - Implement an Astro Middleware (`src/middleware.ts`) that checks for a valid session token on any route starting with `/editor` or `/calendar` and redirects unauthorized users to a login page.
- **Option B: Basic Auth**
  - Implement a lightweight Astro Middleware that checks an `Authorization: Basic` header against an environment variable (e.g., `ADMIN_PASSWORD`), prompting a browser-native login dialog.

## GitHub API Integration (The "Save" Action)

Because platforms like Vercel and Netlify have read-only filesystems, `fs.writeFile` will fail in production. The CMS must push commits directly to the Git repository.

1. **Remove the Vite Plugin Constraint:**
   The `devSavePost.mjs` plugin only runs on the local Vite dev server. You must convert `/api/save-post` into a standard Astro Server-Side Rendered (SSR) endpoint (e.g., `src/pages/api/save-post.ts`).
2. **Environment Forking Logic:**
   Update the save endpoint to fork its behavior based on the environment:

   ```javascript
   if (import.meta.env.DEV) {
     // LOCAL: Use standard fs.writeFile to the local disk (current behavior)
   } else {
     // PRODUCTION: Use the GitHub REST API
   }
   ```

3. **GitHub API Implementation:**
   - The user must provide `GITHUB_TOKEN`, `GITHUB_OWNER`, and `GITHUB_REPO` as environment variables.
   - When saving, fetch the file's current SHA hash from GitHub (required for updates).
   - Use the `PUT /repos/{owner}/{repo}/contents/{path}` endpoint to push the base64-encoded Markdown content as a new commit.
   - This will automatically trigger the host's CI/CD pipeline (e.g., Netlify) to rebuild the site with the new post.

## UI/UX Considerations

- **Build Delays**: When saving in production, the site takes a minute or two to rebuild. The editor UI should inform the user that their changes were pushed and that the live site will update shortly.
- **Removing Dev-Only Warnings**: Remove the `!isDev` conditionals in `editor.astro` and `calendar.astro` so the UI actually mounts in production.
