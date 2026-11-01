import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const pageEl = (page, id) => page.locator(`.page[data-page="${id}"]`);
async function enter(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
}
async function passGate(page) {
  await page.locator('#yes-btn').click();
  await expect(pageEl(page, 'opening')).toBeVisible();
  await page.locator('#envelope').click();
  await expect(pageEl(page, 'greeting')).toBeVisible();
}
async function next(page) { await page.locator('#next').click(); }
async function finishGreeting(page) { await expect(page.locator('#typed')).not.toBeEmpty(); await next(page); }
async function finishMascot(page) {
  await page.locator('#doll').click();
  await page.locator('.chip[data-act="peluk"]').click();
  await page.locator('.chip[data-act="kasih"]').click();
  await next(page);
}
async function finishRoses(page) {
  await page.locator('.stalk').nth(0).click();
  await page.locator('.stalk').nth(1).click();
  await page.locator('.stalk').nth(2).click();
  await next(page);
}
async function finishAlbum(page) {
  await page.locator('.photo-card').first().click();
  await expect(page.locator('#photo-dialog')).toBeVisible();
  await page.locator('#photo-dialog [data-close]').click();
  await next(page);
}
async function finishQuiz(page) {
  for (let i = 0; i < 5; i++) {
    await page.locator('.opt').first().click();
    await page.waitForTimeout(260);
  }
  await expect(page.locator('#q-text')).toContainText('100/100');
  await next(page);
}
async function finishHeart(page) {
  await page.locator('#heart-skip').click();
  await expect(page.locator('#heart-pct')).toHaveText('100%');
  await next(page);
}
async function reachCertificate(page) {
  await passGate(page);
  await finishGreeting(page);
  await expect(pageEl(page, 'time')).toBeVisible();
  await next(page);
  await finishMascot(page);
  await finishRoses(page);
  await finishAlbum(page);
  await finishQuiz(page);
  await finishHeart(page);
  await expect(pageEl(page, 'video')).toBeVisible();
  await next(page);
  await expect(pageEl(page, 'certificate')).toBeVisible();
}

test.beforeEach(async ({ page }) => { await enter(page); });

test('opens on a locked gate with no document scrolling', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await expect(page).toHaveTitle(/Happy Birthday/);
  await expect(page.locator('.page')).toHaveCount(12);
  await expect(page.locator('.page:visible')).toHaveCount(1);
  await expect(pageEl(page, 'gate')).toBeVisible();
  await expect(page.locator('#gate-title')).toContainText('Sinta Liya');
  await expect(page.locator('#next')).toHaveClass(/locked/);
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight && scrollY === 0)).toBe(true);
  expect(errors).toEqual([]);
});

test('the no button runs away, yes opens the envelope, and the letter appears', async ({ page }) => {
  await page.locator('#no-btn').click();
  await expect(page.locator('#no-tease')).not.toBeEmpty();
  await passGate(page);
  await expect(page.locator('#letter-greeting')).toContainText('Sinta Liya');
  await expect(page.locator('#letter-paragraphs p')).toHaveCount(4);
});

test('tasks gently lock the next page until played', async ({ page }) => {
  await passGate(page);
  await finishGreeting(page);
  await next(page);
  await expect(pageEl(page, 'mascot')).toBeVisible();
  await next(page);
  await expect(pageEl(page, 'mascot')).toBeVisible();
  await expect(page.locator('#lock-msg')).toContainText('Eren');
  await finishMascot(page);
  await expect(pageEl(page, 'roses')).toBeVisible();
  await next(page);
  await expect(pageEl(page, 'roses')).toBeVisible();
  await finishRoses(page);
  await expect(pageEl(page, 'album')).toBeVisible();
});

test('Eren responds, dresses up, and remembers plays', async ({ page }) => {
  await passGate(page); await finishGreeting(page); await next(page);
  await page.locator('.chip[data-act="dandan"]').click();
  await expect(page.locator('#doll')).toHaveClass(/dressed/);
  await page.locator('.chip[data-act="rahasia"]').click();
  await expect(page.locator('#doll-bubble')).not.toBeEmpty();
  await page.reload();
  await expect(pageEl(page, 'mascot')).toBeVisible();
  await expect(page.locator('#doll')).toHaveClass(/dressed/);
});

test('roses reveal secret messages and fill the bouquet meter', async ({ page }) => {
  await passGate(page); await finishGreeting(page); await next(page); await finishMascot(page);
  await page.locator('.stalk').first().click();
  await expect(page.locator('#rose-msg')).toContainText('“');
  await expect(page.locator('#rose-count')).toContainText('1 / 9');
  await page.locator('.stalk').nth(1).click();
  await page.locator('.stalk').nth(2).click();
  await expect(page.locator('#rose-count')).toContainText('3 / 9');
  await expect(page.locator('#next')).not.toHaveClass(/locked/);
});

test('album opens a photo, accepts local previews, and resets without uploading', async ({ page }) => {
  let uploads = 0;
  page.on('request', (r) => { if (r.method() === 'POST') uploads++; });
  await passGate(page); await finishGreeting(page); await next(page); await finishMascot(page); await finishRoses(page);
  await page.locator('.photo-card').first().click();
  await expect(page.locator('#photo-dialog')).toBeVisible();
  await expect(page.locator('#photo-caption')).not.toBeEmpty();
  await page.locator('#photo-dialog [data-close]').click();
  await page.locator('#photo-input').setInputFiles({ name: 'kita.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('.photo-card img').first()).toHaveAttribute('src', /^blob:/);
  await expect(page.locator('#reset-photos')).toBeVisible();
  await page.locator('#reset-photos').click();
  await expect(page.locator('#reset-photos')).toBeHidden();
  expect(uploads).toBe(0);
});

test('quiz always lets you pass and remembers completion', async ({ page }) => {
  await passGate(page); await finishGreeting(page); await next(page); await finishMascot(page); await finishRoses(page); await finishAlbum(page);
  await finishQuiz(page);
  await expect(pageEl(page, 'heart')).toBeVisible();
  await page.reload();
  await expect(pageEl(page, 'heart')).toBeVisible();
});

test('holding or skipping fills the heart and unlocks the video page', async ({ page }) => {
  await passGate(page); await finishGreeting(page); await next(page); await finishMascot(page); await finishRoses(page); await finishAlbum(page); await finishQuiz(page);
  await expect(pageEl(page, 'heart')).toBeVisible();
  await next(page);
  await expect(pageEl(page, 'heart')).toBeVisible();
  await page.locator('#heart-skip').click();
  await expect(page.locator('#heart-pct')).toHaveText('100%');
  await next(page);
  await expect(pageEl(page, 'video')).toBeVisible();
  await expect(page.locator('#video-empty')).toBeVisible();
});

test('certificate can be signed, previewed, and downloaded as a real PNG', async ({ page }) => {
  await reachCertificate(page);
  await page.waitForTimeout(350);
  const pad = page.locator('#sig-pad');
  const box = await pad.boundingBox();
  await page.mouse.move(box.x + 20, box.y + 50);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 30, { steps: 10 });
  await page.mouse.move(box.x + 220, box.y + 70, { steps: 10 });
  await page.mouse.up();
  await expect(page.locator('#cert-status')).toContainText('Tanda tangan terdeteksi');
  await page.locator('#preview-cert').click();
  await expect(page.locator('#preview-dialog')).toBeVisible();
  await expect(page.locator('#preview-img')).toHaveAttribute('src', /^data:image\/png/);
  await page.locator('#preview-dialog [data-close]').click();
  const downloaded = page.waitForEvent('download');
  await page.locator('#save-cert').click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toMatch(/^sertifikat-birthday-.*\.png$/);
  const image = readFileSync(await download.path());
  expect(image.toString('hex', 0, 8)).toBe('89504e470d0a1a0a');
  expect(image.readUInt32BE(16)).toBe(2000);
  expect(image.readUInt32BE(20)).toBe(1414);
  await expect(page.locator('#wax')).toHaveClass(/on/);
  await next(page);
  await expect(pageEl(page, 'closing')).toBeVisible();
});

test('closing sends love and can restart the whole book', async ({ page }) => {
  await reachCertificate(page);
  await page.waitForTimeout(350);
  const pad = page.locator('#sig-pad'); const box = await pad.boundingBox();
  await page.mouse.move(box.x + 20, box.y + 50); await page.mouse.down();
  await page.mouse.move(box.x + 220, box.y + 70, { steps: 12 }); await page.mouse.up();
  await next(page);
  await page.locator('#love-btn').click();
  await expect(page.locator('#love-msg')).not.toBeEmpty();
  await page.locator('#again-btn').click();
  await expect(pageEl(page, 'gate')).toBeVisible();
  await expect(page.locator('#next')).toHaveClass(/locked/);
});

test('progress resumes after refresh and dots only unlock seen pages', async ({ page }) => {
  await passGate(page); await finishGreeting(page);
  await expect(pageEl(page, 'time')).toBeVisible();
  await page.reload();
  await expect(pageEl(page, 'time')).toBeVisible();
  await expect(page.locator('.dot').nth(4)).toBeDisabled();
  await page.locator('.dot').nth(1).click();
  await expect(pageEl(page, 'opening')).toBeVisible();
});

test('keyboard, help dialog, and music toggle work', async ({ page }) => {
  await page.locator('#help-btn').click();
  await expect(page.locator('#help-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#help-dialog')).toBeHidden();
  await page.locator('#yes-btn').click();
  await page.locator('#envelope').click();
  await expect(pageEl(page, 'greeting')).toBeVisible();
  await page.locator('#music-btn').click();
  const pressed = await page.locator('#music-btn').getAttribute('aria-pressed');
  await page.locator('#music-btn').click();
  await expect(page.locator('#music-btn')).not.toHaveAttribute('aria-pressed', pressed);
});

test('phone, tablet, and desktop keep the book inside the viewport', async ({ page }) => {
  for (const viewport of [{ width: 320, height: 568 }, { width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await enter(page);
    await expect(pageEl(page, 'gate')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight && scrollY === 0)).toBe(true);
    await passGate(page);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight && scrollY === 0)).toBe(true);
  }
});
