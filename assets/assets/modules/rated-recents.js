(() => {
  for (const root of document.querySelectorAll('.rated-recents')) {
    const entries = JSON.parse(root.querySelector('.rated-data').textContent);
    const min = root.querySelector('.rated-min');
    const max = root.querySelector('.rated-max');
    const slider = root.querySelector('.rated-slider');
    const interval = root.querySelector('.rated-interval');
    const items = root.querySelector('.rated-items');
    const empty = root.querySelector('.rated-empty');
    const random = root.querySelector('.rated-random');
    let matching = entries;
    let stored = null;
    try { stored = JSON.parse(localStorage.getItem('shitpost-o-meter')); } catch {}
    if (Array.isArray(stored) && stored.length === 2 && stored.every(Number.isInteger)
      && stored[0] >= 0 && stored[1] <= 9 && stored[0] <= stored[1]) {
      min.value = stored[0];
      max.value = stored[1];
    }
    const dateFormat = new Intl.DateTimeFormat(root.dataset.locale, {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
    });

    function update(changed) {
      if (+min.value > +max.value) {
        changed.value = changed === min ? max.value : min.value;
      }
      const low = +min.value;
      const high = +max.value;
      min.setAttribute('aria-valuemax', high);
      max.setAttribute('aria-valuemin', low);
      interval.value = `${low}–${high}`;
      matching = entries.filter(p => p[5] >= low && p[5] <= high);
      try { localStorage.setItem('shitpost-o-meter', JSON.stringify([low, high])); } catch {}
      const fragment = document.createDocumentFragment();
      for (const p of matching.slice(0, +root.dataset.count)) {
        const item = document.createElement('div');
        item.className = 'recent-item rated-item';
        const link = document.createElement('a');
        link.href = p[0];
        link.textContent = p[1];
        const meta = document.createElement('div');
        meta.className = 'recent-meta rated-meta';
        const date = new Date(`${p[2].slice(0, 10)}T00:00:00Z`);
        const formatted = Number.isNaN(date.valueOf()) ? '' : dateFormat.format(date);
        meta.textContent = `${formatted} | ${p[4]} ${root.dataset.minutes} | ${p[3]} ${root.dataset.words}`;
        item.append(link, meta);
        fragment.append(item);
      }
      items.replaceChildren(fragment);
      empty.hidden = matching.length > 0;
      random.hidden = !matching.length;
    }

    min.addEventListener('input', () => update(min));
    max.addEventListener('input', () => update(max));
    let drag = null;
    function pointerValue(event) {
      const box = slider.getBoundingClientRect();
      const inset = parseFloat(getComputedStyle(document.documentElement).fontSize) / 2;
      return (event.clientX - box.left - inset) / (box.width - 2 * inset) * 9;
    }
    function moveThumb(event) {
      if (!drag || drag.id !== event.pointerId) return;
      if (!drag.input) {
        if (event.clientX === drag.startX) return;
        drag.input = event.clientX < drag.startX ? min : max;
      }
      const value = Math.round(Math.max(0, Math.min(9, pointerValue(event))));
      drag.input.focus({ preventScroll: true });
      drag.input.value = value;
      update(drag.input);
    }
    slider.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      const value = pointerValue(event);
      drag = {
        id: event.pointerId,
        startX: event.clientX,
        input: +min.value === +max.value ? null
          : Math.abs(value - +min.value) < Math.abs(value - +max.value) ? min : max,
      };
      slider.setPointerCapture(event.pointerId);
      moveThumb(event);
    });
    slider.addEventListener('pointermove', moveThumb);
    for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      slider.addEventListener(eventName, event => {
        if (drag?.id !== event.pointerId) return;
        drag = null;
        if (slider.hasPointerCapture(event.pointerId)) slider.releasePointerCapture(event.pointerId);
      });
    }
    random.addEventListener('click', event => {
      event.preventDefault();
      if (matching.length) location.href = matching[Math.floor(Math.random() * matching.length)][0];
    });
    update(min);
    min.disabled = false;
    max.disabled = false;
    root.querySelector('.rated-controls').hidden = false;
  }
})();
