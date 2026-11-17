# Deploying ProjuktiX to Render (Free Tier Optimized)

This guide walks through configuring and deploying both the ProjuktiX Backend API and Frontend SPA to Render's free tier.

---

## 1. Architecture on Render

ProjuktiX runs on Render as two services:
1. **Backend API (`apps/api`)**: A Render **Web Service** running Node.js.
2. **Frontend SPA (`apps/web`)**: A Render **Static Site** running Vite + React.

Both services build directly from the GitHub repository `https://github.com/RatnadeepParya/ProjuktiX`.

---

## 2. Deploying the Backend API

1. Go to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`RatnadeepParya/ProjuktiX`).
4. Configure the service settings:
   - **Name**: `projuktix-api`
   - **Region**: Select closest region (e.g. Frankfurt, Oregon, Singapore).
   - **Branch**: `main`
   - **Root Directory**: Leave blank (monorepo root).
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     pnpm install --frozen-lockfile && pnpm --filter "@projuktix/types" run build && pnpm --filter "@projuktix/validation" run build && pnpm --filter "@projuktix/shared" run build && pnpm --filter "@projuktix/api" run build
     ```
   - **Start Command**:
     ```bash
     node apps/api/dist/server.js
     ```
   - **Instance Type**: `Free`
5. In **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render's default port)
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://projuktix.onrender.com`)
   - `FIREBASE_PROJECT_ID`: Your Firebase Project ID
   - `FIREBASE_CLIENT_EMAIL`: Service account email
   - `FIREBASE_PRIVATE_KEY`: Service account private key
6. Under **Deploy Hook**, copy the generated webhook URL.
7. Save this URL in your GitHub repo secrets as `RENDER_API_DEPLOY_HOOK`.

---

## 3. Deploying the Frontend SPA

1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect the same repository.
3. Configure the static site settings:
   - **Name**: `projuktix-web`
   - **Branch**: `main`
   - **Root Directory**: Leave blank.
   - **Build Command**:
     ```bash
     pnpm install --frozen-lockfile && pnpm --filter "@projuktix/types" run build && pnpm --filter "@projuktix/validation" run build && pnpm --filter "@projuktix/shared" run build && pnpm --filter "@projuktix/web" run build
     ```
   - **Publish Directory**: `apps/web/dist`
4. Under **Redirects/Rewrites**:
   - Add a rewrite rule for client-side SPA routing:
     - **Source**: `/*`
     - **Destination**: `/index.html`
     - **Action**: `Rewrite`
5. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: The URL of your deployed API service (e.g., `https://projuktix-api.onrender.com/api/v1`).
6. Copy the Static Site Deploy Hook URL and add it to GitHub secrets as `RENDER_FRONTEND_DEPLOY_HOOK`.

---

## 4. Continuous Deployment Verification

Once configured, pushing changes to the `main` branch will automatically:
1. Run the CI workflow on GitHub (`.github/workflows/ci.yml`) to verify type safety, unit tests, and security audits.
2. Trigger the deploy workflow (`.github/workflows/deploy.yml`) which posts to your Render Deploy Hooks.
3. Render automatically pulls and builds the updated services.
