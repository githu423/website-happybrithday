import './styles.css';
import { BirthdayMusic } from './audio.js';

const C = window.BIRTHDAY_CONFIG || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const KEY = 'birthday-book-v1';
const STATE = Object.assign({
  page: 0, maxSeen: 0, tasks: {}, gateOpen: false, music: C.music?.autoplay !== false,
  dollPlays: 0, dollMsg: '', dressed: false, roses: [], roseMsg: '', quizIndex: 0, quizDone: false,
  unlocked: false, signature: '', sealed: false, certDate: '', serial: '', loveIndex: 0,
}, (() => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } })());
function save() { try { localStorage.setItem(KEY, JSON.stringify(STATE)); } catch {} }
function resetAll() { try { localStorage.removeItem(KEY); } catch {} location.reload(); }
function text(id, value) { const el = $(id); if (el) el.textContent = value ?? ''; }

document.title = `Happy Birthday — ${C.recipient || 'Sayang'} 🎂`;
text('#gate-kicker', C.gate?.kicker); text('#gate-title', C.gate?.question || `Kamu ${C.recipient || 'Sayang'}?`);
text('#gate-lead', C.gate?.lead); text('#yes-btn', C.gate?.yes || 'Iya, aku 🙋‍♀️'); text('#no-btn', C.gate?.no || 'Bukan…');
text('#opening-kicker', C.opening?.kicker); text('#opening-title', C.recipient || 'Sayang'); text('#opening-lead', C.opening?.lead);
text('#opening-hint', C.opening?.hint); text('#opening-psst', C.opening?.psst);
text('#letter-greeting', C.letter?.greeting); text('#letter-closing', C.letter?.closing);
const letterBox = $('#letter-paragraphs');
(C.letter?.paragraphs || []).forEach((p) => { const el = document.createElement('p'); el.textContent = p; letterBox.append(el); });
text('#time-sub', C.clock?.sub); text('#mascot-name', C.mascot?.name || 'Eren');
if (C.mascot?.image) $('#doll-img').src = C.mascot.image;
text('#album-sub', C.album?.sub); text('#heart-sub', C.heart?.sub); text('#video-note', C.video?.note);
text('#cert-kicker', C.certificate?.kicker); text('#cert-title', C.certificate?.title); text('#cert-text', C.certificate?.text);
text('#cert-name', C.recipient); text('#cert-note', C.certificate?.note);
$('#cert-role').innerHTML = '';
$('#cert-role').append('secara sah, sadar, dan tanpa paksaan ditetapkan sebagai ');
const roleB = document.createElement('b'); roleB.textContent = C.certificate?.role || 'Wanita Kesayangan';
$('#cert-role').append(roleB, ` satu-satunya dari `, Object.assign(document.createElement('b'), { textContent: C.sender || 'Aku' }), '.');
const perks = $('#cert-perks'); (C.certificate?.perks || []).forEach((p) => { const li = document.createElement('li'); li.textContent = p; perks.append(li); });
text('#sender-name', C.sender); text('#recipient-name', C.recipient); text('#sig-fallback', C.sender);
if (C.certificate?.signatureSrc) { const img = $('#sig-img'); img.src = C.certificate.signatureSrc; img.hidden = false; $('#sig-fallback').hidden = true; img.addEventListener('error', () => { img.hidden = true; $('#sig-fallback').hidden = false; }); }
text('#closing-title', `${C.closing?.title || 'I love you,'} ${C.recipient || 'Sayang'}`);
text('#closing-lead', C.closing?.lead); text('#closing-sign', `— ${C.sender || 'Aku'}`); text('#fan-note', C.fanNote);

/* ───────── kelopak & hati ───────── */
(function petals() {
  const c = $('#petals'); if (!c || REDUCED) return; const x = c.getContext('2d');
  let w, h; const P = []; const N = innerWidth < 600 ? 18 : 34;
  const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
  size(); addEventListener('resize', size);
  const mk = () => ({ x: rnd(0, w), y: rnd(-h, 0), r: rnd(5, 13), s: rnd(.3, 1.1), a: rnd(0, 6.28), va: rnd(-.025, .025), sw: rnd(0, 1.7), o: rnd(.25, .75), c: Math.random() < .18 ? '#ffd27a' : '#ff2e63' });
  for (let i = 0; i < N; i++) P.push(mk());
  (function loop() {
    x.clearRect(0, 0, w, h);
    for (const p of P) {
      p.y += p.s; p.a += p.va; p.x += Math.sin(p.y / 55) * p.sw * .45;
      if (p.y > h + 24) Object.assign(p, mk(), { y: -24 });
      x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.globalAlpha = p.o; x.fillStyle = p.c;
      x.beginPath(); x.ellipse(0, 0, p.r, p.r * .6, 0, 0, 6.3); x.fill(); x.restore();
    }
    requestAnimationFrame(loop);
  })();
})();
function burst(x, y, n = 8, chars = ['❤️', '💗', '💘', '🌹', '✨']) {
  if (REDUCED) return; const box = $('#hearts');
  for (let i = 0; i < n; i++) {
    const e = document.createElement('span'); e.className = 'fly-heart'; e.textContent = chars[(Math.random() * chars.length) | 0];
    e.style.cssText = `left:${x}px;top:${y}px;font-size:${rnd(16, 30)}px;animation-delay:${i * 35}ms`;
    e.style.setProperty('--dx', `${rnd(-90, 90)}px`); e.style.setProperty('--rot', `${rnd(-60, 60)}deg`);
    box.append(e); setTimeout(() => e.remove(), 1900);
  }
}
const burstAt = (el, n = 10, c) => { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, n, c); };
function flash() { if (REDUCED) return; const f = $('#flash'); f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
addEventListener('click', (e) => { if (!e.target.closest('#sig-pad,.icon-btn,.nav-btn,dialog')) burst(e.clientX, e.clientY, 3); });

/* ───────── musik ───────── */
const music = new BirthdayMusic(C.music?.src || '', C.music?.volume ?? 0.6);
const mb = $('#music-btn');
function setMusicUI(on) { mb.classList.toggle('on', on); mb.textContent = on ? '🎶' : '🎵'; mb.setAttribute('aria-pressed', String(on)); mb.setAttribute('aria-label', on ? 'Matikan musik' : 'Nyalakan musik'); }
async function playMusic(silent = true) { try { await music.start(); STATE.music = true; save(); setMusicUI(true); return true; } catch { if (!silent) toast('Musik belum bisa diputar. Coba tombol 🎵 lagi.'); return false; } }
function stopMusic() { music.stop(); STATE.music = false; save(); setMusicUI(false); }
mb.addEventListener('click', () => { music.playing ? stopMusic() : playMusic(false); });
setMusicUI(!!STATE.music);
(function autoMusic() {
  if (!STATE.music) return;
  const kick = async () => { if (!STATE.music) return off(); if (await playMusic()) off(); };
  const off = () => ['pointerdown', 'keydown', 'touchstart'].forEach((t) => removeEventListener(t, kick));
  ['pointerdown', 'keydown', 'touchstart'].forEach((t) => addEventListener(t, kick, { once: false }));
})();

/* ───────── toast / dialog ───────── */
let toastT;
function toast(msg, ms = 3000) { const el = $('#lock-msg'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), ms); }
function openDialog(d) { if (!d.open) d.showModal(); }
$$('dialog').forEach((d) => {
  $$('[data-close]', d).forEach((b) => b.addEventListener('click', () => d.close()));
  d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
});
$('#help-btn').addEventListener('click', () => openDialog($('#help-dialog')));

/* ───────── mesin halaman ───────── */
const pages = $$('.page');
const TASKS = {
  baca: { done: false, msg: 'Baca dulu suratnya ya, sebentar aja 💌' },
  doll: { done: false, msg: 'Ajak Eren main dulu dong, minimal 3 kali 🎂' },
  rose: { done: false, msg: 'Petik minimal 3 mawar dulu ya 🌹' },
  album: { done: false, msg: 'Buka satu foto dulu ya 📸' },
  quiz: { done: false, msg: 'Selesaikan kuisnya dulu, gampang kok 😌' },
  heart: { done: false, msg: 'Isi hatinya sampai 100% dulu ya 💗' },
  sign: { done: false, msg: 'Tanda tangan dulu di kotaknya 🖊️' },
};
Object.keys(TASKS).forEach((k) => { if (STATE.tasks[k]) TASKS[k].done = true; });
let cur = 0, maxSeen = clamp(STATE.maxSeen | 0, 0, pages.length - 1);
const dotsBox = $('#dots');
pages.forEach((p, i) => {
  const b = document.createElement('button'); b.className = 'dot'; b.type = 'button';
  b.title = p.dataset.title || `Halaman ${i + 1}`; b.setAttribute('aria-label', b.title);
  b.addEventListener('click', () => { if (i <= maxSeen) go(i); }); dotsBox.append(b);
});
const dots = $$('.dot');
function canLeave(i) { if (pages[i].dataset.page === 'gate') return !!STATE.gateOpen; const t = pages[i].dataset.task; return !t || TASKS[t].done; }
function sync() {
  dots.forEach((d, i) => { d.classList.toggle('active', i === cur); d.classList.toggle('done', i < maxSeen); d.disabled = i > maxSeen; d.setAttribute('aria-current', i === cur ? 'page' : 'false'); });
  text('#nav-label', pages[cur].dataset.title || '');
  $('#prev').disabled = cur === 0;
  const last = cur === pages.length - 1;
  $('#next').disabled = last;
  $('#next').classList.toggle('locked', !last && !canLeave(cur));
}
function nudge(msg) { const n = $('#next'); n.classList.remove('nudge'); void n.offsetWidth; n.classList.add('nudge'); toast(msg, 2600); }
function tryNext() { if (cur === pages.length - 1) return; if (!canLeave(cur)) return nudge(pages[cur].dataset.page === 'gate' ? 'Jawab dulu pertanyaannya ya 😌' : TASKS[pages[cur].dataset.task].msg); go(cur + 1); }
function finishTask(key) {
  if (!TASKS[key] || TASKS[key].done) return;
  TASKS[key].done = true; STATE.tasks[key] = true; save();
  if (pages[cur].dataset.task === key) { sync(); toast('Selesai! Lanjut ke halaman berikutnya ›'); flash(); }
}
function go(i, force = false) {
  i = clamp(i, 0, pages.length - 1); if (i === cur && !force) return;
  pages.forEach((p, idx) => { p.hidden = idx !== i; p.classList.toggle('active', idx === i); });
  pages[i].scrollTop = 0; cur = i; maxSeen = Math.max(maxSeen, i);
  STATE.page = i; STATE.maxSeen = maxSeen; save(); sync(); onEnter(i);
  const heading = $('h1,h2', pages[i]); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}
$('#next').addEventListener('click', tryNext);
$('#prev').addEventListener('click', () => go(cur - 1));
addEventListener('keydown', (e) => {
  if ($('dialog[open]') || e.target.closest('input,textarea,canvas,video')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); tryNext(); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(cur - 1); }
});
let sx = 0, sy = 0, st = 0;
addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
addEventListener('touchend', (e) => {
  if (e.target.closest('#sig-pad,#heart-btn,video,dialog,input')) return;
  const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
  if (Date.now() - st < 700 && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) dx < 0 ? tryNext() : go(cur - 1);
}, { passive: true });

/* ───────── gerbang ───────── */
const NO_TEASE = C.gate?.teases || ['eh? coba lagi deh 👀', 'bohong ah 😏', 'tombolnya malu-malu 🙈', 'udah nyerah aja ❤️', 'dia lari terus 😂', 'fix kamu. titik. 💘'];
let noCount = 0; const noBtn = $('#no-btn');
function runAway() {
  noCount++; const r = Math.min(noCount * 20, 130);
  noBtn.style.transform = `translate(${rnd(-r, r)}px,${rnd(-r / 2, r / 2)}px) rotate(${rnd(-14, 14)}deg) scale(${Math.max(.35, 1 - noCount * .09)})`;
  text('#no-tease', NO_TEASE[Math.min(noCount - 1, NO_TEASE.length - 1)]);
  if (noCount >= 6) { noBtn.style.opacity = 0; noBtn.style.pointerEvents = 'none'; }
}
noBtn.addEventListener('mouseenter', runAway);
noBtn.addEventListener('click', (e) => { e.preventDefault(); runAway(); });
$('#yes-btn').addEventListener('click', (e) => { STATE.gateOpen = true; save(); burst(e.clientX, e.clientY, 24); flash(); go(1); });
$('#envelope').addEventListener('click', (e) => {
  e.currentTarget.classList.add('open'); burst(e.clientX, e.clientY, 18, ['💌', '❤️', '✨']);
  if (STATE.music) playMusic(); setTimeout(() => go(2), REDUCED ? 0 : 650);
});

/* ───────── ucapan ───────── */
let typedStarted = false;
function typeIt() {
  const el = $('#typed'); const LINES = C.typed?.length ? C.typed : ['Selamat ulang tahun ❤️'];
  if (REDUCED) { el.textContent = LINES[LINES.length - 1]; finishTask('baca'); return; }
  let li = 0, ci = 0, del = false;
  (function tick() {
    const t = LINES[li]; el.textContent = del ? t.slice(0, --ci) : t.slice(0, ++ci);
    let d = del ? 22 : rnd(36, 70);
    if (!del && ci === t.length) { if (li === LINES.length - 1) { finishTask('baca'); return; } del = true; d = 1600; }
    if (del && ci === 0) { del = false; li++; d = 220; }
    setTimeout(tick, d);
  })();
}
const letter = $('#letter-card');
if (letter && matchMedia('(hover:hover)').matches && !REDUCED) {
  letter.addEventListener('mousemove', (e) => { const r = letter.getBoundingClientRect(); const dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5; letter.style.transform = `perspective(900px) rotateY(${dx * 5}deg) rotateX(${-dy * 5}deg)`; });
  letter.addEventListener('mouseleave', () => { letter.style.transform = ''; });
}

/* ───────── waktu ───────── */
let clockStarted = false;
function startClock() {
  const pad2 = (n) => String(n).padStart(2, '0');
  const start = new Date(C.jadian || Date.now()); const valid = !Number.isNaN(start.getTime());
  const tick = () => {
    let ms = Date.now() - (valid ? start.getTime() : Date.now()); if (ms < 0) ms = 0; const s = Math.floor(ms / 1000);
    text('#c-d', Math.floor(s / 86400).toLocaleString('id-ID')); text('#c-h', pad2(Math.floor(s / 3600) % 24));
    text('#c-m', pad2(Math.floor(s / 60) % 60)); text('#c-s', pad2(s % 60));
  };
  tick(); setInterval(tick, 1000);
  const days = Math.max(1, Math.floor((Date.now() - (valid ? start.getTime() : Date.now())) / 864e5));
  const f = [
    `☀️ ${days.toLocaleString('id-ID')} kali matahari terbit, kamu tetap yang pertama aku pikirin`,
    `💓 jantungku udah berdetak ±${(days * 100800).toLocaleString('id-ID')} kali buat kamu`,
    `🌹 kalau 1 mawar per hari, kamu udah punya ${days.toLocaleString('id-ID')} tangkai`,
    `📈 level sayang: ${days.toLocaleString('id-ID')} — dan belum pernah turun`,
  ];
  $('#facts').innerHTML = ''; f.forEach((t, i) => { const s = document.createElement('span'); s.className = 'fact'; s.style.animationDelay = `${i * 120}ms`; s.textContent = t; $('#facts').append(s); });
}

/* ───────── maskot ───────── */
const DOLL = [C.mascot?.intro || 'Halo! 🎂', ...(C.mascot?.messages || [])];
const ACT = C.mascot?.actions || {};
let di = 0, dollPlays = STATE.dollPlays | 0;
const bubble = $('#doll-bubble'), doll = $('#doll');
function say(txt, cls = 'hit') {
  doll.classList.remove('hit', 'jump'); void doll.offsetWidth; doll.classList.add(cls);
  bubble.textContent = txt; bubble.style.animation = 'none'; void bubble.offsetWidth; bubble.style.animation = '';
  dollPlays++; STATE.dollPlays = dollPlays; STATE.dollMsg = txt; save();
  if (dollPlays >= 3) finishTask('doll');
}
doll.addEventListener('click', (e) => { di = (di + 1) % DOLL.length; say(DOLL[di]); burst(e.clientX, e.clientY, 6, ['💗', '🎂', '✨']); });
$$('.chip').forEach((b) => b.addEventListener('click', (e) => {
  const k = b.dataset.act, a = ACT[k] || ['❤️']; say(a[(Math.random() * a.length) | 0], 'jump');
  if (k === 'dandan') { doll.classList.add('dressed'); STATE.dressed = true; save(); }
  const em = { peluk: ['🤗', '💗'], kasih: ['🍰', '🍩', '✨'], dandan: ['🎀', '✨'], rahasia: ['🤫', '💌'] }[k] || ['❤️'];
  burst(e.clientX, e.clientY, 11, em);
}));
if (STATE.dressed) doll.classList.add('dressed');
if (STATE.dollMsg) bubble.textContent = STATE.dollMsg; else bubble.textContent = DOLL[0];

/* ───────── mawar ───────── */
const ROSES = C.roses?.length ? C.roses : ['Buat kamu 🌹'];
const bq = $('#bouquet'), picked = new Set();
function roseSVG() { return `<svg width="46" height="92" viewBox="0 0 54 104" aria-hidden="true"><path d="M27 42v56" stroke="#2f9e44" stroke-width="5" stroke-linecap="round"/><path d="M27 66c-14 0-18-10-18-10s10-6 18 4z" fill="#2f9e44"/><path d="M27 82c14 0 18-10 18-10s-10-6-18 4z" fill="#37b24d"/><g class="head"><circle cx="27" cy="26" r="20" fill="#b3002d"/><circle cx="27" cy="26" r="14.5" fill="#e01e4f"/><circle cx="27" cy="26" r="9" fill="#ff5177"/><circle cx="27" cy="26" r="3.6" fill="#ffd0dc"/><path d="M12 20q15-9 30 0" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none"/></g></svg>`; }
function updateRoses() {
  $('#rose-bar').style.width = `${picked.size / ROSES.length * 100}%`;
  text('#rose-count', picked.size === ROSES.length ? `Buketnya lengkap 💐 — semuanya buat kamu, ${C.recipient || 'Sayang'}.` : `${picked.size} / ${ROSES.length} mawar dipetik`);
}
ROSES.forEach((msg, i) => {
  const b = document.createElement('button'); b.className = 'stalk'; b.type = 'button'; b.setAttribute('aria-label', `Mawar ${i + 1}`); b.innerHTML = roseSVG();
  b.addEventListener('click', (e) => {
    b.classList.add('picked'); picked.add(i); STATE.roses = [...picked]; STATE.roseMsg = msg; save();
    const m = $('#rose-msg'); m.style.opacity = 0; setTimeout(() => { m.textContent = `“${msg}”`; m.style.opacity = 1; }, 150);
    updateRoses(); burst(e.clientX, e.clientY, 7, ['🌹', '💖']);
    if (picked.size >= 3) finishTask('rose');
    if (picked.size === ROSES.length) { burst(innerWidth / 2, innerHeight / 2, 34, ['🌹', '💐', '❤️']); flash(); }
  });
  bq.append(b);
});
if (STATE.roses?.length) { const st = [...bq.children]; STATE.roses.forEach((i) => { if (st[i]) { st[i].classList.add('picked'); picked.add(i); } }); updateRoses(); if (STATE.roseMsg) text('#rose-msg', `“${STATE.roseMsg}”`); } else updateRoses();

/* ───────── album ───────── */
const photos = (C.photos || []).map((p) => ({ ...p })); let localPhotos = [];
function renderAlbum() {
  const grid = $('#album-grid'); grid.innerHTML = '';
  photos.forEach((p, i) => {
    const src = localPhotos[i] || p.src;
    const b = document.createElement('button'); b.className = 'photo-card'; b.type = 'button';
    const thumb = document.createElement('span'); thumb.className = 'photo-thumb';
    if (src) { const img = document.createElement('img'); img.src = src; img.alt = p.alt || p.caption || ''; img.loading = 'lazy'; thumb.append(img); }
    else thumb.textContent = ['🌹', '🎂', '✨', '💌', '🎞️', '❤️'][i % 6];
    const cap = document.createElement('span'); cap.className = 'photo-caption'; cap.textContent = p.caption || `Cerita ${i + 1}`;
    const date = document.createElement('small'); date.textContent = p.date || '';
    b.append(thumb, cap, date); b.addEventListener('click', () => openPhoto(i)); grid.append(b);
  });
}
function openPhoto(i) {
  const p = photos[i]; const src = localPhotos[i] || p.src; const box = $('#photo-large'); box.innerHTML = '';
  if (src) { const img = document.createElement('img'); img.src = src; img.alt = p.alt || p.caption || ''; box.append(img); }
  else { const d = document.createElement('div'); d.className = 'placeholder'; d.textContent = '🌹'; box.append(d); }
  text('#photo-caption', p.caption || ''); text('#photo-secret', p.secret || ''); openDialog($('#photo-dialog')); finishTask('album');
}
$('#photo-input').addEventListener('change', (e) => {
  const files = [...e.target.files].filter((f) => f.type.startsWith('image/') && f.size <= 15 * 1024 * 1024).slice(0, photos.length);
  localPhotos.forEach((u) => URL.revokeObjectURL(u)); localPhotos = files.map((f) => URL.createObjectURL(f));
  $('#reset-photos').hidden = localPhotos.length === 0; renderAlbum();
  text('#album-note', localPhotos.length ? `${localPhotos.length} foto lokal terpasang. Tidak di-upload; hilang saat refresh.` : 'Foto sementara tidak di-upload. Untuk permanen, taruh di public/media/photos/.');
});
$('#reset-photos').addEventListener('click', () => { localPhotos.forEach((u) => URL.revokeObjectURL(u)); localPhotos = []; $('#reset-photos').hidden = true; $('#photo-input').value = ''; renderAlbum(); text('#album-note', 'Foto sementara tidak di-upload. Untuk permanen, taruh di public/media/photos/.'); });
renderAlbum();

/* ───────── kuis ───────── */
const QUIZ = C.quiz?.length ? C.quiz : [{ q: 'Kamu sayang aku nggak?', o: ['Iya', 'Banget', 'Selalu'], f: 'Sah ❤️' }];
let qi = STATE.quizIndex | 0;
function quizDoneUI() { text('#q-text', 'Skor kamu: 100/100 🏆'); $('#q-opts').innerHTML = ''; $('#q-feed').classList.add('big'); text('#q-feed', 'Sempurna. Ya iyalah, semua jawabannya kamu 😚'); text('#q-progress', 'Lulus dengan predikat: Pacar Teladan'); }
function renderQ() {
  const Q = QUIZ[qi]; text('#q-text', Q.q); text('#q-progress', `Soal ${qi + 1} dari ${QUIZ.length}`); text('#q-feed', '\u00a0'); $('#q-feed').classList.remove('big');
  const box = $('#q-opts'); box.innerHTML = '';
  Q.o.forEach((t) => {
    const b = document.createElement('button'); b.className = 'opt'; b.type = 'button'; b.textContent = t;
    b.addEventListener('click', (e) => {
      box.querySelectorAll('.opt').forEach((x) => { x.disabled = true; }); b.classList.add('good'); text('#q-feed', Q.f); burst(e.clientX, e.clientY, 10, ['✅', '💖', '🌹']);
      setTimeout(() => { qi++; STATE.quizIndex = qi; save(); if (qi < QUIZ.length) renderQ(); else { quizDoneUI(); STATE.quizDone = true; save(); finishTask('quiz'); burst(innerWidth / 2, innerHeight / 2, 26, ['🏆', '🎉', '❤️']); } }, REDUCED ? 200 : 1150);
    });
    box.append(b);
  });
}
if (STATE.quizDone || qi >= QUIZ.length) quizDoneUI(); else renderQ();

/* ───────── tahan hati ───────── */
let pct = STATE.unlocked ? 100 : 0, holding = false, unlocked = !!STATE.unlocked, raf = null;
const TEASE = C.heart?.teases || ['tekan dan tahan ya… 😳', 'nah gitu, jangan dilepas 💗', 'setengah jalan, kamu kuat!', 'dikit lagi sayang 🥺', 'WAAA HAMPIR PENUH!! 🔥'];
const hb = $('#heart-btn');
function updateHeart() { $('#heart-fill').setAttribute('y', String(112 - 112 * pct / 100)); text('#heart-pct', `${Math.round(pct)}%`); text('#heart-tease', unlocked ? 'Sudah kebuka 🎬 lanjut ke halaman videonya' : TEASE[Math.min(TEASE.length - 1, Math.floor(pct / 21))]); }
function loopHold() { if (!holding || unlocked) return; pct = Math.min(100, pct + .9); updateHeart(); if (pct >= 100) return unlockVideo(); raf = requestAnimationFrame(loopHold); }
function decay() { if (holding || unlocked || pct <= 0) return; pct = Math.max(0, pct - .5); updateHeart(); requestAnimationFrame(decay); }
function startHold(e) { if (unlocked) return; if (e?.cancelable) e.preventDefault(); holding = true; hb.classList.add('beat'); cancelAnimationFrame(raf); loopHold(); burstAt(hb, 3); }
function releaseHold() { if (unlocked || !holding) return; holding = false; hb.classList.remove('beat'); cancelAnimationFrame(raf); requestAnimationFrame(decay); }
hb.addEventListener('pointerdown', startHold);
['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => hb.addEventListener(t, releaseHold));
addEventListener('pointerup', releaseHold);
hb.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) startHold(e); });
hb.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') releaseHold(); });
function unlockVideo() { unlocked = true; holding = false; hb.classList.remove('beat'); pct = 100; updateHeart(); burstAt(hb, 40); flash(); STATE.unlocked = true; save(); finishTask('heart'); }
$('#heart-skip').addEventListener('click', () => { if (!unlocked) unlockVideo(); });
updateHeart();

/* ───────── video ───────── */
const vid = $('#the-video'); let vidTimer = null, vidTick = null; let musicWasPlaying = false;
function setVideoSrc(src, poster) {
  if (!src) { vid.hidden = true; $('#video-empty').hidden = false; return; }
  $('#video-empty').hidden = true; vid.hidden = false; vid.src = src; if (poster) vid.poster = poster; vid.load();
}
setVideoSrc(C.video?.src, C.video?.poster);
function stopVideoCountdown() { clearTimeout(vidTimer); clearInterval(vidTick); $('#vid-note').classList.remove('show'); }
function startVideoCountdown() {
  stopVideoCountdown(); if (!vid.src || vid.hidden) return;
  const delay = Math.max(0, Number(C.video?.delay ?? 2000)); const note = $('#vid-note'); let left = Math.ceil(delay / 1000);
  note.textContent = `Videonya mulai dalam ${left}…`; note.classList.add('show');
  vidTick = setInterval(() => { left--; note.textContent = left > 0 ? `Videonya mulai dalam ${left}…` : 'Mulai 🎬'; if (left <= 0) clearInterval(vidTick); }, 1000);
  vidTimer = setTimeout(async () => {
    try { await vid.play(); note.textContent = 'Selamat menonton 🍿'; setTimeout(() => note.classList.remove('show'), 2200); }
    catch { try { vid.muted = true; await vid.play(); note.textContent = '🔇 Ketuk video untuk menyalakan suara'; note.onclick = () => { vid.muted = false; note.classList.remove('show'); note.onclick = null; }; } catch { note.textContent = 'Ketuk tombol play untuk mulai ▶'; } }
  }, delay);
}
vid.addEventListener('play', () => { musicWasPlaying = music.playing; if (music.playing) music.stop(); });
['pause', 'ended'].forEach((t) => vid.addEventListener(t, () => { if (musicWasPlaying && STATE.music) playMusic(); musicWasPlaying = false; }));
$('#video-input').addEventListener('change', (e) => { const f = e.target.files?.[0]; if (!f || !f.type.startsWith('video/') || f.size > 250 * 1024 * 1024) return; if (vid.src?.startsWith('blob:')) URL.revokeObjectURL(vid.src); setVideoSrc(URL.createObjectURL(f)); startVideoCountdown(); });

/* ───────── sertifikat ───────── */
if (!STATE.certDate) { STATE.certDate = new Date().toISOString(); save(); }
if (!STATE.serial) { STATE.serial = `BD-${new Date(STATE.certDate).getFullYear()}-${String(Math.floor(rnd(100, 999)))}`; save(); }
const CERT_DATE_STR = new Date(STATE.certDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
text('#cert-date', `Ditetapkan pada ${CERT_DATE_STR} • No. ${STATE.serial}`);
const pad = $('#sig-pad'), px = pad.getContext('2d');
let drawing = false, signed = false, last = null, ink = 0;
function fitPad() {
  const r = pad.getBoundingClientRect(), dpr = devicePixelRatio || 1; if (!r.width) return;
  const img = signed ? pad.toDataURL() : null; pad.width = r.width * dpr; pad.height = r.height * dpr;
  px.setTransform(dpr, 0, 0, dpr, 0, 0); px.lineCap = 'round'; px.lineJoin = 'round'; px.strokeStyle = '#8a0d3a';
  const src = img || STATE.signature; if (src) { const i = new Image(); i.onload = () => px.drawImage(i, 0, 0, r.width, r.height); i.src = src; }
}
addEventListener('resize', () => setTimeout(fitPad, 150));
const ppos = (e) => { const r = pad.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
pad.addEventListener('pointerdown', (e) => { e.preventDefault(); pad.setPointerCapture(e.pointerId); drawing = true; last = ppos(e); });
pad.addEventListener('pointermove', (e) => {
  if (!drawing) return; e.preventDefault(); const p = ppos(e), d = Math.hypot(p.x - last.x, p.y - last.y);
  px.lineWidth = Math.max(1.4, 4.2 - d * .12); px.beginPath(); px.moveTo(last.x, last.y); px.lineTo(p.x, p.y); px.stroke();
  ink += d; last = p;
  if (!signed && ink > 40) { signed = true; $('#pad-hint').style.display = 'none'; text('#cert-status', 'Tanda tangan terdeteksi ✨ tinggal klik “Sahkan & Download”.'); finishTask('sign'); }
});
function endDraw() { if (!drawing) return; drawing = false; if (signed) { try { STATE.signature = pad.toDataURL('image/png'); save(); } catch {} } }
['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => pad.addEventListener(t, endDraw));
$('#clear-sig').addEventListener('click', () => {
  px.clearRect(0, 0, pad.width, pad.height); signed = false; ink = 0; STATE.signature = ''; STATE.sealed = false; STATE.tasks.sign = false; TASKS.sign.done = false; save(); sync();
  $('#pad-hint').style.display = ''; $('#wax').classList.remove('on'); text('#cert-status', 'Belum ditandatangani…');
});
if (STATE.signature) { signed = true; ink = 999; $('#pad-hint').style.display = 'none'; text('#cert-status', 'Tanda tangan kamu tersimpan ✨'); setTimeout(fitPad, 200); if (STATE.sealed) { $('#wax').classList.add('on'); text('#cert-status', 'Sertifikat sudah disahkan 🌹 bisa di-download lagi kapan aja.'); } }
function wrapText(ctx, text, x, y, maxW, lineH, align = 'center') {
  ctx.textAlign = align; const words = String(text).split(/\s+/); let line = '';
  for (const w of words) { const next = line ? `${line} ${w}` : w; if (ctx.measureText(next).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lineH; } else line = next; }
  if (line) ctx.fillText(line, x, y); return y + lineH;
}
function loadImage(src) { return new Promise((res) => { if (!src) return res(null); const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
async function renderCertificate() {
  await document.fonts.ready;
  const canvas = document.createElement('canvas'); canvas.width = 2000; canvas.height = 1414; const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 2000, 1414); g.addColorStop(0, '#fffaf2'); g.addColorStop(1, '#ffeef4'); ctx.fillStyle = g; ctx.fillRect(0, 0, 2000, 1414);
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 10; ctx.strokeRect(50, 50, 1900, 1314); ctx.lineWidth = 3; ctx.strokeRect(75, 75, 1850, 1264);
  ctx.textAlign = 'center'; ctx.fillStyle = '#8a6a10'; ctx.font = '600 30px "DM Sans Variable", sans-serif'; ctx.fillText((C.certificate?.kicker || 'SERTIFIKAT RESMI').split('').join(' '), 1000, 170);
  ctx.fillStyle = '#b3002d'; ctx.font = '700 92px "Fraunces Variable", Georgia'; ctx.fillText(C.certificate?.title || 'Happy Birthday', 1000, 290);
  ctx.fillStyle = '#5a2a3d'; ctx.font = '34px "DM Sans Variable", sans-serif'; ctx.fillText(C.certificate?.text || 'Dengan ini dinyatakan bahwa', 1000, 380);
  ctx.fillStyle = '#8a0d3a'; ctx.font = 'italic 700 96px "Fraunces Variable", Georgia'; ctx.fillText(C.recipient || 'Sayang', 1000, 500);
  ctx.fillStyle = '#5a2a3d'; ctx.font = '32px "DM Sans Variable", sans-serif';
  let y = wrapText(ctx, `secara sah, sadar, dan tanpa paksaan ditetapkan sebagai ${C.certificate?.role || 'Wanita Kesayangan'} satu-satunya dari ${C.sender || 'Aku'}.`, 1000, 575, 1400, 46);
  ctx.font = '30px "DM Sans Variable", sans-serif'; y += 20;
  (C.certificate?.perks || []).forEach((p) => { ctx.fillText(p, 1000, y); y += 48; });
  ctx.font = 'italic 28px "DM Sans Variable", sans-serif'; wrapText(ctx, C.certificate?.note || '', 1000, y + 20, 1400, 40);
  const sigY = 1080; ctx.strokeStyle = '#3a1326'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(330, sigY + 120); ctx.lineTo(830, sigY + 120); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1170, sigY + 120); ctx.lineTo(1670, sigY + 120); ctx.stroke();
  const senderSig = await loadImage(C.certificate?.signatureSrc);
  if (senderSig) ctx.drawImage(senderSig, 380, sigY - 20, 400, 140); else { ctx.fillStyle = '#8a0d3a'; ctx.font = '80px "Caveat Variable", cursive'; ctx.fillText(C.sender || 'Aku', 580, sigY + 70); }
  const recSig = await loadImage(STATE.signature); if (recSig) ctx.drawImage(recSig, 1220, sigY - 20, 400, 140);
  ctx.fillStyle = '#3a1326'; ctx.font = '600 36px "Fraunces Variable", Georgia'; ctx.fillText(C.sender || 'Aku', 580, sigY + 170); ctx.fillText(C.recipient || 'Sayang', 1420, sigY + 170);
  ctx.fillStyle = '#6d4a5c'; ctx.font = '26px "DM Sans Variable", sans-serif'; ctx.fillText('Pemberi Hadiah', 580, sigY + 210); ctx.fillText('Penerima Hadiah', 1420, sigY + 210);
  ctx.fillText(`Ditetapkan pada ${CERT_DATE_STR} • No. ${STATE.serial}`, 1000, 1330);
  return canvas;
}
$('#preview-cert').addEventListener('click', async () => { const canvas = await renderCertificate(); $('#preview-img').src = canvas.toDataURL('image/png'); openDialog($('#preview-dialog')); });
$('#save-cert').addEventListener('click', async () => {
  if (!signed) return toast('Tanda tangan dulu ya, baru bisa disahkan 🖊️');
  const canvas = await renderCertificate(); const blob = await new Promise((res) => canvas.toBlob(res, 'image/png')); if (!blob) return;
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `sertifikat-birthday-${(C.recipient || 'sayang').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  STATE.sealed = true; save(); $('#wax').classList.add('on'); $('#cert').classList.add('sealed'); text('#cert-status', 'Sertifikat sudah disahkan 🌹 bisa di-download lagi kapan aja.'); burstAt($('#save-cert'), 24);
});

/* ───────── penutup ───────── */
let loveIndex = STATE.loveIndex | 0;
$('#love-btn').addEventListener('click', (e) => { const msgs = C.closing?.love || ['Aku juga sayang kamu ❤️']; text('#love-msg', msgs[loveIndex % msgs.length]); loveIndex++; STATE.loveIndex = loveIndex; save(); burst(e.clientX, e.clientY, 26, ['❤️', '💗', '💘']); flash(); });
$('#again-btn').addEventListener('click', resetAll);

/* ───────── enter halaman ───────── */
function onEnter(i) {
  const id = pages[i].dataset.page;
  if (id === 'greeting' && !typedStarted) { typedStarted = true; typeIt(); }
  if (id === 'time' && !clockStarted) { clockStarted = true; startClock(); }
  if (id === 'video') { const c = $('#curtain'); if (c) { c.classList.add('open'); setTimeout(() => { c.style.display = 'none'; }, REDUCED ? 0 : 1700); } startVideoCountdown(); } else { stopVideoCountdown(); if (!vid.hidden) vid.pause(); }
  if (id === 'certificate') setTimeout(fitPad, 300);
  if (id === 'closing') { burst(innerWidth / 2, innerHeight / 2, 26); flash(); }
}

/* ───────── boot ───────── */
if (STATE.gateOpen) {
  const target = clamp(STATE.page | 0, 1, pages.length - 1); maxSeen = Math.max(maxSeen, target); go(target, true);
  const r = $('#resume-msg'); r.textContent = 'Lanjut dari halaman terakhir 💌'; r.classList.add('show'); setTimeout(() => r.classList.remove('show'), 2600);
} else { go(0, true); }
sync();
