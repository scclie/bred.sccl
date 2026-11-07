import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEntries, filterEntries } from '../../../modules/rated_recents/data.js';
import generate from '../../../modules/rated_recents/generator.mjs';

const post = (n, rate = n) => ({
  locale: 'en', link: `/posts/p${n}/`, title: `Post ${n}`, date: `2026-01-${String(n + 1).padStart(2, '0')}`,
  wordcount: 100, readtime: 1, meta: { custom: { shitpost_rate: rate } },
});
const section = { locale: 'en', link: '/posts/', isSection: true };
const site = pages => ({ pages: [section, ...pages] });
const context = pages => ({ page: { locale: 'en' }, site: site(pages), params: { section: '/posts/', count: 5 }, i18n: k => k });

test('compact index excludes other locales, sections and bodies, newest first', () => {
  const result = buildEntries(site([
    { ...post(1), body: 'secret', description: 'secret', tags: ['secret'] }, post(3),
    { ...post(4), locale: 'ru' }, { ...post(5), link: '/about/' }, { ...post(6), isSection: true },
  ]), 'en', '/posts/');
  assert.deepEqual(result, [
    ['/posts/p3/', 'Post 3', '2026-01-04', 100, 1, 3],
    ['/posts/p1/', 'Post 1', '2026-01-02', 100, 1, 1],
  ]);
});

test('missing rating defaults to zero but invalid explicit ratings fail with article path', () => {
  assert.equal(buildEntries(site([{ ...post(1), meta: {} }]), 'en', '/posts/')[0][5], 0);
  for (const value of [-1, 10, 1.5, '3', null]) {
    assert.throws(() => buildEntries(site([post(1, value)]), 'en', '/posts/'), /p1.*shitpost_rate.*0.*9/);
  }
  assert.equal(buildEntries(site([post(1, 9)]), 'en', '/posts/')[0][5], 9);
});

test('range is inclusive, allows equal bounds and filters before limiting', () => {
  const entries = buildEntries(site(Array.from({ length: 10 }, (_, n) => post(n))), 'en', '/posts/');
  assert.deepEqual(filterEntries(entries, 0, 2, 2).map(p => p[5]), [2, 1]);
  assert.deepEqual(filterEntries(entries, 9, 9, 5).map(p => p[5]), [9]);
  assert.deepEqual(filterEntries(entries, 3, 4, 5).map(p => p[5]), [4, 3]);
  assert.deepEqual(filterEntries(entries.slice(0, 2), 0, 0, 5), []);
});

test('generator embeds all metadata safely but only five initial article links', async () => {
  const pages = Array.from({ length: 10 }, (_, n) => post(n));
  pages[0].title = '</script><img src=x onerror=alert(1)>&';
  const html = await generate(context(pages));
  assert.equal((html.match(/class="recent-item rated-item"/g) ?? []).length, 5);
  const json = html.match(/<script type="application\/json" class="rated-data">([\s\S]*?)<\/script>/)[1];
  const entries = JSON.parse(json);
  assert.equal(entries.length, 10);
  assert.equal(entries[9][1], pages[0].title);
  assert.ok(!json.includes('<'));
  assert.equal((html.match(/type="range"/g) ?? []).length, 2);
  assert.equal((html.match(/disabled/g) ?? []).length, 2);
  assert.match(html, /href="\/posts\/p9\/"/);
});

test('generator keeps an empty module and a usable section link', async () => {
  const html = await generate(context([]));
  assert.match(html, /rated-empty/);
  assert.match(html, /href="\/posts\/"/);
});

test('article rows show reading metadata without exposing their rating', async () => {
  const html = await generate(context([post(9)]));
  assert.match(html, /class="recent-meta rated-meta">Jan 10, 2026 \| 1 min_short \| 100 words_short<\/div>/);
  assert.doesNotMatch(html, /9\/9/);
});

test('filter reuses Recents typography and places a standard separator before articles', async () => {
  const html = await generate(context([post(1)]));
  assert.match(html, /class="module module-recents rated-recents"/);
  assert.match(html, /class="recent-meta recent-footer-top rated-label"/);
  assert.match(html, /class="recent-meta recent-footer-top rated-endpoints"/);
  assert.match(html, /<hr>\s*<div class="rated-items">/);
  assert.doesNotMatch(html, /rated-status|data-matches/);
});

test('all filter labels come from the supplied i18n dictionary', async () => {
  const labels = {
    shitpost_meter_title: 'Meter & title',
    shitpost_meter_empty: '<No matches>',
    shitpost_meter_serious: 'Serious & thoughtful',
    shitpost_meter_shitpost: 'Just jokes',
  };
  const html = await generate({ ...context([]), i18n: key => labels[key] ?? key });
  assert.match(html, /<span>Meter &amp; title<\/span>/);
  assert.match(html, /&lt;No matches&gt;/);
  assert.match(html, /0 | serious &amp; thoughtful/);
  assert.match(html, /9 | jokes/);
});

test('both footer actions use the original random-note link style without button resets', async () => {
  const html = await generate(context([post(1)]));
  assert.match(html, /<a class="random-note" href="\/posts\/">see_more<\/a>/);
  assert.match(html, /<a class="random-note rated-random" href="\/posts\/" hidden>random_note<\/a>/);
  assert.doesNotMatch(html, /class="see-more"|<button/);
});
