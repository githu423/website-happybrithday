import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PAGES, pageFromHash, navigationState } from '../src/pages.js';
import { icons } from '../src/icons.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('all eight chapters have unique matching sections and usable navigation', () => {
  assert.equal(PAGES.length, 8);
  assert.equal(new Set(PAGES.map((page) => page.id)).size, PAGES.length);
  const sections = [...html.matchAll(/<section class="app-page[^"]*" id="([^"]+)" data-page="([^"]+)"/g)];
  assert.deepEqual(sections.map((match) => match[1]), PAGES.map((page) => page.id));
  for (const [index, page] of PAGES.entries()) {
    assert.ok(page.label && page.description && page.nextLabel && page.group);
    assert.ok(icons[page.icon], `Missing chapter icon: ${page.icon}`);
    assert.equal(sections[index][1], sections[index][2]);
    const state = navigationState(page.id);
    assert.equal(state.index, index);
    assert.equal(state.total, 8);
    assert.equal(state.next.id, PAGES[(index + 1) % PAGES.length].id);
    assert.equal(state.previous?.id ?? null, PAGES[index - 1]?.id ?? null);
    assert.equal(pageFromHash(`#${page.id}`), page.id);
  }
});

test('old surprise links, slash routes, and unknown hashes resolve safely', () => {
  assert.equal(pageFromHash('#surprises'), 'wish');
  assert.equal(pageFromHash('#/letter'), 'letter');
  assert.equal(pageFromHash('#film?from=home'), 'film');
  for (const hash of ['', '#', '#page-content', '#unknown', '#<script>', null, undefined]) {
    assert.equal(pageFromHash(hash), 'home');
  }
  assert.equal(navigationState('unknown').current.id, 'home');
});
