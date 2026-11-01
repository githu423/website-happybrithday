import './styles.css';
import { icon, hydrateIcons } from './icons.js';
import { placeholderImage } from './illustrations.js';
import { BirthdayMusic } from './audio.js';
import { celebrate } from './celebrations.js';
import { ScratchCard } from './scratch.js';

const config = window.BIRTHDAY_CONFIG;
if (!config || !Array.isArray(config.photos) || !Array.isArray(config.reasons) || !Array.isArray(config.coupons)) {
  throw new Error('Periksa public/config.js: photos, reasons, dan coupons harus berupa array.');
}
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(`untukmu:${key}`)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(`untukmu:${key}`, JSON.stringify(value)); } catch { /* Private browsing is fine. */ } },
};
const valueAt = (path, fallback = '') => path.split('.').reduce((value, key) => value?.[key], config) ?? fallback;
const safeList = (items) => Array.isArray(items) ? items.filter((item) => item && typeof item === 'object') : [];
const reasons = safeList(config.reasons);
const coupons = safeList(config.coupons);
const photos = safeList(config.photos).map((photo) => ({ ...photo }));
const letterParagraphs = Array.isArray(config.letter?.paragraphs) ? config.letter.paragraphs.filter((text) => typeof text === 'string') : [];
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  $('#toast-message').textContent = message;
  $('#toast').classList.add('is-visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('is-visible'), 4500);
}

function mediaURL(path) {
  if (typeof path !== 'string' || !path.trim()) return '';
  try {
    const url = new URL(path.trim(), window.location.origin);
    return ['http:', 'https:', 'blob:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const fileStem = (text) => String(text).normalize('NFKD').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'untukmu';

// All personal content goes through textContent, never interpolated HTML.
$$('[data-bind]').forEach((node) => { node.textContent = valueAt(node.dataset.bind, node.textContent); });
document.title = `Untuk ${config.recipient || 'Sayang'}, ${config.nickname || 'manusia favoritku'} ♡`;
$('meta[property="og:title"]').content = document.title;
$('.letter-date').textContent = config.birthdayLabel || 'Hari ini, dan setiap hari.';
if (Number.isInteger(config.age) && config.age > 0 && config.age < 150) {
  $('.hero-eyebrow').append(document.createTextNode(` · ${config.age} TAHUN`));
}
letterParagraphs.forEach((text) => {
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  $('#letter-body').append(paragraph);
});
$('#year').textContent = new Date().getFullYear();
hydrateIcons();

// Scroll is ornamental; every section remains readable without animation.
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 25px 0px' });
  $$('.reveal').forEach((node) => revealObserver.observe(node));
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$('.main-nav a').forEach((link) => {
        const active = link.hash === `#${entry.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
  ['reasons', 'memories', 'surprises'].forEach((id) => navObserver.observe(document.getElementById(id)));
}
let scrollQueued = false;
function updateScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  $('#scroll-progress').style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  if (window.scrollY < 250) $$('.main-nav a').forEach((link) => { link.classList.remove('is-active'); link.removeAttribute('aria-current'); });
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScrollProgress); }
}, { passive: true });
updateScrollProgress();

// Native dialogs provide focus trapping, Escape to close, and focus restoration.
function openDialog(dialog) {
  if (dialog.open) return;
  if (!video.hidden) video.pause();
  dialog.showModal();
  if (dialog.id === 'setup-dialog') $('[role="tab"][aria-selected="true"]', dialog).focus({ preventScroll: true });
}
$$('dialog').forEach((dialog) => {
  $$('[data-close]', dialog).forEach((button) => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});

// A small deck of reasons; favorites stay on this device only.
let reasonIndex = 0;
const savedLikes = storage.get('favorite-reasons', []);
const likedReasons = new Set(Array.isArray(savedLikes) ? savedLikes.filter((title) => typeof title === 'string') : []);
function updateReasonLike() {
  const liked = likedReasons.has(reasons[reasonIndex]?.title);
  $('#reason-like').setAttribute('aria-pressed', String(liked));
  $('#reason-like').setAttribute('aria-label', liked ? 'Hapus alasan ini dari favorit' : 'Simpan alasan ini sebagai favorit');
}
function renderReason(animate = true) {
  const reason = reasons[reasonIndex];
  if (!reason) {
    $('#reason-title').textContent = 'Kamu, ya kamu.';
    $('#reason-text').textContent = 'Alasannya lebih banyak dari yang bisa ditulis di sini.';
    $('#reason-counter').textContent = '00 / 00';
    $('.reason-controls').hidden = true;
    $('#reason-like').hidden = true;
    return;
  }
  $('#reason-title').textContent = reason.title || 'Kamu, ya kamu.';
  $('#reason-text').textContent = reason.text || '';
  $('#reason-icon').innerHTML = icon(reason.icon);
  $('#reason-counter').textContent = `${String(reasonIndex + 1).padStart(2, '0')} / ${String(reasons.length).padStart(2, '0')}`;
  $$('.reason-dot').forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === reasonIndex)));
  updateReasonLike();
  if (animate && !reducedMotion.matches) {
    $('#reason-card').classList.remove('is-changing');
    void $('#reason-card').offsetWidth;
    $('#reason-card').classList.add('is-changing');
  }
}
reasons.forEach((reason, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'reason-dot';
  button.setAttribute('aria-label', `Alasan ${index + 1}: ${reason.title || 'Tentang kamu'}`);
  button.addEventListener('click', () => { reasonIndex = index; renderReason(); });
  $('#reason-dots').append(button);
});
function moveReason(direction) {
  if (!reasons.length) return;
  reasonIndex = (reasonIndex + direction + reasons.length) % reasons.length;
  renderReason();
}
$('#reason-prev').addEventListener('click', () => moveReason(-1));
$('#reason-next').addEventListener('click', () => moveReason(1));
$('#reason-like').addEventListener('click', () => {
  const title = reasons[reasonIndex]?.title;
  if (!title) return;
  if (likedReasons.has(title)) { likedReasons.delete(title); showToast('Alasan dihapus dari favorit. Sayangnya tetap. ♡'); }
  else { likedReasons.add(title); showToast('Satu alasan favorit disimpan di perangkat ini. ♡'); }
  storage.set('favorite-reasons', [...likedReasons]);
  updateReasonLike();
});
renderReason(false);

// Gallery: real files when supplied, original illustrations while waiting.
const localPhotoURLs = new Map();
let lightboxIndex = 0;
function photoSource(photo) { return photo.localSrc || mediaURL(photo.src) || photo.fallbackSrc || placeholderImage(photo.placeholder, photo.color); }
function renderGallery() {
  const grid = $('#photo-grid');
  grid.replaceChildren();
  const rotations = [-3, 2.5, -2, 2, -2.5, 2.5];
  photos.forEach((photo, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'photo-card';
    card.style.setProperty('--rotation', `${rotations[index % rotations.length]}deg`);
    card.setAttribute('aria-label', `Buka foto ${index + 1}: ${photo.caption || 'Cerita kita'}`);
    const frame = document.createElement('span');
    frame.className = 'photo-image';
    const image = document.createElement('img');
    image.width = 600;
    image.height = 550;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.alt = photo.alt || photo.caption || `Foto kenangan ${index + 1}`;
    image.src = photoSource(photo);
    image.addEventListener('error', () => {
      photo.fallbackSrc = placeholderImage(photo.placeholder, photo.color);
      image.src = photo.fallbackSrc;
      image.alt = `Ilustrasi penanda — ${photo.alt || photo.caption || 'foto belum ditemukan'}`;
      $('#gallery-note').textContent = 'Ada foto yang belum ditemukan. Periksa nama file dan huruf besar/kecil di public/config.js.';
    }, { once: true });
    frame.append(image);
    const caption = document.createElement('span');
    caption.className = 'photo-caption-wrap';
    const title = document.createElement('span');
    title.className = 'photo-caption';
    title.textContent = photo.caption || 'Cerita kita.';
    const date = document.createElement('span');
    date.className = 'photo-date';
    date.textContent = photo.date || `CERITA ${String(index + 1).padStart(2, '0')}`;
    caption.append(title, date);
    const tape = document.createElement('span');
    tape.className = 'washi-tape photo-tape';
    tape.setAttribute('aria-hidden', 'true');
    card.append(frame, caption, tape);
    card.addEventListener('click', () => {
      lightboxIndex = index;
      renderLightbox();
      openDialog($('#gallery-dialog'));
    });
    grid.append(card);
  });
  if (!photos.length) {
    const empty = document.createElement('p');
    empty.className = 'section-description';
    empty.textContent = 'Bingkai pertama masih menunggu cerita kalian. Tambahkan foto lewat “Coba foto kamu”.';
    grid.append(empty);
  }
  $('#preview-photos').disabled = photos.length === 0;
  $('#reset-photos').hidden = localPhotoURLs.size === 0;
}
function renderLightbox() {
  const photo = photos[lightboxIndex];
  if (!photo) return;
  const image = document.createElement('img');
  image.className = !photo.src && !photo.localSrc || photo.fallbackSrc ? 'placeholder-image' : '';
  image.src = photoSource(photo);
  image.alt = photo.alt || photo.caption || 'Foto kenangan kita';
  image.addEventListener('error', () => {
    photo.fallbackSrc = placeholderImage(photo.placeholder, photo.color);
    image.src = photo.fallbackSrc;
    image.className = 'placeholder-image';
  }, { once: true });
  $('#lightbox-image').replaceChildren(image);
  $('#lightbox-caption').textContent = photo.caption || 'Cerita kita.';
  $('#lightbox-count').textContent = `${photo.date || 'CERITA KITA'} · ${lightboxIndex + 1} / ${photos.length}`;
  $('#lightbox-prev').hidden = photos.length < 2;
  $('#lightbox-next').hidden = photos.length < 2;
}
function movePhoto(direction) {
  if (!photos.length) return;
  lightboxIndex = (lightboxIndex + direction + photos.length) % photos.length;
  renderLightbox();
}
$('#lightbox-prev').addEventListener('click', () => movePhoto(-1));
$('#lightbox-next').addEventListener('click', () => movePhoto(1));
$('#gallery-dialog').addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') { event.preventDefault(); movePhoto(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); movePhoto(1); }
});
let swipeStart = null;
$('#lightbox-image').addEventListener('touchstart', (event) => { swipeStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }; }, { passive: true });
$('#lightbox-image').addEventListener('touchend', (event) => {
  if (!swipeStart) return;
  const dx = event.changedTouches[0].clientX - swipeStart.x;
  const dy = event.changedTouches[0].clientY - swipeStart.y;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) movePhoto(dx < 0 ? 1 : -1);
  swipeStart = null;
}, { passive: true });
$('#preview-photos').addEventListener('click', () => $('#photo-input').click());
$('#photo-input').addEventListener('change', (event) => {
  const selected = [...event.target.files];
  const valid = selected.filter((file) => (file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name)) && file.size <= 15 * 1024 * 1024);
  const accepted = valid.slice(0, photos.length);
  accepted.forEach((file, index) => {
    if (localPhotoURLs.has(index)) URL.revokeObjectURL(localPhotoURLs.get(index));
    const source = URL.createObjectURL(file);
    localPhotoURLs.set(index, source);
    photos[index] = { ...photos[index], localSrc: source, fallbackSrc: '', alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') };
  });
  renderGallery();
  if (accepted.length) {
    $('#gallery-note').textContent = `${accepted.length} foto lokal terpasang. Mau permanen? Masukkan file lewat VS Code seperti panduan di bawah.`;
    const rejected = selected.length - accepted.length;
    showToast(`${accepted.length} foto tampil di pratinjau. Tidak diunggah.${rejected ? ` ${rejected} dilewati: maksimal ${photos.length} foto, 15 MB per file.` : ' Akan hilang saat halaman dimuat ulang.'}`);
  } else showToast('Pilih JPG, PNG, WebP, GIF, atau AVIF, maksimal 15 MB per foto.');
  event.target.value = '';
});
$('#reset-photos').addEventListener('click', () => {
  localPhotoURLs.forEach((url) => URL.revokeObjectURL(url));
  localPhotoURLs.clear();
  photos.splice(0, photos.length, ...safeList(config.photos).map((photo) => ({ ...photo })));
  renderGallery();
  $('#gallery-note').textContent = 'Pratinjau direset. Foto asli dari config.js ditampilkan kembali.';
  showToast('Bingkai kembali ke cerita dari config.js.');
});
renderGallery();

// The movie is native HTML video: no third-party embeds or autoplay.
const video = $('#birthday-video');
let localVideoURL = '';
let resumeMusicAfterVideo = false;
function showVideoError() {
  $('#video-error').hidden = false;
  $('#video-error').textContent = 'Videonya belum bisa diputar. Coba MP4 (H.264 + AAC), atau periksa path di config.js. Nama file harus sama persis.';
  $('#film-play').hidden = false;
  $('#film-player').classList.remove('is-playing');
}
function setVideoSource(source, local = false) {
  $('#video-error').hidden = true;
  video.hidden = false;
  video.controls = true;
  video.src = source;
  $('#film-placeholder').hidden = true;
  $('#film-play').hidden = false;
  $('#film-player').classList.add('has-video');
  const poster = local ? '' : mediaURL(config.video?.poster);
  if (poster) video.poster = poster;
  else video.removeAttribute('poster');
  video.load();
  if (local) $('#change-video').innerHTML = `${icon('upload')} Ganti video lokal`;
}
if (mediaURL(config.video?.src)) setVideoSource(mediaURL(config.video.src));
$('#film-play').addEventListener('click', async () => {
  if (!video.src) { selectSetupTab('video'); openDialog($('#setup-dialog')); return; }
  try { await video.play(); }
  catch (error) { if (error.name !== 'AbortError') showToast('Tekan tombol play pada video. Kalau masih gagal, coba format MP4 (H.264).'); }
});
video.addEventListener('play', () => {
  $('#film-play').hidden = true;
  $('#film-player').classList.add('is-playing');
  resumeMusicAfterVideo = music.playing;
  if (music.playing) { music.stop(); updateMusicButton(); }
});
video.addEventListener('pause', () => {
  $('#film-play').hidden = false;
  $('#film-player').classList.remove('is-playing');
  if (resumeMusicAfterVideo) {
    resumeMusicAfterVideo = false;
    music.start().then(updateMusicButton).catch(() => updateMusicButton());
  }
});
video.addEventListener('ended', () => { $('#film-play').hidden = false; $('#film-player').classList.remove('is-playing'); });
video.addEventListener('error', showVideoError);
$('#change-video').addEventListener('click', () => $('#video-input').click());
$('#video-input').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!(file.type.startsWith('video/') || /\.(mp4|webm|ogv|ogg|mov)$/i.test(file.name)) || file.size > 250 * 1024 * 1024) {
    showToast('Pilih MP4, WebM, Ogg, atau MOV. Batas pratinjau lokal 250 MB.');
    event.target.value = '';
    return;
  }
  resumeMusicAfterVideo = false;
  video.pause();
  if (localVideoURL) URL.revokeObjectURL(localVideoURL);
  localVideoURL = URL.createObjectURL(file);
  setVideoSource(localVideoURL, true);
  showToast('Video hanya diputar di perangkatmu. Untuk Vercel, salin file ke folder media/video.');
  try { await video.play(); } catch { /* Native controls remain available. */ }
  event.target.value = '';
});

// Music starts only on an explicit click. Pause while the movie is playing.
const music = new BirthdayMusic(mediaURL(config.music?.src));
let musicBusy = false;
function updateMusicButton() {
  $('#music-toggle').setAttribute('aria-pressed', String(music.playing));
  $('#music-toggle').setAttribute('aria-label', music.playing ? 'Matikan musik' : 'Putar musik lembut');
  $('#music-label').textContent = music.playing ? 'Musik menyala' : 'Putar musik';
  $('#music-toggle').title = music.playing ? `${config.music?.title || 'Melodi untukmu'} — klik untuk mematikan` : 'Putar melodi lembut. Musik tidak dimulai otomatis.';
}
$('#music-toggle').addEventListener('click', async () => {
  if (musicBusy) return;
  musicBusy = true;
  resumeMusicAfterVideo = false;
  try { if (music.playing) music.stop(); else await music.start(); }
  catch { showToast('Musik belum bisa diputar. Periksa file lagu atau coba browser lain. Semua kejutan tetap bisa dibuka.'); }
  finally { updateMusicButton(); musicBusy = false; }
});
updateMusicButton();

// Three keepsakes, with gentle, device-local progress.
const storedOpened = storage.get('opened-gifts', []);
const openedGifts = new Set(Array.isArray(storedOpened) ? storedOpened.filter((key) => ['wish', 'letter', 'coupon'].includes(key)) : []);
function updateGiftProgress() {
  $$('.progress-dot').forEach((dot) => dot.classList.toggle('is-complete', openedGifts.has(dot.dataset.progress)));
  $('#progress-label').textContent = openedGifts.size === 3 ? 'Semua kejutan dibuka. Sayangnya nggak berhenti di sini. ♡' : `${openedGifts.size} dari 3 kejutan dibuka`;
  $$('[data-opened]').forEach((label) => { label.hidden = !openedGifts.has(label.dataset.opened); });
}
function markGiftOpened(key) {
  if (openedGifts.has(key)) return;
  openedGifts.add(key);
  storage.set('opened-gifts', [...openedGifts]);
  updateGiftProgress();
}
updateGiftProgress();

const candles = $$('.candle');
let wishComplete = false;
let blowing = false;
function extinguish(candle) {
  candle.classList.add('is-out');
  candle.setAttribute('aria-pressed', 'true');
  candle.setAttribute('aria-label', `Lilin ${candles.indexOf(candle) + 1} sudah ditiup`);
  if (candles.every((item) => item.classList.contains('is-out'))) finishWish();
}
function finishWish() {
  if (wishComplete) return;
  wishComplete = true;
  $('#wish-message').hidden = false;
  $('#wish-instruction').textContent = 'Satu harapan kecil, diaminkan oleh semesta.';
  $('#cake-hint').textContent = 'Semoga yang baik-baik segera menemukanmu.';
  $('#blow-candles').innerHTML = `${icon('rotate')} Nyalakan lilin lagi`;
  markGiftOpened('wish');
  const rect = $('#cake-scene').getBoundingClientRect();
  celebrate({ x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.4 });
}
candles.forEach((candle) => candle.addEventListener('click', () => { if (!blowing && !wishComplete) extinguish(candle); }));
$('#blow-candles').addEventListener('click', () => {
  if (blowing) return;
  if (wishComplete) {
    wishComplete = false;
    candles.forEach((candle, index) => {
      candle.classList.remove('is-out');
      candle.setAttribute('aria-pressed', 'false');
      candle.setAttribute('aria-label', `Tiup lilin ${index + 1}`);
    });
    $('#wish-message').hidden = true;
    $('#wish-instruction').innerHTML = 'Pejamkan mata. Simpan satu harapan.<br />Kalau sudah, tiup lilinnya, ya.';
    $('#cake-hint').textContent = 'Atau klik lilinnya satu per satu.';
    $('#blow-candles').innerHTML = `${icon('wind')} Tiup lilin & buat harapan`;
    return;
  }
  blowing = true;
  $('#blow-candles').disabled = true;
  candles.forEach((candle, index) => setTimeout(() => {
    extinguish(candle);
    if (index === candles.length - 1) { blowing = false; $('#blow-candles').disabled = false; }
  }, reducedMotion.matches ? 0 : index * 220));
});

$('#open-letter').addEventListener('click', () => { openDialog($('#letter-dialog')); markGiftOpened('letter'); });
$('#save-letter').addEventListener('click', () => {
  const text = [config.letter?.greeting || 'Untukmu,', '', ...letterParagraphs.flatMap((paragraph) => [paragraph, '']), config.letter?.closing || 'Dengan sayang,', config.sender || 'Aku'].join('\n');
  downloadBlob(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }), `surat-untuk-${fileStem(config.recipient)}.txt`);
  const button = $('#save-letter');
  button.innerHTML = `${icon('check')} Surat tersimpan`;
  setTimeout(() => { button.innerHTML = `${icon('download')} Simpan surat ini`; }, 3000);
});
$('#send-hug').addEventListener('click', () => {
  celebrate({ container: $('#letter-dialog'), count: 55 });
  const button = $('#send-hug');
  button.innerHTML = `Pelukan diterima ${icon('heart')}`;
  setTimeout(() => { button.innerHTML = `Peluk balik ${icon('heart')}`; }, 3500);
});

// Scratch-to-reveal coupon, with a real downloadable PNG keepsake.
let selectedCoupon = null;
const scratch = new ScratchCard($('#scratch-canvas'), () => {
  $('#scratch-instruction').hidden = true;
  $('#accessible-reveal').hidden = true;
  $('#save-coupon').hidden = false;
  if (document.activeElement === $('#accessible-reveal')) $('#save-coupon').focus({ preventScroll: true });
  $('#scratch-status').textContent = 'Kupon terbuka! Simpan, lalu tukar saat kita bertemu. ♡';
  markGiftOpened('coupon');
  celebrate({ container: $('#coupon-dialog'), count: 55 });
});
coupons.forEach((coupon, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'coupon-choice';
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = icon(coupon.icon);
  const title = document.createElement('span');
  title.textContent = coupon.title || `Kupon sayang ${index + 1}`;
  button.append(title);
  button.addEventListener('click', () => {
    selectedCoupon = coupon;
    $$('.coupon-choice').forEach((choice) => choice.setAttribute('aria-pressed', String(choice === button)));
    $('#ticket-title').textContent = coupon.title || 'Satu dosis dimanja';
    $('#ticket-description').textContent = coupon.description || 'Karena kamu layak disayang.';
    $('#ticket-code').textContent = coupon.code || `LOVE-${String(index + 1).padStart(3, '0')}`;
    $('#ticket-icon').innerHTML = icon(coupon.icon);
    $('#scratch-area').hidden = false;
    $('#scratch-instruction').hidden = false;
    $('#accessible-reveal').hidden = false;
    $('#save-coupon').hidden = true;
    $('#scratch-status').textContent = 'Gosok kotaknya, atau pilih “Buka tanpa menggosok”.';
    requestAnimationFrame(() => scratch.reset());
  });
  $('#coupon-choices').append(button);
});
if (!coupons.length) {
  $('#coupon-choices').textContent = 'Belum ada kupon. Tambahkan kejutan kecil di config.js.';
}
$('#open-coupons').addEventListener('click', () => openDialog($('#coupon-dialog')));
$('#accessible-reveal').addEventListener('click', () => scratch.reveal());
function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  let line = '';
  let currentY = y;
  for (const word of String(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else line = next;
  }
  if (line) context.fillText(line, x, currentY);
  return currentY;
}
$('#save-coupon').addEventListener('click', async () => {
  if (!selectedCoupon) return;
  const button = $('#save-coupon');
  button.disabled = true;
  try {
    await document.fonts.ready;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 760;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas unavailable');
    context.fillStyle = '#f6e9dc';
    context.fillRect(0, 0, 1200, 760);
    context.strokeStyle = '#bd8c75';
    context.lineWidth = 2;
    context.setLineDash([9, 9]);
    context.strokeRect(35, 35, 1130, 690);
    context.setLineDash([]);
    context.textAlign = 'center';
    context.fillStyle = '#9b8068';
    context.font = '500 18px "DM Sans Variable", sans-serif';
    context.fillText('KUPON RESMI DIMANJA · UNTUKMU.', 600, 104);
    context.fillStyle = '#bd726d';
    context.font = '75px Georgia';
    context.fillText('♡', 600, 205);
    context.fillStyle = '#293e34';
    context.font = '450 56px "Fraunces Variable", Georgia';
    const titleBottom = wrapCanvasText(context, selectedCoupon.title || 'Kupon sayang', 600, 294, 970, 65);
    context.fillStyle = '#83735f';
    context.font = '26px "DM Sans Variable", sans-serif';
    wrapCanvasText(context, selectedCoupon.description || 'Karena kamu layak disayang.', 600, titleBottom + 65, 880, 39);
    context.fillStyle = '#a4846b';
    context.font = '20px "DM Sans Variable", sans-serif';
    context.fillText(selectedCoupon.code || 'LOVE-001', 600, 583);
    context.font = '34px "Caveat Variable", cursive';
    context.fillText(`Untuk ${config.recipient || 'Sayang'}, dari ${config.sender || 'Aku'} ♡`, 600, 650, 1000);
    context.font = '16px "DM Sans Variable", sans-serif';
    context.fillText('Berlaku setiap kali kamu butuh. Tanpa kedaluwarsa.', 600, 693);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('PNG export failed');
    downloadBlob(blob, `kupon-${fileStem(selectedCoupon.code || selectedCoupon.title)}.png`);
    button.innerHTML = `${icon('check')} Kupon tersimpan`;
    setTimeout(() => { button.innerHTML = `${icon('download')} Simpan kuponku`; }, 3000);
  } catch { $('#scratch-status').textContent = 'Kupon belum bisa diunduh. Screenshot halaman ini juga boleh, kok. ♡'; }
  finally { button.disabled = false; }
});

// Friendly, accessible media setup. Local previews never leave the browser.
function selectSetupTab(name, focus = false) {
  $$('[data-setup-tab]').forEach((tab) => {
    const active = tab.dataset.setupTab === name;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    $(`#setup-${tab.dataset.setupTab}`).hidden = !active;
    if (active && focus) tab.focus();
  });
}
$$('[data-setup-tab]').forEach((tab, index, tabs) => {
  tab.addEventListener('click', () => selectSetupTab(tab.dataset.setupTab));
  tab.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectSetupTab(tabs[next].dataset.setupTab, true); }
  });
});
$('#open-setup').addEventListener('click', () => { selectSetupTab('photos'); openDialog($('#setup-dialog')); });
$('#setup-photo-preview').addEventListener('click', () => { $('#setup-dialog').close(); $('#photo-input').click(); });
$('#setup-video-preview').addEventListener('click', () => { $('#setup-dialog').close(); $('#video-input').click(); });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    resumeMusicAfterVideo = false;
    if (music.playing) { music.stop(); updateMusicButton(); }
    if (!video.hidden) video.pause();
  }
});
window.addEventListener('pagehide', (event) => {
  resumeMusicAfterVideo = false;
  music.stop();
  if (!video.hidden) video.pause();
  updateMusicButton();
  if (!event.persisted) {
    music.destroy();
    scratch.destroy();
    localPhotoURLs.forEach((url) => URL.revokeObjectURL(url));
    if (localVideoURL) URL.revokeObjectURL(localVideoURL);
  }
});
