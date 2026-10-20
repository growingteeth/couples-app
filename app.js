/* Shared logic — couples app v2 (multi-page)
   Supabase client, auth gate, data fetchers, realtime helper,
   escape/format helpers, storage signed-URL helper, misc UI. */
var SUPABASE_URL = 'https://nvwefyrbpokbebzbayka.supabase.co';
var SUPABASE_KEY = 'sb_publishable_2ZfO2GoQVAxTixcDIX0AUQ_iaGfV-nj';
var COLS = ['Ideas', 'In Progress', 'Needs Review', 'Done'];
var BUCKET = 'project-files';

var sb = null;
try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) { sb = null; }

var state = { profiles: {}, projects: [], messages: [], files: [] };
var signedUrlCache = {};  // storage_path -> signed URL (session cache)
var realtimeChannel = null;
var appEntered = false;

function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function toast(msg) {
  var t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(function () { t.style.display = 'none'; }, 2800);
}
function fmtTime(iso) {
  try {
    var d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  } catch (e) { return ''; }
}
function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch (e) { return ''; }
}
function showSyncError(on) {
  var b = $('syncError');
  if (b) b.hidden = !on;
  if (on) setLive(false);
}
function setLive(on) {
  var pill = $('syncPill');
  if (pill) {
    pill.className = 'sync-pill' + (on ? '' : ' off');
    pill.textContent = on ? '● LIVE SYNC ON' : '● NOT LIVE';
  }
  var tl = $('taskLive');
  if (tl) {
    tl.className = 'task-live' + (on ? '' : ' off');
    tl.textContent = on ? '● LIVE SYNC ON' : '● OFFLINE';
  }
}
function checkErr(res) {
  if (res && res.error) { showSyncError(true); return true; }
  return false;
}
/* Two-tap delete: first click arms the button, second click runs fn. */
function armDelete(btn, fn) {
  if (btn.dataset.armed === '1') { fn(); return; }
  btn.dataset.armed = '1';
  var old = btn.textContent;
  btn.textContent = 'Tap again to delete';
  setTimeout(function () {
    if (btn.isConnected) { btn.dataset.armed = ''; btn.textContent = old; }
  }, 3000);
}

/* ---------- Data model helpers ---------- */
function checklistOf(p) {
  var c = p ? p.checklist : null;
  if (!c) return [];
  if (typeof c === 'string') {
    try { c = JSON.parse(c); } catch (e) { return c.split('\n').filter(Boolean); }
  }
  if (!Array.isArray(c)) return [];
  return c.map(function (it) {
    return typeof it === 'string' ? it : (it && (it.text || it.label) ? (it.text || it.label) : '');
  }).filter(Boolean);
}
function projectTitle(id) {
  if (!id) return 'General';
  var p = state.projects.find(function (x) { return x.id === id; });
  return p ? p.title : 'General';
}
function extType(name) {
  var ext = (String(name).split('.').pop() || '').toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'png') return 'png';
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'doc';
  if (ext === 'txt' || ext === 'md') return 'txt';
  return 'other';
}
function fileIconClass(t) {
  t = String(t || 'other').toLowerCase();
  if (t === 'pdf') return 'pdf';
  if (t === 'doc' || t === 'txt') return 'doc';
  if (t === 'jpg' || t === 'png') return 'jpg';
  return 'other';
}

/* ---------- Fetchers (fill state, no rendering) ---------- */
function fetchProfiles() {
  return sb.from('profiles').select('*').then(function (res) {
    if (checkErr(res)) return;
    state.profiles = {};
    (res.data || []).forEach(function (r) { state.profiles[r.id] = r; });
  });
}
function fetchProjects() {
  return sb.from('projects').select('*')
    .order('position', { ascending: true }).order('created_at', { ascending: true })
    .then(function (res) {
      if (checkErr(res)) return;
      state.projects = res.data || [];
    });
}
function fetchMessages() {
  return sb.from('messages').select('*').order('created_at', { ascending: true })
    .then(function (res) {
      if (checkErr(res)) return;
      state.messages = res.data || [];
    });
}
function fetchFiles() {
  return sb.from('files').select('*').order('created_at', { ascending: false })
    .then(function (res) {
      if (checkErr(res)) return;
      state.files = res.data || [];
    });
}
/* handlers: optional map of table name -> render callback, used for refetch + realtime */
function loadAll(handlers) {
  var jobs = [];
  if (!handlers || handlers.profiles) jobs.push(fetchProfiles());
  if (!handlers || handlers.projects) jobs.push(fetchProjects());
  if (!handlers || handlers.messages) jobs.push(fetchMessages());
  if (!handlers || handlers.files) jobs.push(fetchFiles());
  return Promise.all(jobs).then(function () {
    if (handlers) Object.keys(handlers).forEach(function (k) { handlers[k](); });
  }).catch(function () { showSyncError(true); });
}

/* ---------- Realtime: refetch the page's tables on any change ---------- */
function subscribeRealtime(handlers) {
  if (realtimeChannel || !sb) return;
  var ch = sb.channel('couples-live-' + location.pathname);
  Object.keys(handlers).forEach(function (table) {
    ch.on('postgres_changes', { event: '*', schema: 'public', table: table }, function () {
      var fetcher = { profiles: fetchProfiles, projects: fetchProjects, messages: fetchMessages, files: fetchFiles }[table];
      if (fetcher) fetcher().then(function () { handlers[table](); });
    });
  });
  realtimeChannel = ch.subscribe(function (status) {
    if (status === 'SUBSCRIBED') { setLive(true); showSyncError(false); }
    else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') { setLive(false); }
  });
}

/* ---------- Storage: signed URLs for the private bucket ---------- */
function getSignedUrl(path) {
  if (!path) return Promise.resolve(null);
  if (signedUrlCache[path]) return Promise.resolve(signedUrlCache[path]);
  return sb.storage.from(BUCKET).createSignedUrl(path, 3600).then(function (res) {
    if (res.data && res.data.signedUrl) {
      signedUrlCache[path] = res.data.signedUrl;
      return res.data.signedUrl;
    }
    return null;
  }).catch(function () { return null; });
}
function openStoredFile(file) {
  if (!file || !file.storage_path) return;
  getSignedUrl(file.storage_path).then(function (url) {
    if (url) window.open(url, '_blank', 'noopener');
    else toast('Could not open that file');
  });
}
/* Fill <img data-thumb="fileId"> previews for uploaded jpg/png files inside a container. */
function fillThumbs(container, files) {
  files.forEach(function (f) {
    var t = String(f.file_type || '').toLowerCase();
    if (!f.storage_path || (t !== 'jpg' && t !== 'png')) return;
    var img = container.querySelector('[data-thumb="' + f.id + '"]');
    if (!img) return;
    getSignedUrl(f.storage_path).then(function (url) {
      if (url) { img.src = url; img.hidden = false; img.alt = f.name; }
    });
  });
}
/* Shared file-row markup used by project.html and shelf.html */
function fileRowHtml(f, opts) {
  opts = opts || {};
  var t = String(f.file_type || 'other').toLowerCase();
  var right = '';
  if (f.storage_path) {
    right = '<div style="font-size:13px;margin-top:2px"><button class="btn small" type="button" data-dl="' + f.id + '">⬇ Download / open</button></div>' +
            '<img class="thumb" data-thumb="' + f.id + '" alt="" hidden>';
  } else if (f.link) {
    right = '<div style="font-size:13px;margin-top:2px"><a href="' + esc(f.link) + '" target="_blank" rel="noopener">Open link ↗</a></div>';
  }
  return '<div class="file-icon ' + fileIconClass(t) + '">' + esc(t.toUpperCase()) + '<br>FILE</div>' +
    '<div><b>' + esc(f.name) + '</b>' +
    (opts.showProject ? ' <span class="pill tag">' + esc(projectTitle(f.project_id)) + '</span>' : '') +
    (f.note ? '<div style="font-size:13px;margin-top:2px">' + esc(f.note) + '</div>' : '') + right + '</div>' +
    '<button class="btn small danger" type="button" data-delfile="' + f.id + '">Delete</button>';
}
function wireFileRowActions(container, files, onChanged) {
  container.querySelectorAll('[data-dl]').forEach(function (b) {
    b.onclick = function () {
      var f = files.find(function (x) { return x.id === b.dataset.dl; });
      openStoredFile(f);
    };
  });
  container.querySelectorAll('[data-delfile]').forEach(function (b) {
    b.onclick = function () {
      armDelete(b, function () {
        var f = files.find(function (x) { return x.id === b.dataset.delfile; });
        sb.from('files').delete().eq('id', b.dataset.delfile).then(function (res) {
          if (checkErr(res)) return;
          if (f && f.storage_path) sb.storage.from(BUCKET).remove([f.storage_path]);
          if (onChanged) onChanged();
          toast('Removed from shelf');
        });
      });
    };
  });
}
/* Upload (optional) + insert a files row. opts: {name,type,projectId,note,link,fileInput} */
function addFileEntry(opts, done) {
  var up = opts.fileInput && opts.fileInput.files ? opts.fileInput.files[0] : null;
  var name = (opts.name || '').trim() || (up ? up.name : '');
  if (!name && !up) { toast('Give the entry a name or pick a file to upload'); if (done) done(false); return; }
  function finish(storagePath) {
    var row = {
      name: name,
      file_type: up ? extType(up.name) : (opts.type || 'other'),
      project_id: opts.projectId || null,
      note: (opts.note || '').trim(),
      link: (opts.link || '').trim(),
      storage_path: storagePath || ''
    };
    sb.from('files').insert(row).then(function (res) {
      if (done) done(!checkErr(res));
    });
  }
  if (up) {
    var path = Date.now() + '-' + up.name.replace(/[^\w.\-]+/g, '_');
    sb.storage.from(BUCKET).upload(path, up).then(function (res) {
      if (res.error) { showSyncError(true); toast('Upload failed: ' + res.error.message); if (done) done(false); return; }
      finish(path);
    });
  } else { finish(''); }
}

/* ---------- Auth gate ---------- */
function showLoginError(msg) {
  var e = $('loginErr');
  if (!e) return;
  if (!msg) { e.hidden = true; e.textContent = ''; return; }
  e.hidden = false;
  e.textContent = msg;
}
function enterApp() {
  if (appEntered || !sb) return;
  appEntered = true;
  var gate = $('loginGate'); if (gate) gate.hidden = true;
  var root = $('appRoot'); if (root) root.hidden = false;
  var bar = $('taskbar'); if (bar) bar.hidden = false;
  if (typeof window.pageInit === 'function') window.pageInit();
}
document.addEventListener('DOMContentLoaded', function () {
  var form = $('loginForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      showLoginError('');
      if (!sb) { showLoginError('The sync library could not load — check your connection and reload the page.'); return; }
      var btn = $('loginBtn');
      btn.disabled = true; btn.textContent = 'Logging in…';
      sb.auth.signInWithPassword({ email: $('loginEmail').value.trim(), password: $('loginPass').value })
        .then(function (res) {
          btn.disabled = false; btn.textContent = 'Log in ➤';
          if (res.error) {
            showLoginError('Login failed: ' + res.error.message + ' — double-check the email and password for your account.');
            return;
          }
          enterApp();
        })
        .catch(function () {
          btn.disabled = false; btn.textContent = 'Log in ➤';
          showLoginError('Could not reach the login server — check your connection and try again.');
        });
    });
  }
  document.querySelectorAll('[data-logout]').forEach(function (b) {
    b.addEventListener('click', function () {
      var done = function () { location.reload(); };
      if (sb) sb.auth.signOut().then(done).catch(done); else done();
    });
  });
  function tick() {
    var s = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    document.querySelectorAll('.js-clock').forEach(function (el) { el.textContent = s; });
  }
  setInterval(tick, 15000); tick();

  if (!sb) {
    showLoginError('The sync library could not load — check your connection and reload the page.');
    return;
  }
  sb.auth.getSession().then(function (res) {
    if (res.data && res.data.session) enterApp();
  }).catch(function () { /* stay on login screen */ });
  sb.auth.onAuthStateChange(function (event, session) {
    if (session && !appEntered) enterApp();
  });
});
