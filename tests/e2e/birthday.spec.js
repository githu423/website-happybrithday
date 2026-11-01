import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { PAGES } from '../../src/pages.js';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const chapter = (page, id) => page.locator(`.app-page[data-page="${id}"]`);
async function openPage(page, id) {
  await page.locator(`#page-dots a[href="#${id}"]`).click();
  await expect(chapter(page, id)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
});

test('opens a complete gift with local assets and no autoplay', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.reload();
  await expect(page).toHaveTitle('Untuk Sayang, manusia favoritku ♡');
  await expect(page.locator('h1')).toContainText('karena ada kamu.');
  await expect(page.locator('.app-page')).toHaveCount(8);
  await expect(page.locator('.app-page:visible')).toHaveCount(1);
  await expect(page.locator('.photo-card')).toHaveCount(6);
  await expect(page.locator('#music-toggle')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#birthday-video')).toBeHidden();
  expect(await page.locator('.hero-photo').evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('#wish-message')).toBeHidden();
  expect(errors).toEqual([]);
});

test('every chapter has its own interaction and no document scrolling', async ({ page }) => {
  const interactions = {
    home: '#eren-mission', reasons: '#reason-next', memories: '#album-next',
    film: '#film-play', wish: '#blow-candles', letter: '#open-letter',
    coupons: '.coupon-choice', closing: '#final-hug',
  };
  for (const [index, item] of PAGES.entries()) {
    await openPage(page, item.id);
    await expect(page.locator('.app-page:visible')).toHaveCount(1);
    await expect(chapter(page, item.id).locator(interactions[item.id]).first()).toBeVisible();
    await expect(page.locator('#page-number')).toHaveText(`${String(index + 1).padStart(2, '0')} / 08`);
    await expect(page.locator(`#page-dots [href="#${item.id}"]`)).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight && scrollY === 0)).toBe(true);
  }
});

test('next, previous, chapter list, deep links, and Back work without reloading', async ({ page }) => {
  await page.evaluate(() => { window.testPageIdentity = document.querySelector('main'); });
  await expect(page.locator('#page-prev')).toBeDisabled();
  await page.locator('#page-next').click();
  await expect(chapter(page, 'reasons')).toBeVisible();
  await expect(page.locator('#reasons-title')).toBeFocused();
  await page.locator('#page-prev').click();
  await expect(chapter(page, 'home')).toBeVisible();
  await page.locator('#chapter-toggle').click();
  await expect(page.locator('#chapters-dialog .chapter-link')).toHaveCount(8);
  await page.locator('#chapter-list a[href="#coupons"]').click();
  await expect(page.locator('#chapters-dialog')).toBeHidden();
  await expect(chapter(page, 'coupons')).toBeVisible();
  await page.goBack();
  await expect(chapter(page, 'home')).toBeVisible();
  await page.goForward();
  await expect(chapter(page, 'coupons')).toBeVisible();
  await page.goto('/#surprises');
  await expect(chapter(page, 'wish')).toBeVisible();
  await expect(page).toHaveURL(/#wish$/);
  await page.goto('/#not-a-page');
  await expect(chapter(page, 'home')).toBeVisible();
  await openPage(page, 'closing');
  await page.locator('#page-next').click();
  await expect(chapter(page, 'home')).toBeVisible();
  expect(await page.evaluate(() => window.testPageIdentity === document.querySelector('main'))).toBe(true);
  await page.locator('#home .page-title').focus();
  await page.keyboard.press('ArrowRight');
  await expect(chapter(page, 'reasons')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(chapter(page, 'home')).toBeVisible();
  await page.locator('.skip-link').focus();
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#hero-title')).toBeFocused();
});

test('Eren changes mission messages and the final hug responds', async ({ page }) => {
  await expect(page.locator('#eren-message')).toContainText('Bikin kamu senyum.');
  await page.locator('#eren-mission').click();
  await expect(page.locator('#eren-message')).toContainText('Kuenya buat kamu.');
  await page.locator('#eren-mission').click();
  await expect(page.locator('#eren-message')).toContainText('Hari ini tugas kamu:');
  await openPage(page, 'closing');
  await page.locator('#final-hug').click();
  await expect(page.locator('#hug-note')).toContainText('Pelukan sampai.');
  await page.locator('#final-hug').click();
  await expect(page.locator('#hug-note')).toContainText('2 pelukan terkirim');
  await page.locator('#closing .closing-actions a').click();
  await expect(chapter(page, 'home')).toBeVisible();
});

test('reason cards wrap, navigate directly, and remember favorites', async ({ page }) => {
  await openPage(page, 'reasons');
  await expect(page.locator('#reason-title')).toHaveText('Kamu itu rumah.');
  await page.locator('#reason-next').click();
  await expect(page.locator('#reason-title')).toHaveText('Ketawamu menular.');
  await page.locator('#reason-prev').click();
  await expect(page.locator('#reason-title')).toHaveText('Kamu itu rumah.');
  await page.locator('#reason-prev').click();
  await expect(page.locator('#reason-title')).toHaveText('Kamu, ya kamu.');
  await page.locator('.reason-dot').nth(1).click();
  await expect(page.locator('#reason-counter')).toHaveText('02 / 05');
  await page.locator('#reason-like').click();
  await expect(page.locator('#reason-like')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(chapter(page, 'reasons')).toBeVisible();
  await page.locator('.reason-dot').nth(1).click();
  await expect(page.locator('#reason-like')).toHaveAttribute('aria-pressed', 'true');
});

test('album turns spreads, opens full photos, and restores focus', async ({ page }) => {
  await openPage(page, 'memories');
  await expect(page.locator('.photo-card:visible')).toHaveCount(2);
  await expect(page.locator('#album-count')).toHaveText('01–02 / 06');
  await page.locator('#album-next').click();
  await expect(page.locator('#album-count')).toHaveText('03–04 / 06');
  const third = page.locator('.photo-card').nth(2);
  await third.click();
  await expect(page.locator('#gallery-dialog')).toBeVisible();
  await expect(page.locator('#lightbox-count')).toContainText('3 / 6');
  await page.locator('#lightbox-next').click();
  await expect(page.locator('#lightbox-count')).toContainText('4 / 6');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#lightbox-count')).toContainText('3 / 6');
  await page.keyboard.press('Escape');
  await expect(page.locator('#gallery-dialog')).toBeHidden();
  await expect(third).toBeFocused();
  await expect(chapter(page, 'memories')).toBeVisible();
  await page.locator('#album-dots button').last().click();
  await expect(page.locator('#album-count')).toHaveText('05–06 / 06');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.photo-card:visible')).toHaveCount(1);
  await expect(page.locator('#album-dots button')).toHaveCount(6);
  await page.locator('#album-next').click();
  await expect(page.locator('#album-count')).toHaveText('06 / 06');
});

test('local photo preview stays local, survives chapter changes, and resets', async ({ page }) => {
  let uploads = 0;
  page.on('request', (request) => { if (request.method() === 'POST') uploads++; });
  await openPage(page, 'memories');
  const original = await page.locator('.photo-card img').first().getAttribute('src');
  await page.locator('#photo-input').setInputFiles({ name: 'kenangan.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('#reset-photos')).toBeVisible();
  await expect(page.locator('.photo-card img').first()).toHaveAttribute('src', /^blob:/);
  await expect(page.locator('#gallery-note')).toContainText('1 foto lokal terpasang');
  await openPage(page, 'home');
  await openPage(page, 'memories');
  await expect(page.locator('.photo-card img').first()).toHaveAttribute('src', /^blob:/);
  await page.locator('#reset-photos').click();
  await expect(page.locator('#reset-photos')).toBeHidden();
  await expect(page.locator('.photo-card img').first()).toHaveAttribute('src', original);
  expect(uploads).toBe(0);
});

test('empty movie opens honest setup instructions with accessible tabs', async ({ page }) => {
  await openPage(page, 'film');
  await page.locator('#film-play').click();
  await expect(page.locator('#setup-dialog')).toBeVisible();
  await expect(page.locator('#tab-video')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#setup-video')).toContainText('/media/video/kita.mp4');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-personal')).toBeFocused();
  await expect(page.locator('#setup-personal')).toBeVisible();
  await page.keyboard.press('Home');
  await expect(page.locator('#tab-photos')).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#setup-dialog')).toBeHidden();
  await expect(chapter(page, 'film')).toBeVisible();
});

test('a selected local video plays natively and pauses on page change', async ({ page }) => {
  // A real animated video generated in-browser: no external fixture/CDN needed.
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    const context = canvas.getContext('2d');
    context.fillStyle = '#e9edde';
    context.fillRect(0, 0, 160, 120);
    const stream = canvas.captureStream(10);
    let frame = 0;
    const animation = setInterval(() => {
      context.fillStyle = frame++ % 2 ? '#e9edde' : '#f2ddd5';
      context.fillRect(0, 0, 160, 120);
      context.fillStyle = '#293e34';
      context.fillRect((frame * 8) % 140, 45, 20, 30);
    }, 100);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];
    const complete = new Promise((resolve) => {
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = async () => {
        clearInterval(animation);
        stream.getTracks().forEach((track) => track.stop());
        resolve(Array.from(new Uint8Array(await new Blob(chunks, { type: 'video/webm' }).arrayBuffer())));
      };
    });
    recorder.start();
    setTimeout(() => recorder.stop(), 1400);
    return complete;
  });
  await openPage(page, 'film');
  await page.locator('#video-input').setInputFiles({ name: 'kita.webm', mimeType: 'video/webm', buffer: Buffer.from(bytes) });
  await expect(page.locator('#birthday-video')).toBeVisible();
  await expect(page.locator('#birthday-video')).toHaveAttribute('src', /^blob:/);
  await expect.poll(() => page.locator('#birthday-video').evaluate((video) => video.readyState)).toBeGreaterThanOrEqual(2);
  await expect(page.locator('#video-error')).toBeHidden();
  await expect(page.locator('#film-play')).toBeHidden();
  await openPage(page, 'wish');
  await expect(page.locator('#birthday-video')).toBeHidden();
  expect(await page.locator('#birthday-video').evaluate((video) => video.paused)).toBe(true);
  await openPage(page, 'film');
  await expect(page.locator('#birthday-video')).toHaveAttribute('src', /^blob:/);
  await expect(page.locator('#film-play')).toBeVisible();
});

test('candles reveal a wish, update progress, and can be relit', async ({ page }) => {
  await openPage(page, 'wish');
  await page.locator('#blow-candles').click();
  await expect(page.locator('.candle.is-out')).toHaveCount(3);
  await expect(page.locator('#wish-message')).toBeVisible();
  await expect(page.locator('#wish-placeholder')).toBeHidden();
  await expect(page.locator('#progress-label')).toContainText('1 dari 3');
  await expect(page.locator('#blow-candles')).toContainText('Nyalakan lilin lagi');
  await page.locator('#blow-candles').click();
  await expect(page.locator('.candle.is-out')).toHaveCount(0);
  await expect(page.locator('#wish-message')).toBeHidden();
  await expect(page.locator('#wish-placeholder')).toBeVisible();
  for (const candle of await page.locator('.candle').all()) await candle.click();
  await expect(page.locator('#wish-message')).toBeVisible();
});

test('envelope opens a personal letter with download and hug', async ({ page }) => {
  await openPage(page, 'letter');
  await page.locator('#letter-envelope-button').click();
  await expect(page.locator('#letter-dialog')).toBeVisible();
  await expect(page.locator('#letter-body p')).toHaveCount(5);
  await expect(page.locator('#letter-heading')).toHaveText('Untuk manusia favoritku,');
  const downloaded = page.waitForEvent('download');
  await page.locator('#save-letter').click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('surat-untuk-sayang.txt');
  const text = readFileSync(await download.path(), 'utf8');
  expect(text).toContain('Selamat ulang tahun, Sayang.');
  expect(text).toContain('Aku yang paling sayang kamu');
  await page.locator('#send-hug').click();
  await expect(page.locator('#send-hug')).toContainText('Pelukan diterima');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-opened="letter"]')).toBeVisible();
  await page.locator('#open-letter').click();
  await expect(page.locator('#letter-dialog')).toBeVisible();
});

test('coupon has a keyboard reveal and a real PNG download', async ({ page }) => {
  await openPage(page, 'coupons');
  await page.locator('.coupon-choice').first().click();
  await expect(page.locator('#coupon-empty')).toBeHidden();
  await expect(page.locator('#scratch-canvas')).toBeVisible();
  await expect(page.locator('#save-coupon')).toBeHidden();
  await page.locator('#accessible-reveal').click();
  await expect(page.locator('#ticket-title')).toHaveText('Pelukan tanpa batas waktu');
  await expect(page.locator('#save-coupon')).toBeVisible();
  const downloaded = page.waitForEvent('download');
  await page.locator('#save-coupon').click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('kupon-peluk-001.png');
  const image = readFileSync(await download.path());
  expect(image.toString('hex', 0, 8)).toBe('89504e470d0a1a0a');
  expect(image.readUInt32BE(16)).toBe(1200);
  expect(image.readUInt32BE(20)).toBe(760);
  await page.locator('.coupon-choice').nth(1).click();
  await expect(page.locator('#save-coupon')).toBeHidden();
  await expect(page.locator('#accessible-reveal')).toBeVisible();
});

test('coupon can actually be scratched with a pointer', async ({ page }) => {
  await openPage(page, 'coupons');
  await page.locator('.coupon-choice').nth(2).click();
  const canvas = page.locator('#scratch-canvas');
  await expect(canvas).toBeVisible();
  const rect = await canvas.boundingBox();
  for (let row = 15; row < rect.height - 10; row += 24) {
    await page.mouse.move(rect.x + 10, rect.y + row);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width - 10, rect.y + row, { steps: 12 });
    await page.mouse.up();
  }
  await expect(page.locator('#save-coupon')).toBeVisible();
  await expect(page.locator('#scratch-status')).toContainText('Kupon terbuka');
});

test('music is opt-in and can be turned off', async ({ page }) => {
  await page.locator('#music-toggle').click();
  await expect(page.locator('#music-toggle')).toHaveAttribute('aria-pressed', 'true');
  await openPage(page, 'reasons');
  await expect(page.locator('#music-toggle')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#music-toggle').click();
  await expect(page.locator('#music-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('all three gifts remember completion on this device', async ({ page }) => {
  await openPage(page, 'wish');
  await page.locator('#blow-candles').click();
  await expect(page.locator('#wish-message')).toBeVisible();
  await openPage(page, 'letter');
  await page.locator('#open-letter').click();
  await page.keyboard.press('Escape');
  await openPage(page, 'coupons');
  await page.locator('.coupon-choice').first().click();
  await page.locator('#accessible-reveal').click();
  await openPage(page, 'closing');
  await expect(page.locator('#progress-label')).toContainText('Semua kejutan dibuka');
  await page.reload();
  await expect(chapter(page, 'closing')).toBeVisible();
  await expect(page.locator('.progress-dot.is-complete')).toHaveCount(3);
  await openPage(page, 'wish');
  await expect(page.locator('#wish-message')).toBeHidden();
});

test('missing configured photos gracefully fall back to artwork', async ({ page }) => {
  const config = readFileSync('public/config.js', 'utf8').replace("src: '', alt: 'Tempat foto pertama kita'", "src: '/media/photos/belum-ada.jpg', alt: 'Tempat foto pertama kita'");
  await page.route('**/config.js', (route) => route.fulfill({ contentType: 'application/javascript', body: config }));
  await page.goto('/#memories');
  await page.reload(); // Apply the intercepted config; a hash-only goto reuses the document.
  const image = page.locator('.photo-card img').first();
  await expect(image).toHaveAttribute('src', /^data:image\/svg/);
  await expect(page.locator('#gallery-note')).toContainText('belum ditemukan');
  expect(await image.evaluate((node) => node.naturalWidth > 0)).toBe(true);
});

test('personal text is rendered safely, not as HTML', async ({ page }) => {
  const config = readFileSync('public/config.js', 'utf8').replace("recipient: 'Sayang'", "recipient: '<img src=x onerror=alert(1)>'");
  await page.route('**/config.js', (route) => route.fulfill({ contentType: 'application/javascript', body: config }));
  await page.reload();
  await expect(page.locator('.hero-greeting [data-bind="recipient"]')).toHaveText('<img src=x onerror=alert(1)>');
  await expect(page.locator('.hero-greeting img')).toHaveCount(0);
});

test('phone, tablet, and desktop keep every page within the viewport', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const item of PAGES) {
      await openPage(page, item.id);
      const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, screenHeight: innerHeight }));
      expect(dimensions.content, `horizontal overflow: ${item.id} at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
      expect(dimensions.height, `document scroll: ${item.id} at ${width}px`).toBeLessThanOrEqual(dimensions.screenHeight);
      await expect(chapter(page, item.id).locator('.page-title')).toBeVisible();
      await expect(page.locator('#music-toggle')).toBeVisible();
      await expect(page.locator('#page-next')).toBeVisible();
    }
  }
});
