# Backend

The GSX Gwalior backend will live here. Nothing is built yet.

The website doesn't depend on it: event registration currently goes to a Google Form, and all content lives in `frontend/src/data/content.ts`.

When you start:

- Keep secrets in a `.env` file. The root `.gitignore` already ignores it. Commit a `.env.example` listing the variable names instead.
- Add the backend's own scripts to the root `package.json` next to the frontend ones.
