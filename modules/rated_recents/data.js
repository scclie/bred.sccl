export function buildEntries(site, locale, section) {
  return site.pages
    .filter(p => p.locale === locale && !p.isSection && p.link.startsWith(section))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map(p => {
      const custom = p.meta?.custom ?? {};
      const rating = Object.hasOwn(custom, 'shitpost_rate') ? custom.shitpost_rate : 0;
      if (!Number.isInteger(rating) || rating < 0 || rating > 9) {
        throw new Error(`${p.filePath ?? p.link}: shitpost_rate must be an integer from 0 to 9`);
      }
      return [p.link, p.title, p.date, p.wordcount, p.readtime, rating];
    });
}

export function filterEntries(entries, min, max, count) {
  return entries.filter(p => p[5] >= min && p[5] <= max).slice(0, count);
}
