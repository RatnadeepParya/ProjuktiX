# Contributing to ProjuktiX

Thank you for your interest in contributing to ProjuktiX! We are building an open-source, universal technology encyclopedia and professional development platform.

---

## 1. Zero-Secret Development Rule

Before writing any code or opening a pull request, be aware of our non-negotiable rule:

> **Never commit or create `.env` files, API keys, or private credential files.**

All configuration is provided via shell environment variables or cloud environment dashboards. Pull requests containing any `.env*` or credential files will be automatically blocked by our CI audit.

---

## 2. Monorepo Setup

ProjuktiX uses `pnpm` workspaces with Node.js LTS (v20+).

```bash
# Clone the repository
git clone https://github.com/RatnadeepParya/ProjuktiX.git
cd ProjuktiX

# Install all monorepo dependencies
pnpm install

# Build shared packages
pnpm run build

# Start local development servers
pnpm dev
```

The frontend will run at `http://localhost:5173` and the backend API at `http://localhost:4000`.

---

## 3. Contributing Content

All technical documentation, tutorials, and question banks in ProjuktiX follow the standard set by the [Oracle DBA Encyclopedia](https://github.com/RatnadeepParya/Oracle-DBA-Encyclopedia):

1. **Depth**: Every technology track should feature comprehensive technical depth covering architecture, internals, configuration, troubleshooting, and production best practices.
2. **Originality**: Do not copy verbatim from third-party websites or copyrighted tutorials. Provide original explanations, diagrams, and code examples.
3. **Accuracy**: Verify all commands and code examples prior to submission.
4. **Diagrams**: Use Mermaid diagrams for architecture illustrations.

---

## 4. Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes in the appropriate workspace:
   - `packages/types` for data models.
   - `packages/validation` for Zod schemas.
   - `packages/shared` for utilities and domain constants.
   - `apps/api` for backend services and routes.
   - `apps/web` for UI components and pages.
3. Verify quality gates before pushing:
   ```bash
   pnpm run typecheck
   pnpm run test
   pnpm run build
   ```
4. Commit your changes with clear, descriptive commit messages.
5. Push to your fork and submit a Pull Request against `main`.

---

## 5. Coding Standards

- **TypeScript**: Strict typechecking is enabled. Avoid using `any` unless absolutely necessary.
- **Components**: Follow the modular cyber theme styling established in `apps/web`.
- **Database**: Respect Firestore security rules; never expose question answer keys to client routes.
- **Testing**: Add Vitest tests for new utilities, scoring logic, and validation schemas.
