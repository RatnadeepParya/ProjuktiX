# GitHub Actions CI/CD Pipeline

ProjuktiX utilizes GitHub Actions for continuous quality control, automated testing, security compliance, and continuous deployment.

---

## 1. Workflows Overview

| Workflow | File | Trigger | Responsibility |
|---|---|---|---|
| **CI Pipeline** | `.github/workflows/ci.yml` | `push` / `pull_request` on `main` | Zero-secret audit, typechecking, vitest suites, monorepo build verification |
| **Render Deploy** | `.github/workflows/deploy.yml` | `push` on `main` | Dispatches webhook calls to Render deploy hooks |

---

## 2. Secrets Configuration in GitHub

To enable automated deployments, configure the following secrets under **Settings** → **Secrets and variables** → **Actions**:

```
RENDER_API_DEPLOY_HOOK
RENDER_FRONTEND_DEPLOY_HOOK
```

If these secrets are not configured, the deploy workflow will log a notice and exit cleanly without failing, allowing forks and open-source contributors to run CI without needing production deployment access.

---

## 3. Strict Zero-Secret Audit Step

Every CI run executes an automated security gate:

```bash
# Check for prohibited .env files
find . -name "*.env" -o -name ".env.*" -o -name "*.envrc" | grep -v "node_modules"

# Check for prohibited credential files
find . -name "*service-account*.json" -o -name "*credentials*.json" | grep -v "node_modules"

# Check for private keys
find . -name "*.pem" -o -name "*.key" -o -name "*.p12" | grep -v "node_modules"
```

If any matching file is detected, the workflow fails immediately with an actionable error.
