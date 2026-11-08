import sharp from 'sharp';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

export default async function generateOG({ config, model }) {
  const og = config.og || {};
  if (!config.features?.og_images) {
    console.log('[generate-og] Skipped (og_images disabled)');
    return;
  }

  const colors = {
    background: og.background || '#3b4252',
    text: og.text || '#eceff4',
    muted: og.muted || '#ebcb8b',
  };
  const sizes = {
    title: og.title_size || 52,
    desc: og.desc_size || 26,
    site: og.site_size || 22,
    date: og.date_size || 24,
  };
  const font = og.font_family || 'Cascadia Code';
  const showDate = og.show_date !== false;
  const showDesc = og.show_desc !== false;
  const bgImage = og.background_image || '';
  const siteName = og.site_name || '';

  const W = 1200, H = 630;
  const pages = model.pages.filter(p => !p.isSection && p.title);
  let count = 0;

  const ogCache = join(process.cwd(), 'assets', '.cache', 'og-images');
  const validKeys = [...new Set(pages.map(p => p.link.replace(/^\//, '')))];
  try {
    for (const entry of readdirSync(ogCache)) {
      const alive = validKeys.some(k => k === entry || k.startsWith(entry + '/'));
      if (!alive) rmSync(join(ogCache, entry), { recursive: true, force: true });
    }
  } catch {}

  for (const page of pages) {
    // Measure glyphs with the same font and weight used by the SVG renderer.
    // Leave a little extra room for glyph bearings at either edge.
    const titleLines = await wrapText(page.title, {
      font, size: sizes.title, bold: true, maxWidth: W - 132, maxLines: 3,
    });
    const titleLineHeight = Math.ceil(sizes.title * 1.2);
    const descY = Math.max(360, 280 + (titleLines.length - 1) * titleLineHeight + 80);
    const descLineHeight = Math.ceil(sizes.desc * 1.2);
    const descLines = showDesc ? await wrapText(page.description, {
      font, size: sizes.desc, maxWidth: W - 132,
      maxLines: Math.max(0, Math.min(2, Math.floor((530 - descY) / descLineHeight) + 1)),
    }) : [];
    const date = page.date ? page.date.slice(0, 10) : '';

    const bgRect = bgImage
      ? `<image href="${bgImage}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`
      : `<rect width="${W}" height="${H}" fill="${colors.background}"/>`;

    const descBlock = descLines.length
      ? `<text font-family="${font}" font-size="${sizes.desc}px" fill="${colors.text}" opacity="0.85">${textSpans(descLines, descY, descLineHeight)}</text>`
      : '';
    const dateBlock = (showDate && date)
      ? `<text x="60" y="580" font-family="${font}" font-size="${sizes.date}px" fill="${colors.muted}">${date}</text>`
      : '';

    const siteLines = siteName.split('\n').map((line, i) => {
      const dy = i === 0 ? '' : ` dy="${sizes.site * 1.4}"`;
      return `<tspan x="60"${dy}>${escapeXML(line)}</tspan>`;
    }).join('');

    const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  ${bgRect}
  <text x="60" y="80" font-family="${font}" font-size="${sizes.site}px" font-weight="700" fill="${colors.muted}" stroke="${colors.muted}" stroke-width="1" paint-order="stroke fill">${siteLines}</text>
  <text font-family="${font}" font-size="${sizes.title}px" fill="${colors.text}" font-weight="700">${textSpans(titleLines, 280, titleLineHeight)}</text>
  ${descBlock}
  ${dateBlock}
</svg>`;

    const outDir = join(process.cwd(), 'assets', '.cache', 'og-images', page.link.replace(/^\//, ''));
    mkdirSync(outDir, { recursive: true });
    await sharp(Buffer.from(svg)).png().toFile(join(outDir, 'og.png'));
    count++;
  }

  console.log(`[generate-og] Generated ${count} OG images`);
}

function escapeXML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function textSpans(lines, y, lineHeight) {
  return lines.map((line, i) => `<tspan x="60" y="${y + i * lineHeight}">${escapeXML(line)}</tspan>`).join('');
}

async function wrapText(text, { font, size, bold = false, maxWidth, maxLines }) {
  if (!text || maxLines < 1) return [];
  const widths = new Map();
  const measure = async value => {
    if (!value) return 0;
    if (!widths.has(value)) {
      // Use the actual SVG renderer, not Pango's separate point-based layout:
      // their metrics differ for some Cyrillic text and fallback glyphs.
      const sample = `<svg width="${Math.ceil(value.length * size * 2 + 32)}" height="${Math.ceil(size * 3)}" xmlns="http://www.w3.org/2000/svg"><text x="16" y="${size * 2}" font-family="${escapeXML(font)}" font-size="${size}px" font-weight="${bold ? 700 : 400}" fill="white">${escapeXML(value)}</text></svg>`;
      const { info } = await sharp(Buffer.from(sample)).trim().raw().toBuffer({ resolveWithObject: true });
      widths.set(value, info.width);
    }
    return widths.get(value);
  };
  const graphemes = value => [...new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    .segment(value)].map(part => part.segment);
  const lines = [];
  for (const paragraph of text.trim().split(/\r?\n/)) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      if (line && await measure(`${line} ${word}`) > maxWidth) {
        lines.push(line);
        line = '';
      }
      if (await measure(word) > maxWidth) {
        for (const character of graphemes(word)) {
          if (line && await measure(line + character) > maxWidth) {
            lines.push(line);
            line = '';
          }
          line += character;
        }
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    lines.push(line);
  }
  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  const last = graphemes(visible[maxLines - 1].trimEnd());
  while (last.length && await measure(last.join('') + '…') > maxWidth) last.pop();
  visible[maxLines - 1] = last.join('') + '…';
  return visible;
}
