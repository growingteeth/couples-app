-- Couples app: rename the "Partner" label to "Sam" in EXISTING data.
-- Paste into Supabase: SQL Editor > New query > Run. One-time, safe to run once.
-- (New entries already save as "Sam" in the updated pages; this fixes everything saved before.)

-- His profile name (shows on the Directory page, phone, and playlists)
update public.profiles
set display_name = 'Sam'
where id = 'partner' and (display_name = 'Partner' or display_name = '');

-- Project / board card owners
update public.projects set owner = 'Sam' where owner = 'Partner';

-- Phone message senders
update public.messages set sender = 'Sam' where sender = 'Partner';

-- Playlist owners and track credits
update public.playlists set owner = 'Sam' where owner = 'Partner';
update public.playlist_tracks set added_by = 'Sam' where added_by = 'Partner';
