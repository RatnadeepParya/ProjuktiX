# ProjuktiX Secrets Management & Zero-Config Architecture

## Executive Policy: Zero Persistent Secret Files

ProjuktiX enforces a strict architectural rule across all repositories, services, and environments:

> **No environment files (`.env`, `.env.local`, `.env.production`, etc.) may ever be created, committed, or required in this project. All secrets and runtime configuration must be injected dynamically via process environment variables.**

This design prevents accidental leaks of sensitive credentials, eliminates secret synchronization overhead, and guarantees 12-factor application compliance.

---

## 1. How Configuration is Delivered

### Production & Staging (Render)
- In the **Render Dashboard**, navigate to your Web Service or Static Site.
- Go to **Environment** settings.
- Add your environment variables securely:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY` (ensure newlines are preserved or escaped)
  - `CORS_ORIGIN`
  - `PORT` (defaults to 4000)
- Render securely injects these values into the running container's `process.env`. No files are written to disk.

### CI/CD Automation (GitHub Actions)
- In GitHub, navigate to **Settings** → **Secrets and variables** → **Actions**.
- Define your secrets:
  - `RENDER_API_DEPLOY_HOOK`: Webhook URL from Render to trigger backend deployment.
  - `RENDER_FRONTEND_DEPLOY_HOOK`: Webhook URL from Render to trigger frontend deployment.
  - `FIREBASE_PROJECT_ID`: Used if CI runs automated integration tests against an emulator or staging project.
- Workflows read these exclusively via the `${{ secrets.VAR_NAME }}` syntax.

### Local Development
When developing locally, configure variables directly within your shell session:

```bash
# macOS / Linux terminal session
export PORT=4000
export CORS_ORIGIN="http://localhost:5173"
export FIREBASE_PROJECT_ID="your-project-id"
export FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project-id.iam.gserviceaccount.com"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Start the development server
pnpm dev
```

Alternatively, use the Firebase Local Emulator Suite which runs without any cloud credentials:
```bash
export FIRESTORE_EMULATOR_HOST="localhost:8080"
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
pnpm dev
```

---

## 2. Dynamic Frontend Configuration (`/api/v1/config`)

The single-page application (`apps/web`) does not bake static API keys into its JavaScript bundles. Instead:

1. When the user loads the app, the frontend requests `GET /api/v1/config`.
2. The backend responds with public client credentials derived from its environment:
   ```json
   {
     "success": true,
     "data": {
       "firebase": {
         "apiKey": "...",
         "authDomain": "...",
         "projectId": "..."
       },
       "features": {
         "enableRegistration": true,
         "enableTerminalLabs": true
       }
     }
   }
   ```
3. The frontend initializes Firebase Auth dynamically at runtime.

---

## 3. Defensive Audit Verification

The repository includes a defensive `.gitignore` and an automated CI audit script in `.github/workflows/ci.yml`. Any pull request or commit that introduces a file matching `.env*`, `*credential*`, or `*.key` is automatically rejected by the CI pipeline before merging.
