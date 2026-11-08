import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { postprocess } from '../../lib/mermaid.mjs';

test('Mermaid uses the PATH CLI and passes the optional browser config', async () => {
  const root = mkdtempSync(join(tmpdir(), 'notizine-mermaid-'));
  const oldPath = process.env.PATH;
  const oldConfig = process.env.MERMAID_PUPPETEER_CONFIG;
  try {
    const bin = join(root, 'bin');
    const publicDir = join(root, 'public');
    mkdirSync(bin);
    mkdirSync(publicDir);
    const config = join(root, 'browser config.json');
    writeFileSync(config, '{"args":["--no-sandbox"]}');
    // Stand-in at the external-process boundary; only valid inputs produce SVG.
    writeFileSync(join(bin, 'mmdc'), `#!${process.execPath}
import { readFileSync, writeFileSync } from 'node:fs';
const args = process.argv.slice(2);
const value = flag => args[args.indexOf(flag) + 1];
if (!args.includes('-p') || !readFileSync(value('-p'), 'utf8').includes('--no-sandbox')) process.exit(1);
if (readFileSync(value('-i'), 'utf8').trim() !== 'graph TD; A-->B') process.exit(2);
writeFileSync(value('-o'), '<svg xmlns="http://www.w3.org/2000/svg"><text>diagram</text></svg>');
`, { mode: 0o755 });
    // No nix-shell is available: CI must invoke mmdc directly.
    process.env.PATH = bin;
    process.env.MERMAID_PUPPETEER_CONFIG = config;
    const page = join(publicDir, 'index.html');
    writeFileSync(page, '<pre><code>x_mermaid_block_0\ngraph TD; A--&gt;B\nx_mermaid_block_0\n</code></pre>');
    assert.deepEqual(await postprocess(publicDir, { features: { mermaid: true } }), [page]);
    assert.match(readFileSync(page, 'utf8'), /class="mermaid-rendered"><svg/);
    assert.doesNotMatch(readFileSync(page, 'utf8'), /x_mermaid_block_/);
  } finally {
    process.env.PATH = oldPath;
    if (oldConfig === undefined) delete process.env.MERMAID_PUPPETEER_CONFIG;
    else process.env.MERMAID_PUPPETEER_CONFIG = oldConfig;
    rmSync(root, { recursive: true, force: true });
  }
});
