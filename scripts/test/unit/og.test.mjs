import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import generateOG from '../../generate-og.mjs';
import { loadConfig } from '../../lib/config.mjs';

test('OG PNG has a flat Nord grey background, no left stripe, and yellow metadata', async () => {
  const config = loadConfig(new URL('../../../', import.meta.url).pathname);
  const root = mkdtempSync(join(tmpdir(), 'bred-og-'));
  const previous = process.cwd();
  try {
    process.chdir(root);
    await generateOG({ config, model: { pages: [{
      link: '/example/', title: 'Example title', description: 'Description', date: '2026-11-09',
    }] } });
    const { data, info } = await sharp(join(root, 'assets/.cache/og-images/example/og.png'))
      .removeAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 1200);
    assert.equal(info.height, 630);
    const pixel = (x, y) => [...data.subarray((y * info.width + x) * 3, (y * info.width + x) * 3 + 3)];
    for (const [x, y] of [[0, 0], [0, 315], [7, 315], [600, 0], [1199, 629]]) {
      assert.deepEqual(pixel(x, y), [59, 66, 82], `flat background at ${x},${y}`);
    }
    let yellow = 0;
    let purple = 0;
    for (let i = 0; i < data.length; i += 3) {
      if (data[i] === 235 && data[i + 1] === 203 && data[i + 2] === 139) yellow++;
      if (data[i] === 180 && data[i + 1] === 142 && data[i + 2] === 173) purple++;
    }
    assert.ok(yellow > 0, 'metadata is Nord yellow');
    assert.equal(purple, 0, 'no purple accent remains');
  } finally {
    process.chdir(previous);
    rmSync(root, { recursive: true, force: true });
  }
});

test('long English and Russian OG text wraps without crossing the right or date margins', async () => {
  const config = loadConfig(new URL('../../../', import.meta.url).pathname);
  const root = mkdtempSync(join(tmpdir(), 'bred-og-wrap-'));
  const previous = process.cwd();
  try {
    process.chdir(root);
    const pages = [
      { link: '/english/', title: 'the 14kb ceiling: tcp invented the smallest possible congestion window for the internet',
        description: 'discord and the secret technology of an open password file. why Electron safeStorage has existed since 2019, yet tokens still sit in plaintext.', date: '2026-06-16' },
      { link: '/russian/', title: 'Очень длинный русский заголовок про безопасность и ' + 'длинноесловобезпробелов'.repeat(8),
        description: 'Подробное описание статьи на русском языке. '.repeat(12), date: '2026-06-16' },
    ];
    await generateOG({ config, model: { pages } });
    for (const page of pages) {
      const { data, info } = await sharp(join(root, 'assets/.cache/og-images', page.link.slice(1), 'og.png'))
        .removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const background = (x, y) => {
        const i = (y * info.width + x) * 3;
        return data[i] === 59 && data[i + 1] === 66 && data[i + 2] === 82;
      };
      for (let y = 220; y < 550; y++) {
        for (let x = 1140; x < 1200; x++) {
          assert.ok(background(x, y), `${page.link}: text overflow at ${x},${y}`);
        }
      }
      let secondTitleLine = false;
      for (let y = 290; y < 335; y++) {
        for (let x = 60; x < 1140; x++) {
          if (!background(x, y)) secondTitleLine = true;
        }
      }
      assert.ok(secondTitleLine, `${page.link}: title wraps to another line`);
      for (let y = 540; y < 550; y++) {
        for (let x = 0; x < 1200; x++) assert.ok(background(x, y), `${page.link}: clear gap before date`);
      }
    }
  } finally {
    process.chdir(previous);
    rmSync(root, { recursive: true, force: true });
  }
});
