# AGENTS.md

## Cursor Cloud specific instructions

### Product overview

Single-package Next.js 16 portfolio site ([saisur.me](https://www.saisur.me)) using the Pages Router (`src/pages/`), React 18, and Tailwind CSS. No backend, database, Docker, or required environment variables.

### Services

| Service | Command | URL |
|---------|---------|-----|
| Next.js dev (primary) | `npm run dev` | http://localhost:3000 |
| Next.js production | `npm run build` then `npm run start` | http://localhost:3000 |

Only the Next.js dev server is required for local development and end-to-end testing.

### Lint / test / build

- **Install:** `npm install` (Node.js >= 20; `.nvmrc` specifies `20`)
- **Lint:** `npm run lint` is broken on Next.js 16 — the CLI no longer includes a `lint` subcommand. Use `npx eslint . --ext .js,.jsx` instead. The repo has pre-existing quote-style violations in `src/components/Home.js`.
- **Build:** `npm run build`
- **Tests:** No automated test suite is configured in `package.json`.

### Gotchas

- **Next.js 16 CLI:** `next lint` was removed; `npm run lint` fails with "Invalid project directory provided, no such directory: .../lint". Use ESLint directly (see above).
- **Portfolio route:** `/portfolio` works but is not linked from the home sidebar; navigate directly or via in-page links on the portfolio page.
- **Standalone prototype:** `flower-test.html` at the repo root is not served by Next.js; open it separately if needed.
