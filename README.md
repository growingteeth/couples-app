# Couples App v2 — separate pages (GitHub Pages deploy)

Same app, restructured into separate pages that share one login and one
Supabase backend. **Everything you two already added is safe**: projects,
notes, profiles and uploaded files live in Supabase (database + storage),
not in these HTML files — replacing the site files does not delete your data.

## Files in this package
- `index.html` — Directory/home: profiles + a directory of all projects
- `board.html` — the full project board (Ideas / In Progress / Needs Review / Done)
- `project.html` — one project's own page (details, checklist, its own file shelf)
- `shelf.html` — all files across all projects, with filters + search
- `phone.html` — the 2000s phone / leave-a-note page
- `styles.css`, `app.js` — shared styling and shared sync/login code (required by every page)

## Deploy steps
Use mobile **Chrome** on github.com (the GitHub app can't upload files or
change Pages settings) — same flow as the first version.

1. Download and unzip `couples-app-site-v2.zip` with your phone's Files app.
2. Open your existing repo: **growingteeth / couples-app**
3. **Add file > Upload files**: upload ALL files from this package
   (`index.html`, `board.html`, `project.html`, `shelf.html`, `phone.html`,
   `styles.css`, `app.js`, and `README.md` too if you like).
   - Uploading the new `index.html` **replaces** the old single-file one — that's intended.
   - Commit changes.
4. Pages settings: **unchanged** — Settings > Pages should still be
   "Deploy from a branch", branch `main`, folder `/ (root)`. Nothing to redo.
5. Wait a minute or two, then visit your site:
   **https://growingteeth.github.io/couples-app/**

## Your page URLs
- Directory: `https://growingteeth.github.io/couples-app/`
- Board: `https://growingteeth.github.io/couples-app/board.html`
- A project: `https://growingteeth.github.io/couples-app/project.html?id=<project id>` (open projects from the directory or board — they'll link you there)
- File shelf: `https://growingteeth.github.io/couples-app/shelf.html`
- Phone: `https://growingteeth.github.io/couples-app/phone.html`

Your login carries across all pages on the site — log in once per device.

## Supabase setting (one time)
In Supabase: **Authentication > URL Configuration**
- **Site URL:** `https://growingteeth.github.io/couples-app/`
- **Redirect URLs:** add `https://growingteeth.github.io/couples-app/**`
- Save. (This makes auth emails land on the real app instead of localhost.)

## Troubleshooting
- **404 on a page**: make sure that file is at the repo root (not in a subfolder) and the name matches exactly — Pages URLs are case-sensitive.
- **Stuck on the login screen / "could not load"**: check your connection and reload; the app needs the Supabase library from a CDN.
- **A page looks unstyled**: `styles.css` must be in the repo root next to the HTML files.
