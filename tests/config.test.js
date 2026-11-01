import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/config.js', import.meta.url), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const config = context.window.BIRTHDAY_CONFIG;

test('personal configuration is valid JavaScript with required sections', () => {
  for (const field of ['recipient', 'sender', 'footer']) {
    assert.equal(typeof config[field], 'string');
    assert.ok(config[field].trim().length > 0, `${field} cannot be empty`);
  }
  for (const field of ['hero', 'video', 'music', 'letter']) assert.ok(config[field]);
  assert.ok(Array.isArray(config.letter.paragraphs));
  assert.ok(config.letter.paragraphs.length > 0);
  assert.ok(config.letter.paragraphs.every((text) => typeof text === 'string'));
  assert.ok(config.age === null || (Number.isInteger(config.age) && config.age > 0));
});

test('interactive cards have text and at least one choice', () => {
  for (const field of ['reasons', 'photos', 'coupons']) {
    assert.ok(Array.isArray(config[field]));
    assert.ok(config[field].length > 0, `${field} needs at least one item`);
  }
  for (const reason of config.reasons) {
    assert.ok(reason.title && reason.text && reason.icon);
  }
  for (const coupon of config.coupons) {
    assert.ok(coupon.title && coupon.description && coupon.code && coupon.icon);
  }
  assert.equal(new Set(config.coupons.map((coupon) => coupon.code)).size, config.coupons.length);
});

test('all configured local media paths resolve to public, and exist', () => {
  const sources = [...config.photos.map((photo) => photo.src), config.video.src, config.video.poster, config.music.src];
  for (const src of sources.filter(Boolean)) {
    assert.equal(typeof src, 'string');
    if (/^https?:\/\//.test(src)) {
      assert.equal(new URL(src).protocol, 'https:', 'External media must use HTTPS');
      continue;
    }
    assert.ok(src.startsWith('/media/'), `Use /media/... rather than ${src}`);
    assert.ok(!src.includes('..'), 'No parent directory paths');
    const file = resolve('public', `.${src}`);
    assert.ok(existsSync(file), `Missing media file: ${src}`);
    assert.ok(statSync(file).isFile());
  }
});

test('photo captions and accessible descriptions are present', () => {
  for (const photo of config.photos) {
    assert.ok(photo.caption && photo.alt && photo.date);
    assert.ok(['first', 'date', 'adventure', 'silly', 'little', 'next'].includes(photo.placeholder));
  }
});

test('Vercel configuration targets the Vite build output', () => {
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(vercel.framework, 'vite');
  assert.equal(vercel.buildCommand, 'npm run build');
  assert.equal(vercel.outputDirectory, 'dist');
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.scripts.build.includes('vite build'));
});

test('hero image is a lightweight, real WebP', () => {
  const file = readFileSync(new URL('../public/media/eren-birthday.webp', import.meta.url));
  assert.equal(file.toString('ascii', 0, 4), 'RIFF');
  assert.equal(file.toString('ascii', 8, 12), 'WEBP');
  assert.ok(file.byteLength < 600_000, 'Hero should stay under 600 KB');
});

test('secret mission fields are optional but valid when present', () => {
  if (config.mission) {
    for (const field of ['title', 'intro', 'rewardTitle', 'reward', 'passNote']) {
      assert.equal(typeof config.mission[field], 'string');
      assert.ok(config.mission[field].trim().length > 0, `mission.${field} cannot be empty`);
    }
  }
  for (const reason of config.reasons) {
    if ('secret' in reason) assert.equal(typeof reason.secret, 'string');
  }
  for (const photo of config.photos) {
    if ('secret' in photo) assert.equal(typeof photo.secret, 'string');
  }
});
