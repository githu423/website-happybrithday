/* Eren's secret birthday mission: six optional stamps, one final reward.
   Navigation is never locked; the mission is a playful layer, not a gate. */
import { icon } from './icons.js';
import { PAGES } from './pages.js';

export const MISSION_STAMPS = [
  { key: 'reasons', page: 'reasons', icon: 'sun', label: 'Balik satu kartu alasan' },
  { key: 'memories', page: 'memories', icon: 'camera', label: 'Balik satu polaroid' },
  { key: 'film', page: 'film', icon: 'ticket', label: 'Sobek tiket bioskop' },
  { key: 'wish', page: 'wish', icon: 'wind', label: 'Tiup lilin & simpan harapan' },
  { key: 'letter', page: 'letter', icon: 'mail-heart', label: 'Buka segel surat' },
  { key: 'coupons', page: 'coupons', icon: 'sparkles', label: 'Gosok satu kupon' },
];

const fileStem = (text) => String(text).normalize('NFKD').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'untukmu';

export function createMission({ config, storage, showToast, celebrate, openDialog, downloadBlob }) {
  const $ = (selector, root = document) => root.querySelector(selector);
  const mission = config.mission || {};
  const stored = storage.get('mission-stamps', []);
  const collected = new Set(Array.isArray(stored) ? stored.filter((key) => MISSION_STAMPS.some((stamp) => stamp.key === key)) : []);
  const total = MISSION_STAMPS.length;

  $('#mission-heading').textContent = mission.title || 'Misi rahasia: bikin kamu senyum.';
  $('#mission-intro').textContent = mission.intro || 'Eren menitipkan enam tugas kecil. Kumpulkan stempelnya, lalu buka hadiah terakhir di halaman penutup.';
  $('#reward-text').textContent = mission.reward || 'Selamat ulang tahun, manusia favoritku. Tahun ini, dan tahun-tahun setelahnya, aku pilih kamu lagi.';
  $('#reward-pass-note').textContent = mission.passNote || 'Berlaku untuk satu hari penuh dimanja dan satu pelukan panjang.';
  $('#reward-heading').textContent = (mission.rewardTitle || 'Hadiah terakhir terbuka.').replace(/\.$/, '');
  $('#reward-heading').append(' ');
  const rewardHeart = document.createElement('em');
  rewardHeart.textContent = '♡';
  $('#reward-heading').append(rewardHeart);

  const list = $('#mission-list');
  const stampRow = $('#stamp-row');
  const sky = $('#mission-sky');
  MISSION_STAMPS.forEach((stamp, index) => {
    const page = PAGES.find((item) => item.id === stamp.page);
    const li = document.createElement('li');
    li.className = 'mission-item';
    li.dataset.stamp = stamp.key;
    li.innerHTML = `<span class="mission-item-icon">${icon(stamp.icon)}</span><span class="mission-item-copy"><strong></strong><small></small></span><a class="mission-item-link"></a><span class="mission-item-status" aria-hidden="true">${icon('check')}</span>`;
    $('strong', li).textContent = stamp.label;
    $('small', li).textContent = `Halaman ${index + 2} · ${page?.label || stamp.page}`;
    const link = $('a', li);
    link.href = `#${stamp.page}`;
    link.textContent = 'Buka';
    link.setAttribute('aria-label', `${stamp.label} — buka halaman ${page?.label || stamp.page}`);
    list.append(li);

    const item = document.createElement('span');
    item.className = 'stamp';
    item.dataset.stamp = stamp.key;
    item.setAttribute('role', 'listitem');
    item.title = stamp.label;
    item.innerHTML = `${icon(stamp.icon)}<span class="sr-only"></span>`;
    $('.sr-only', item).textContent = `${stamp.label}: belum terkumpul`;
    stampRow.append(item);

    const star = document.createElement('span');
    star.className = 'sky-star';
    star.dataset.stamp = stamp.key;
    star.style.setProperty('--i', index);
    star.textContent = '✦';
    sky.append(star);
  });

  function isComplete() { return collected.size === total; }

  function update() {
    $('#mission-count').textContent = `${collected.size}/${total}`;
    $('#mission-toggle').setAttribute('aria-label', `Misi rahasia Eren ${collected.size}/${total} — buka briefing, ${collected.size} dari ${total} stempel terkumpul`);
    $('#mission-status').textContent = isComplete()
      ? 'Misi selesai. Semua stempel terkumpul. Hadiah terakhir terbuka. ♡'
      : `Misi Eren: ${collected.size} dari ${total} stempel terkumpul.`;
    MISSION_STAMPS.forEach((stamp) => {
      const done = collected.has(stamp.key);
      const li = $(`.mission-item[data-stamp="${stamp.key}"]`);
      li.classList.toggle('is-done', done);
      $('.mission-item-link', li).textContent = done ? 'Selesai' : 'Buka';
      const item = $(`.stamp[data-stamp="${stamp.key}"]`);
      item.classList.toggle('is-collected', done);
      $('.sr-only', item).textContent = `${stamp.label}: ${done ? 'terkumpul' : 'belum terkumpul'}`;
      $(`.sky-star[data-stamp="${stamp.key}"]`).classList.toggle('is-lit', done);
    });
    $('#mission-toggle').classList.toggle('is-complete', isComplete());
    const reward = $('#open-reward');
    reward.disabled = !isComplete();
    reward.innerHTML = isComplete() ? `${icon('gift')} Buka hadiah terakhir` : `${icon('lock')} Hadiah terakhir · ${collected.size}/${total}`;
    const privateStar = $('#private-sky-star');
    if (privateStar) privateStar.classList.toggle('is-lit', Boolean(storage.get('private-wish', '')));
  }

  function collect(key) {
    if (!MISSION_STAMPS.some((stamp) => stamp.key === key) || collected.has(key)) return;
    collected.add(key);
    storage.set('mission-stamps', [...collected]);
    update();
    const stamp = MISSION_STAMPS.find((item) => item.key === key);
    if (isComplete()) {
      showToast('Semua stempel terkumpul! Hadiah terakhir terbuka di halaman penutup. ♡');
      celebrate({ count: 90 });
    } else {
      showToast(`Stempel "${stamp.label}" terkumpul · ${collected.size}/${total}`);
      celebrate({ count: 24 });
    }
  }

  function renderPrivateStar() {
    const wish = storage.get('private-wish', '');
    let star = $('#private-sky-star');
    if (wish && !star) {
      star = document.createElement('span');
      star.id = 'private-sky-star';
      star.className = 'sky-star private-sky-star';
      star.style.setProperty('--i', 6);
      star.textContent = '♡';
      sky.append(star);
    }
    if (star) {
      star.classList.toggle('is-lit', Boolean(wish));
      star.title = wish ? 'Harapan rahasiamu tersimpan di perangkat ini.' : '';
    }
  }

  $('#mission-toggle').addEventListener('click', () => openDialog($('#mission-dialog')));
  $('#mission-brief').addEventListener('click', () => openDialog($('#mission-dialog')));
  $('#mission-reset').addEventListener('click', () => {
    collected.clear();
    storage.set('mission-stamps', []);
    update();
    showToast('Misi diulang. Eren siap nemenin dari awal lagi. ♡');
  });
  $('#open-reward').addEventListener('click', () => { if (isComplete()) openDialog($('#reward-dialog')); });
  $('#reward-hug').addEventListener('click', () => {
    celebrate({ container: $('#reward-dialog'), count: 60 });
    const button = $('#reward-hug');
    button.innerHTML = `Eren balas peluk ${icon('heart')}`;
    setTimeout(() => { button.innerHTML = `Peluk Eren dulu ${icon('heart')}`; }, 3000);
  });

  $('#save-pass').addEventListener('click', async () => {
    const button = $('#save-pass');
    button.disabled = true;
    try {
      await document.fonts.ready;
      const canvas = document.createElement('canvas');
      canvas.width = 1200; canvas.height = 760;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = '#293e34'; ctx.fillRect(0, 0, 1200, 760);
      ctx.strokeStyle = '#d8c9a3'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]); ctx.strokeRect(36, 36, 1128, 688); ctx.setLineDash([]);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#d8c9a3'; ctx.font = '500 20px "DM Sans Variable", sans-serif';
      ctx.fillText('EREN’S SECRET BIRTHDAY MISSION · COMPLETED', 600, 100);
      ctx.fillStyle = '#f6f2e5'; ctx.font = '450 64px "Fraunces Variable", Georgia';
      ctx.fillText('Birthday Pass', 600, 195);
      ctx.fillStyle = '#e2b4a2'; ctx.font = '38px "Caveat Variable", cursive';
      ctx.fillText(`Untuk ${config.recipient || 'Sayang'}, manusia favoritku`, 600, 260, 1000);
      const stamps = MISSION_STAMPS.map((stamp) => stamp.icon);
      stamps.forEach((name, index) => {
        const x = 250 + index * 140;
        ctx.beginPath(); ctx.arc(x, 360, 44, 0, Math.PI * 2);
        ctx.strokeStyle = '#d8c9a3'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#e2b4a2'; ctx.font = '30px Georgia'; ctx.fillText('♡', x, 372);
      });
      ctx.fillStyle = '#f6f2e5'; ctx.font = '26px "DM Sans Variable", sans-serif';
      const note = mission.passNote || 'Berlaku untuk satu hari penuh dimanja dan satu pelukan panjang.';
      const words = String(note).split(/\s+/); let line = ''; let y = 470;
      for (const word of words) {
        const next = line ? `${line} ${word}` : word;
        if (ctx.measureText(next).width > 900 && line) { ctx.fillText(line, 600, y); line = word; y += 38; } else line = next;
      }
      if (line) ctx.fillText(line, 600, y);
      ctx.fillStyle = '#d8c9a3'; ctx.font = '20px "DM Sans Variable", sans-serif';
      ctx.fillText(`Dari ${config.sender || 'Aku'} · ${config.birthdayLabel || 'Hari milikmu, hari favoritku.'}`, 600, 620, 1000);
      ctx.font = '16px "DM Sans Variable", sans-serif';
      ctx.fillText('Tidak berlaku untuk dilupakan. Berlaku setiap kali kamu butuh. ♡', 600, 680);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG export failed');
      downloadBlob(blob, `birthday-pass-${fileStem(config.recipient)}.png`);
      button.innerHTML = `${icon('check')} Pass tersimpan`;
      setTimeout(() => { button.innerHTML = `${icon('download')} Simpan Birthday Pass`; }, 3000);
    } catch {
      showToast('Pass belum bisa diunduh. Screenshot halaman ini juga boleh. ♡');
    } finally { button.disabled = false; }
  });

  update();
  renderPrivateStar();
  return { collect, update, isComplete, renderPrivateStar, collected };
}
