const EMBED_RE = /```embed\b[ \t]*\r?\n?([\s\S]*?)```/g;

function parseParams(body) {
  const params = {};
  for (const line of body.trim().split(/\r?\n/)) {
    const m = line.match(/^([\w-]+)\s*=\s*"([^"]*)"|^([\w-]+)\s*=\s*([^\s]+)/);
    if (m) {
      const key = m[1] ?? m[3];
      const val = m[2] ?? m[4];
      params[key] = val;
    }
  }
  return params;
}

function escAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function preprocess(content) {
  return content.replace(EMBED_RE, (block, body) => {
    const params = parseParams(body);
    const url = params.url || '';
    if (!url) return block;

    const height = params.height || '400';
    const width = params.width || '100%';
    const title = params.title || 'Embedded content';

    return '```=html\n<div class="embed-container">\n  <iframe\n    src="' + escAttr(url) +
      '"\n    style="width: ' + escAttr(width) + '; height: ' + escAttr(height) + 'px"\n    title="' + escAttr(title) +
      '"\n    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"\n    loading="lazy"\n    allowfullscreen\n  ></iframe>\n</div>\n```';
  });
}