# Couples App v5 — SoftSignal + Windows 3.1 icons (GitHub Pages deploy)

What's new in v5:
- **Icons swapped across the whole site** (Grey's pick, 2026-11-03): the emoji
  are gone from the chrome. In their place, pixel icons in the classic
  Windows 3.1 Program Manager style — File Manager cabinet, Clipboard,
  program-group window, Terminal (phone + monitor), CD, Key, Heart,
  Notepad, Paw — drawn as a matching set in the `icons/` folder.
  - Nav: cabinet = Directory Home, clipboard = Projects Board,
    program-group = File Shelf, terminal = Phone Notes, CD = Playlists
  - Window titlebars: key (login), heart (profiles), cabinet (directory /
    shelf), clipboard (board), notepad (project), terminal (phone), CD
    (playlists); the browser tab icon is now the CD too
  - Top Friends: paw prints for Pancake / Kyoko / Coffee, heart for You Two
- Everything else is v4 unchanged: same SoftSignal styling, `app.js`
  identical, same Supabase data.

## No extra files for the icons
The 9 icons are embedded directly inside the page files (they're tiny),
so there is **no icons folder to upload** — mobile GitHub can't drag
folders, and now it doesn't have to. Upload exactly the same file set
as v3/v4 and the icons come along inside the HTML.


What's new in v4:
- Full visual redesign matching the **SoftSignal** personal-homepage skin
  (the Pinterest pin Grey sent, 2026-11-03): a Y2K Korean blog-skin /
  retro-tech device panel.
  - Dark near-black plum backdrop with a faint blueprint grid
  - The whole app now sits inside one big **cream-beige device console**
    with rounded corners, a green waveform/EQ strip across the top,
    and the lowercase `softsignal` nameplate
  - **Sage / olive green** (#6b876f) and deep-forest LCD modules —
    the nav is now a dark-green menu panel with pink indicator dots,
    moods/status show on dark-green LCD readouts
  - **Hot-pink sticker accents** (the slanted `grey × sam ♡` sticker,
    the pink sync stamp, pink file/note highlights) + **lime** highlights
  - Round metal **knobs/dials** for window buttons, playlist controls,
    and the phone's nav disc; the Phone is now a sage charm-handset
    with a hanging loop, like the pin's side device
  - New type: Archivo Black headlines, Space Grotesk body, Space Mono
    for the tiny labels/readouts (Permanent Marker stays on the CDs)
- No functional changes: `app.js` is identical to v3, all Supabase
  tables, login, realtime sync, files, and playlists work as before.
  This is a drop-in replacement — mostly a new `styles.css`, plus the
  new fonts and nameplate text in each page.

## Deploy — replace the files in GitHub

In Chrome (not the GitHub mobile app): go to the existing repo
(**growingteeth / couples-app**) > **Add file > Upload files**, and upload
every website file below, replacing the old ones, then **Commit changes**.
All files must land in the repo **root**, next to each other — not in a folder.

Must-upload checklist:
- [ ] `index.html`  (Directory / home)
- [ ] `board.html`  (Projects board)
- [ ] `project.html` (single project + its file shelf)
- [ ] `shelf.html`   (all files)
- [ ] `phone.html`   (phone notes — new sage charm-handset look)
- [ ] `playlists.html` (CD stack + CRT player)
- [ ] **`app.js` — upload it too** (unchanged from v3, but uploading it
      again is harmless and avoids the old v2 mistake where a missing
      `app.js` made login silently do nothing)
- [ ] **`styles.css` — THE redesign lives here.** Without the new copy
      the site will still look like v3.
- [ ] `README.md` (optional — this file; harmless either way)

Do NOT upload `playlists-schema.sql` or `rename-to-sam.sql` to GitHub —
those were one-time Supabase SQL steps, already done for v3.

Repo **Settings > Pages** stays as it was: Deploy from a branch, `main`, `/ (root)`.

## URLs (unchanged)

- Home / Directory: https://growingteeth.github.io/couples-app/
- Board:    https://growingteeth.github.io/couples-app/board.html
- Project:  https://growingteeth.github.io/couples-app/project.html?id=…
- Files:    https://growingteeth.github.io/couples-app/shelf.html
- Phone:    https://growingteeth.github.io/couples-app/phone.html
- Playlists: https://growingteeth.github.io/couples-app/playlists.html

Give Pages a minute after committing, then open the site in a **fresh tab**
(close old tabs first — phones love serving the cached old page). Log in as
usual; your login carries across all the pages.

## Your existing data is NOT affected

Uploading these files only replaces the app's code and styling. Everything
you and Sam have added — projects, cards, notes, files, profiles,
playlists — lives in Supabase (database + storage bucket), not in these
files. It will all be there when you log in.
