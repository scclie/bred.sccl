import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadConfig } from '../../lib/config.mjs';
import purge from '../../purge.mjs';

const project = new URL('../../../', import.meta.url).pathname;

test('real generation bundles content-used embeds only and page purge preserves legacy iframe styling', async () => {
  const root = mkdtempSync('/tmp/opencode/bred-content-styles-');
  try {
    for (const name of ['scripts', 'modules', 'assets/css', 'assets/themes', 'i18n']) {
      cpSync(join(project, name), join(root, name), { recursive: true });
    }
    symlinkSync(join(project, 'node_modules'), join(root, 'node_modules'), 'dir');
    writeFileSync(join(root, 'package.json'), '{"type":"module"}');
    const config = loadConfig(project);
    config.features.og_images = false;
    config.features.search = false;
    config.slots = Object.fromEntries(Object.keys(config.slots).map(cell => [cell, []]));
    config.slots_overrides = {};
    config.site.locales = [{ code: 'en', name: 'English', site_title: 'test', content_dir_path: 'content/en', output_prefix_override: '' }];
    writeFileSync(join(root, 'assets/notizine.ziggy'), JSON.stringify(config));
    mkdirSync(join(root, 'content/en'), { recursive: true });
    const source = join(root, 'content/en/index.smd');
    for (const body of ['ordinary text', '```embed\nurl="https://example.org"\n```', '```=html\n<div class="embed-container"><iframe src="https://example.org"></iframe></div>\n```']) {
      writeFileSync(source, `---\n.title = "test",\n---\n${body}\n`);
      const result = spawnSync(process.execPath, [join(root, 'scripts/generate.mjs')], { cwd: root, encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr + result.stdout);
      const css = readFileSync(join(root, 'assets/.cache/all.css'), 'utf8');
      assert.equal(css.includes('.embed-container iframe'), body !== 'ordinary text', 'only active content modules contribute styles');
      assert.ok(!css.includes('margin-block: 1rem'), 'unrelated search module styles are not bundled');
      if (body === 'ordinary text') continue;
      mkdirSync(join(root, 'public'), { recursive: true });
      const html = `<style>${css}</style><div class="embed-container"><iframe src="https://example.org"></iframe></div>`;
      writeFileSync(join(root, 'public/index.html'), html);
      writeFileSync(join(root, 'public/ordinary.html'), `<style>${css}</style><p>ordinary</p>`);
      await purge(join(root, 'public'));
      const built = readFileSync(join(root, 'public/index.html'), 'utf8');
      assert.match(built, /\.embed-container iframe\{[^}]*border:1px solid var\(--border,#ccc\);[^}]*border-radius:8px/);
      assert.doesNotMatch(readFileSync(join(root, 'public/ordinary.html'), 'utf8'), /\.embed-container/);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('real sccl bundle purge retains dynamic search result foreground and hover identity', async () => {
  const root = mkdtempSync('/tmp/opencode/bred-search-hover-');
  try {
    const theme = readFileSync(join(project, 'assets/themes/sccl.css'), 'utf8');
    const moduleCSS = readFileSync(join(project, 'modules/search/style.css'), 'utf8');
    writeFileSync(join(root, 'index.html'), `<style>${theme}\n${moduleCSS}</style><p>Search</p><section class="search-widget"><input class="search-input"><div class="search-results"></div></section>`);
    await purge(root);
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    assert.match(html, /\.search-widget \.search-results\s*>\s*\*\{[^}]*padding:0\.125rem 0\.25rem/);
    assert.match(html, /\.search-widget \.search-results\s*>\s*:hover\{[^}]*background:var\(--accent\)/);
    assert.match(html, /\.search-widget \.search-results\s*>\s*:hover \*\{[^}]*color:var\(--on-accent\)/);
    assert.match(html, /\.search-widget \.search-results :any-link\{[^}]*color:var\(--fg\);[^}]*text-decoration:none/);
    assert.match(html, /\.search-widget \.search-results p\{color:var\(--fg\)\}/, 'normal paragraphs retain readable sccl foreground with greater specificity than later module css');
    assert.match(html, /\.search-results p\{color:var\(--text-muted\)/, 'the generic module rule remains present to exercise the cascade conflict');
    assert.ok(html.indexOf('.search-widget .search-results p{') < html.indexOf('.search-widget .search-results > :hover *{'), 'higher-specificity hovered descendants remain after the normal paragraph rule');
    assert.match(html, /\.search-widget \.search-input\{border-radius:0\}/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('real purged base theme and language css preserve readable bold controls without recoloring breadcrumbs', async t => {
  const root = mkdtempSync('/tmp/opencode/bred-language-contrast-');
  try {
    const css = ['assets/css/base.css', 'assets/themes/sccl.css', 'modules/lang_nav/style.css', 'modules/breadcrumbs/style.css']
      .map(path => readFileSync(join(project, path), 'utf8')).join('\n');
    const path = join(root, 'index.html');
    writeFileSync(path, `<!doctype html><html><head><style>${css}</style></head><body><header id="header"><nav class="lang-nav"><a class="lang-link" href="/ru/"><span class="lang-cur">en</span><span class="lang-sep">/</span><span class="lang-alt">ru</span></a></nav><nav class="breadcrumbs"><a href="/">Home</a></nav></header><pre id="probe"></pre><script>
      document.querySelector('#probe').textContent = JSON.stringify({
        language: [...document.querySelectorAll('.lang-link, .lang-link span')].map(node => { const style = getComputedStyle(node); return { color: style.color, weight: style.fontWeight }; }),
        breadcrumb: getComputedStyle(document.querySelector('.breadcrumbs a')).color
      });
    </script></body></html>`);
    await purge(root);
    const html = readFileSync(path, 'utf8');
    assert.match(html, /#header nav\.lang-nav a\{[^}]*color:var\(--fg\);[^}]*font-weight:700/);
    assert.match(html, /#header nav:not\(\.breadcrumbs\) a\{[^}]*color:var\(--text-muted\)/, 'competing base selector remains in the real purged cascade');
    assert.ok(html.indexOf('#header nav:not(.breadcrumbs) a{') < html.indexOf('#header nav.lang-nav a{'), 'equal-specificity theme selector follows the base selector');
    assert.match(html, /\.breadcrumbs a\{[^}]*color:var\(--accent\)/);
    assert.doesNotMatch(html, /#header nav a\{/);
    assert.match(html, /#header nav\.lang-nav a:hover\{[^}]*background:var\(--accent\);[^}]*color:var\(--on-accent\)/, 'language hover retains scoped contrast after purge');
    // Chromium is optional; real purge/cascade coverage above is always mandatory.
    const capability = spawnSync('chromium', ['--version'], { encoding: 'utf8', timeout: 10000 });
    await t.test('optional Chromium computed language and breadcrumb contrast', {
      skip: capability.status === 0 ? false : 'chromium is not available on PATH',
    }, () => {
      const browser = spawnSync('chromium', ['--headless', '--no-sandbox', '--disable-gpu', '--dump-dom', `file://${path}`], { encoding: 'utf8', timeout: 30000 });
      assert.equal(browser.status, 0, browser.stderr);
      const state = JSON.parse(browser.stdout.match(/<pre id="probe">([^<]+)<\/pre>/)?.[1] ?? 'null');
      assert.deepEqual(state.language, Array.from({ length: 4 }, () => ({ color: 'rgb(216, 222, 233)', weight: '700' })));
      assert.equal(state.breadcrumb, 'rgb(136, 192, 208)', 'breadcrumb links retain their accent semantics');
    });
  } finally { rmSync(root, { recursive: true, force: true }); }
});
