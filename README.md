# Couples App v3 — GitHub Pages deploy (multi-page + Playlists)

What's new in v3:
- Restyle: chrome/silver metal, cream panels, black CRT framing — inspired by an old
  chrome Nokia twist phone, a black mini CRT TV, and a cream Nokia bar phone.
  The Phone page is now a cream-and-chrome handset.
- NEW page: `playlists.html` — a stack of burned CDs with Sharpie titles.
  Flip through the discs, pick one, play its YouTube tracks in the little CRT TV.

## ⚠️ STEP 1 — Run the Playlists schema in Supabase FIRST

The Playlists page needs two new database tables. Without this step the rest of
the app still works, but Playlists will show a sync error.

1. Open the file **`playlists-schema.sql`** from this zip on your device
   (open it, select all, copy).
2. In Supabase: **SQL Editor > New query** > paste > **Run**.
   You should get "Success. No rows returned."
3. Do NOT upload `playlists-schema.sql` to GitHub — it does nothing there.
   It is a one-time database step, not a website file.

## STEP 2 — Upload ALL the site files to GitHub

In Chrome (not the GitHub mobile app): go to the existing repo
(**growingteeth / couples-app**) > **Add file > Upload files**, and upload
every website file below, replacing the old ones, then **Commit changes**.
All files must land in the repo **root**, next to each other — not in a folder.

Must-upload checklist (tick every one!):
- [ ] `index.html`  (Directory / home)
- [ ] `board.html`  (Projects board)
- [ ] `project.html` (single project + its file shelf)
- [ ] `shelf.html`   (all files)
- [ ] `phone.html`   (phone notes — new cream handset look)
- [ ] `playlists.html` (NEW — the CD stack)
- [ ] **`app.js` — DO NOT SKIP THIS ONE.** ⚠️ In v2 the deploy broke (login did
      nothing, no error shown) because `app.js` alone never reached the repo
      while every other file did. `app.js` holds the login + sync code for
      EVERY page. If any page "does nothing" after this update, `app.js` is
      the first suspect — check the repo file list for it.
- [ ] **`styles.css` — also required.** All the chrome/CRT/CD styling lives
      here; without the new copy the pages will look like plain v2.
- [ ] `README.md` (optional — this file; harmless either way)

Repo **Settings > Pages** stays as it was: Deploy from a branch, `main`, `/ (root)`.

## STEP 3 — URLs

- Home / Directory: https://growingteeth.github.io/couples-app/
- Board:    https://growingteeth.github.io/couples-app/board.html
- Project:  https://growingteeth.github.io/couples-app/project.html?id=…
- Files:    https://growingteeth.github.io/couples-app/shelf.html
- Phone:    https://growingteeth.github.io/couples-app/phone.html
- Playlists: https://growingteeth.github.io/couples-app/playlists.html

Give Pages a minute after committing, then open the site in a **fresh tab**
(close old tabs first — phones love serving the cached old page). Log in as
usual; your login carries across all the pages.

If you haven't already: in Supabase **Authentication > URL Configuration**,
Site URL = `https://growingteeth.github.io/couples-app/` and add
`https://growingteeth.github.io/couples-app/**` under Redirect URLs, so
invite/password emails land on the real app instead of localhost.

## Your existing data is NOT affected

Uploading these files only replaces the app's code. Everything you and your
partner have added — projects, cards, notes, files, profiles — lives in
Supabase (database + storage bucket), not in these files, and the Playlists
schema only ADDS two new empty tables. It will all be there when you log in.
