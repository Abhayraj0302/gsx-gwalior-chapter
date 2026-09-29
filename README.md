# GSX Gwalior Chapter

Code for the GSX Gwalior Chapter at MITS-DU, Gwalior, a student-led tech community of the GirlScript Foundation.

## What's here

| Folder | What it is |
|---|---|
| [`frontend/`](frontend) | The website: React, TypeScript and Vite. |
| [`backend/`](backend) | Reserved for the backend. Nothing here yet. |

Each folder is its own project with its own dependencies, so the backend can use whatever stack suits it.

## Running the website

Needs Node 20 or newer. From the repository root:

```bash
npm run setup      # installs the frontend's dependencies
npm run dev        # http://localhost:5173
npm run build
```

The same scripts work from inside `frontend/` with plain `npm install` and `npm run dev`. Content editing is covered in the [frontend README](frontend/README.md).

## Deploying

On Vercel, set the project's **Root Directory** to `frontend`. The build command is `npm run build` and the output directory is `dist`.
