import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { runInNewContext } from 'node:vm';
import { loadConfig } from './lib/config.mjs';
import { buildModel, prefixOf } from './lib/model.mjs';
import { discoverModules, resolveSlots, applyOverrides } from './lib/modules.mjs';

const root = process.cwd();
const publicDir = join(root, 'public');
const config = loadConfig(root);
const model = buildModel(config, root);
const modules = discoverModules(root);
const { zones } = resolveSlots(config, modules);
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
const htmlFiles = walk(publicDir).filter(file => file.endsWith('.html'));
const expected = model.pages.map(page => page.link === '/' ? 'index.html' : `${page.link.slice(1)}index.html`);
if (expected.includes('404/index.html')) expected.push('404.html');
assert.deepEqual(htmlFiles.map(file => relative(publicDir, file)).sort(), expected.sort(), 'all canonical pages and only the 404 alias are published');
const sandbox = { window: {} };
runInNewContext(readFileSync(join(publicDir, '.cache/search.js'), 'utf8'), sandbox);
const indexed = Object.values(sandbox.window.SEARCH_INDEX).flat();
assert.deepEqual(indexed.map(page => page.u).sort(), model.pages.map(page => page.link).sort(), 'search indexes every canonical page');
let embeds = 0;
let diagrams = 0;
for (const page of model.pages) {
  const html = readFileSync(join(publicDir, page.link.slice(1), 'index.html'), 'utf8');
  assert.ok(!html.includes('<style></style>'), `${page.link}: no empty styles`);
  assert.ok(html.includes('notizine-performance:critical-shell:start'), `${page.link}: marked shell`);
  for (const cell of ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right']) {
    assert.ok(html.includes(`grid-cell-${cell}`), `${page.link}: ${cell}`);
  }
  const resolved = applyOverrides(zones, config.slots_overrides, page.link, modules);
  const hasSearch = Object.values(resolved).flat(2).some(entry => entry.module === 'search');
  assert.equal(html.includes('class="search-widget"'), hasSearch, `${page.link}: resolved search widget`);
  assert.equal(html.includes('src="/.cache/search.js"'), hasSearch, `${page.link}: local search index`);
  assert.equal(html.includes('src="/assets/modules/search.js"'), hasSearch, `${page.link}: local search client`);
  if (hasSearch) assert.ok(html.indexOf('src="/.cache/search.js"') < html.indexOf('src="/assets/modules/search.js"'));
  assert.ok(html.includes('https://notizine.sccl.cc'), `${page.link}: site attribution`);
  for (const badge of ['badge-notizine', 'badge-zine', 'badge-sccl']) assert.ok(html.includes(badge), `${page.link}: ${badge}`);
  assert.equal((html.match(/href="\/badges\/badges\.css"/g) ?? []).length, 1, `${page.link}: badge stylesheet registered once`);
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="(\/[^"?#]+)"/g)) {
    assert.ok(existsSync(join(publicDir, match[1])), `${page.link}: asset ${match[1]} exists`);
  }
  const source = readFileSync(page.filePath, 'utf8');
  if (/```embed|class="embed-container"/.test(source)) {
    embeds++;
    assert.ok(html.includes('<iframe') && html.includes('web-share'), `${page.link}: custom embed permissions`);
  }
  if (/```mermaid|x_mermaid_block_/.test(source)) {
    diagrams++;
    assert.ok(html.includes('<svg'), `${page.link}: rendered diagram`);
    assert.ok(!html.includes('x_mermaid_block_'), `${page.link}: no diagram placeholder`);
  }
  const locale = config.site.locales.find(locale => locale.code === page.locale);
  assert.ok(page.link.startsWith('/' + prefixOf(locale)), `${page.link}: locale prefix`);
  assert.ok(!page.link.includes('//'), `${page.link}: safe canonical route`);
}
assert.ok(embeds > 0 && diagrams > 0, 'live embed and diagram coverage');
console.log(`[test] ${model.pages.length} canonical pages, ${htmlFiles.length} html outputs, ${indexed.length} search entries, ${embeds} embed pages, ${diagrams} mermaid pages passed`);
