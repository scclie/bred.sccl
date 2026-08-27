/**
 * embed module - legacy slot-based iframe generator.
 * Prefer the formatter: ```embed url="..." height=480 in .smd content.
 */
export default async ({ params }) => {
  const url = params.url || '';
  const height = params.height || '400';
  const title = params.title || 'Embedded content';
  const width = params.width || '100%';

  if (!url) return '';

  return `
<div class="embed-container">
  <iframe
    src="${url}"
    style="width: ${width}; height: ${height}px"
    title="${title}"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    loading="lazy"
    allowfullscreen
  ></iframe>
</div>`;
};
