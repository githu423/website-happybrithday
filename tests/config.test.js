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
  for (const field of ['gate', 'opening', 'letter', 'clock', 'mascot', 'album', 'heart', 'video', 'music', 'certificate', 'closing']) {
    assert.ok(config[field], `Missing config.${field}`);
  }
  assert.ok(Array.isArray(config.letter.paragraphs) && config.letter.paragraphs.length > 0);
  assert.ok(config.letter.paragraphs.every((text) => typeof text === 'string'));
  assert.ok(config.age === null || (Number.isInteger(config.age) && config.age > 0));
  assert.ok(!Number.isNaN(new Date(config.jadian).getTime()), 'jadian must be a valid date');
});

test('interactive sections have enough content', () => {
  assert.ok(Array.isArray(config.typed) && config.typed.length > 0);
  assert.ok(Array.isArray(config.roses) && config.roses.length >= 3);
  assert.ok(config.roses.every((text) => typeof text === 'string' && text.trim()));
  assert.ok(Array.isArray(config.quiz) && config.quiz.length > 0);
  for (const q of config.quiz) {
    assert.ok(q.q && Array.isArray(q.o) && q.o.length >= 2 && q.f);
  }
  assert.ok(Array.isArray(config.photos) && config.photos.length > 0);
  for (const photo of config.photos) assert.ok(photo.caption && photo.alt);
  assert.ok(Array.isArray(config.certificate.perks) && config.certificate.perks.length > 0);
  assert.ok(Array.isArray(config.closing.love) && config.closing.love.length > 0);
});

test('all configured local media paths resolve to public, and exist', () => {
  const sources = [
    ...config.photos.map((photo) => photo.src),
    config.video.src, config.video.poster, config.music.src,
    config.mascot.image, config.certificate.signatureSrc,
  ];
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

test('gate and mascot have playful fallbacks', () => {
  assert.ok(config.gate.question && config.gate.yes && config.gate.no);
  assert.ok(Array.isArray(config.gate.teases) && config.gate.teases.length > 0);
  assert.ok(config.mascot.name && config.mascot.intro);
  assert.ok(Array.isArray(config.mascot.messages) && config.mascot.messages.length > 0);
  for (const key of ['peluk', 'kasih', 'dandan', 'rahasia']) {
    assert.ok(Array.isArray(config.mascot.actions[key]) && config.mascot.actions[key].length > 0);
  }
});
