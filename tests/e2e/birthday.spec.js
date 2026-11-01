import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');

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
  await expect(page.locator('.photo-card')).toHaveCount(6);
  await expect(page.locator('#music-toggle')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#birthday-video')).toBeHidden();
  expect(await page.locator('.hero-photo').evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.locator('#wish-message')).toBeHidden();
  expect(errors).toEqual([]);
});

test('reason cards wrap, navigate directly, and remember favorites', async ({ page }) => {
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
  await page.locator('.reason-dot').nth(1).click();
  await expect(page.locator('#reason-like')).toHaveAttribute('aria-pressed', 'true');
});

test('gallery supports clicks, arrows, Escape, and focus restoration', async ({ page }) => {
  const first = page.locator('.photo-card').first();
  await first.click();
  await expect(page.locator('#gallery-dialog')).toBeVisible();
  await expect(page.locator('#lightbox-count')).toContainText('1 / 6');
  await page.locator('#lightbox-next').click();
  await expect(page.locator('#lightbox-count')).toContainText('2 / 6');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#lightbox-count')).toContainText('3 / 6');
  await page.keyboard.press('Escape');
  await expect(page.locator('#gallery-dialog')).toBeHidden();
  await expect(first).toBeFocused();
});

test('local photo preview stays local and resets to configured artwork', async ({ page }) => {
  let uploads = 0;
  page.on('request', (request) => { if (request.method() === 'POST') uploads++; });
  const original = await page.locator('.photo-card img').first().getAttribute('src');
  await page.locator('#photo-input').setInputFiles({ name: 'kenangan.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('#reset-photos')).toBeVisible();
  await expect(page.locator('.photo-card img').first()).toHaveAttribute('src', /^blob:/);
  await expect(page.locator('#gallery-note')).toContainText('1 foto lokal terpasang');
  await page.locator('#reset-photos').click();
  await expect(page.locator('#reset-photos')).toBeHidden();
  await expect(page.locator('.photo-card img').first()).toHaveAttribute('src', original);
  expect(uploads).toBe(0);
});

test('empty movie opens honest setup instructions with accessible tabs', async ({ page }) => {
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
});

test('a selected local video plays natively without uploading', async ({ page }) => {
  // Generate a tiny, real video in the browser; no external fixture/CDN needed.
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
  await page.locator('#video-input').setInputFiles({ name: 'kita.webm', mimeType: 'video/webm', buffer: Buffer.from(bytes) });
  await expect(page.locator('#birthday-video')).toBeVisible();
  await expect(page.locator('#birthday-video')).toHaveAttribute('src', /^blob:/);
  await expect.poll(() => page.locator('#birthday-video').evaluate((video) => video.readyState)).toBeGreaterThanOrEqual(2);
  await expect(page.locator('#video-error')).toBeHidden();
  await expect(page.locator('#film-play')).toBeHidden();
  await page.locator('#birthday-video').evaluate((video) => video.pause());
  await expect(page.locator('#film-play')).toBeVisible();
});

test('candles reveal a wish, update progress, and can be relit', async ({ page }) => {
  await page.locator('#blow-candles').click();
  await expect(page.locator('.candle.is-out')).toHaveCount(3);
  await expect(page.locator('#wish-message')).toBeVisible();
  await expect(page.locator('#progress-label')).toContainText('1 dari 3');
  await expect(page.locator('#blow-candles')).toContainText('Nyalakan lilin lagi');
  await page.locator('#blow-candles').click();
  await expect(page.locator('.candle.is-out')).toHaveCount(0);
  await expect(page.locator('#wish-message')).toBeHidden();
  for (const candle of await page.locator('.candle').all()) await candle.click();
  await expect(page.locator('#wish-message')).toBeVisible();
});

test('letter is personal, downloadable, and gives a hug', async ({ page }) => {
  await page.locator('#open-letter').click();
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
});

test('coupon has a keyboard reveal and a real PNG download', async ({ page }) => {
  await page.locator('#open-coupons').click();
  await page.locator('.coupon-choice').first().click();
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
  await page.locator('#open-coupons').click();
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
  await page.locator('#music-toggle').click();
  await expect(page.locator('#music-toggle')).toHaveAttribute('aria-pressed', 'false');
});

test('all three gifts remember completion on this device', async ({ page }) => {
  await page.locator('#blow-candles').click();
  await expect(page.locator('#wish-message')).toBeVisible();
  await page.locator('#open-letter').click();
  await page.keyboard.press('Escape');
  await page.locator('#open-coupons').click();
  await page.locator('.coupon-choice').first().click();
  await page.locator('#accessible-reveal').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#progress-label')).toContainText('Semua kejutan dibuka');
  await page.reload();
  await expect(page.locator('.progress-dot.is-complete')).toHaveCount(3);
  await expect(page.locator('#wish-message')).toBeHidden();
});

test('missing configured photos gracefully fall back to artwork', async ({ page }) => {
  const config = readFileSync('public/config.js', 'utf8').replace("src: '', alt: 'Tempat foto pertama kita'", "src: '/media/photos/belum-ada.jpg', alt: 'Tempat foto pertama kita'");
  await page.route('**/config.js', (route) => route.fulfill({ contentType: 'application/javascript', body: config }));
  await page.reload();
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

test('phone, tablet, and desktop layouts have no horizontal overflow', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
    expect(dimensions.content, `overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#music-toggle')).toBeVisible();
  }
});
