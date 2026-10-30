# CI/CD Deployment Pipeline Plan: Safarnama -> Netlify

## Goal
Implement an automated, test-gated CI/CD pipeline using GitHub Actions that builds, tests, and deploys the Safarnama frontend to Netlify upon push to the `main` branch.

## Scope
- Configuration of Netlify authentication credentials in GitHub Secrets.
- GitHub Actions workflow definition (`.github/workflows/deploy.yml`).
- Pipeline stages:
  1. Environment setup (Ubuntu runner, Node.js runtime, dependency caching).
  2. Automated test execution (Vitest in `client/`).
  3. Production build generation (`npm run build` in `client/` with Vite Firebase env injection).
  4. Production deployment to Netlify via Netlify CLI using stored secrets.
- Verification of test gating: a failed test must halt deployment before anything ships to Netlify.

## Stack & Tools Decided
- **Source Control / CI/CD Runner:** GitHub & GitHub Actions (`ubuntu-latest`)
- **Hosting Target:** Netlify (using pre-existing site and subdomain)
- **Deployment Tooling:** Netlify CLI (`netlify deploy --prod --dir=...` or official action)
- **Runtime:** Node.js 20+
- **Frontend / Test Runner:** Vite + Vitest in `./client`

## Core Learning Target(s)
*Firewall: The concepts below are protected from blind AI code generation. Krish must master, articulate, and write the critical logic.*
1. **GitHub Actions Workflow Syntax & Lifecycle:** Anatomy of `name`, `on`, `jobs`, `runs-on`, `steps`, `uses`, `run`, and `working-directory` (handling subdirectory repos).
2. **Secrets & Security Isolation:** Understanding why secrets must never exist in git, how GitHub encrypts them, and how workflows expose them to runner environments via `env:` or action secrets.
3. **Build-Time vs Runtime Env Injection:** Grasping why Vite client builds require `VITE_*` environment variables during the `npm run build` step inside GitHub Actions, not just on the hosting server.
4. **Test-Gated Deployment (Quality Assurance Gate):** Ensuring deployment steps strictly depend on prior test steps passing, preventing broken builds from reaching users.

## Architectural Notes & Constraints
- **Subdirectory Monorepo:** Safarnama's Vite app lives in `./client`. All npm commands (`npm ci`, `npm test`, `npm run build`) must run within the `client` directory or specify `working-directory: client`.
- **Firebase Config:** Since Vite bundles `import.meta.env.VITE_*` statically at compile time, GitHub Actions needs the `VITE_FIREBASE_*` variables provided during the build step, sourced from GitHub Secrets.

## Milestone Breakdown
- [x] **Milestone 1:** Obtain Netlify credentials (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`).
- [x] **Milestone 2:** Configure GitHub Secrets (Netlify tokens + `VITE_FIREBASE_*` variables).
- [x] **Milestone 3:** Draft the pipeline recipe (`.github/workflows/deploy.yml`) through the Step 2 Teaching Loop.
- [ ] **Milestone 4:** Run live push trigger, monitor GitHub Actions runner, verify green deployment on Netlify.

