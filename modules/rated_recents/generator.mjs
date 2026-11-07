import { esc, formatDate, requireSection, sectionSiblingsOf } from '../../scripts/lib/api.mjs';
import { buildEntries, filterEntries } from './data.js';

export default async function ({ page, site, params, i18n }) {
  const section = params.section ?? '/posts/';
  const count = params.count ?? 5;
  requireSection(site, page.locale, section);
  const entries = buildEntries(site, page.locale, section);
  const items = filterEntries(entries, 0, 9, count).map(p => `<div class="recent-item rated-item"><a href="${esc(p[0])}">${esc(p[1])}</a><div class="recent-meta rated-meta">${esc(formatDate(p[2], page.locale))} | ${p[4]} ${esc(i18n('min_short'))} | ${p[3]} ${esc(i18n('words_short'))}</div></div>`).join('');
  const json = JSON.stringify(entries).replace(/</g, '\\u003c').replace(/&/g, '\\u0026');
  const hidden = page.isSection || ['/recents/', '/tags/', '/search/', '/explorer/'].includes(page.link);
  const ownBranch = page.link.startsWith(section) || page.parentLink?.startsWith(section);
  let nav = '';
  if (!hidden && ownBranch && site.config.features?.prev_next_recents) {
    const siblings = sectionSiblingsOf(site, page, section);
    const index = siblings.findIndex(p => p.link === page.link);
    const prev = index > 0 ? siblings[index - 1] : null;
    const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;
    if (prev || next) {
      nav = `<div class="recent-footer-bottom">${prev ? `<a href="${esc(prev.link)}" class="recent-nav-prev">${esc(i18n('prev_short'))}</a>` : ''}<span class="flex-spacer"></span>${next ? `<a href="${esc(next.link)}" class="recent-nav-next">${esc(i18n('next_short'))}</a>` : ''}</div>`;
    }
  }
  return `<section class="module module-recents rated-recents" data-count="${count}" data-locale="${esc(page.locale)}" data-minutes="${esc(i18n('min_short'))}" data-words="${esc(i18n('words_short'))}">
  <h3>${esc(params.title ?? i18n('recents_title'))}</h3>
  <div class="rated-controls" hidden>
    <div class="recent-meta recent-footer-top rated-label"><span>${esc(i18n('shitpost_meter_title'))}</span><output class="rated-interval">0–9</output></div>
    <div class="rated-slider">
      <input class="rated-min" type="range" min="0" max="9" step="1" value="0" disabled>
      <input class="rated-max" type="range" min="0" max="9" step="1" value="9" disabled>
    </div>
    <div class="recent-meta recent-footer-top rated-endpoints"><span>0 | ${esc(i18n('shitpost_meter_serious'))}</span><span>9 | ${esc(i18n('shitpost_meter_shitpost'))}</span></div>
  </div>
  <hr>
  <div class="rated-items">${items}</div>
  <p class="rated-empty" role="status"${entries.length ? ' hidden' : ''}><span class="recent-meta">${esc(i18n('shitpost_meter_empty'))}</span></p>
  <div class="recent-footer"><div class="recent-footer-top"><a class="random-note" href="${esc(section)}">${esc(i18n('see_more'))}</a><a class="random-note rated-random" href="${esc(section)}" hidden>${esc(i18n('random_note'))}</a></div>${nav}</div>
  <script type="application/json" class="rated-data">${json}</script>
</section>`;
}
