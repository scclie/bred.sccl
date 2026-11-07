(() => {
  const api = 'https://comments.pierdol.ing';

  const formatDate = timestamp => {
    const date = new Date(Number(timestamp) / 1000);
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const safeSite = value => {
    if (!value) return null;
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  };

  const renderComment = (comment, reply = false) => {
    const item = document.createElement('article');
    item.className = reply ? 'comment comment-reply' : 'comment';

    const header = document.createElement('header');
    header.className = 'comment-header';
    const name = document.createElement('span');
    name.className = 'comment-nickname';
    const site = safeSite(comment.site);
    if (site) {
      const link = document.createElement('a');
      link.href = site;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = comment.nickname;
      name.append(link);
    } else {
      name.textContent = comment.nickname;
    }

    const date = document.createElement('time');
    date.className = 'comment-date';
    date.textContent = formatDate(comment.created_at);
    header.append(name, date);

    const content = document.createElement('div');
    content.className = 'comment-content';
    content.innerHTML = comment.html;
    item.append(header, content);
    return item;
  };

  for (const section of document.querySelectorAll('.comments[data-thread]')) {
    const list = section.querySelector('.comments-list');
    const form = section.querySelector('.comments-form');
    const status = section.querySelector('.comments-status');
    const random = section.querySelector('.comments-random');
    const submit = form.querySelector('.comments-submit');
    const inputs = [...form.querySelectorAll('input, textarea')];
    const endpoint = `${api}/api/threads/${encodeURIComponent(section.dataset.thread)}/comments`;

    const setStatus = (message, error = false) => {
      status.textContent = message;
      status.classList.toggle('comments-status-error', error);
    };

    const load = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('bad response');
        const data = await response.json();
        const comments = Array.isArray(data.comments) ? data.comments : [];
        list.replaceChildren();
        if (!comments.length) {
          const empty = document.createElement('p');
          empty.className = 'comments-empty';
          empty.textContent = section.dataset.empty;
          list.append(empty);
          return;
        }
        const replies = new Map();
        for (const comment of comments) {
          if (!comment.parent_id) continue;
          const ownReplies = replies.get(comment.parent_id) ?? [];
          ownReplies.push(comment);
          replies.set(comment.parent_id, ownReplies);
        }
        for (const comment of comments) {
          if (comment.parent_id) continue;
          const thread = document.createElement('div');
          thread.className = 'comment-thread';
          thread.append(renderComment(comment));
          for (const reply of replies.get(comment.id) ?? []) {
            thread.append(renderComment(reply, true));
          }
          list.append(thread);
        }
      } catch {
        list.replaceChildren();
        const message = document.createElement('p');
        message.className = 'comments-empty comments-status-error';
        message.textContent = section.dataset.loadFailed;
        list.append(message);
      }
    };

    random.addEventListener('click', async event => {
      event.preventDefault();
      if (random.getAttribute('aria-disabled') === 'true') return;
      const nickname = form.elements.nickname;
      random.setAttribute('aria-disabled', 'true');
      try {
        const response = await fetch(`${api}/api/nickname`);
        if (!response.ok) throw new Error('bad response');
        nickname.value = (await response.json()).nickname;
      } catch {
        nickname.value = `guest${Math.floor(Math.random() * 1000)}`;
      } finally {
        random.removeAttribute('aria-disabled');
      }
    });

    submit.addEventListener('click', event => {
      event.preventDefault();
      if (submit.getAttribute('aria-disabled') !== 'true') form.requestSubmit();
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      inputs.forEach(input => { input.disabled = true; });
      submit.setAttribute('aria-disabled', 'true');
      random.setAttribute('aria-disabled', 'true');
      submit.textContent = section.dataset.posting;
      setStatus('');
      const payload = {
        nickname: form.elements.nickname.value.trim(),
        site: form.elements.site.value.trim() || null,
        content: form.elements.content.value.trim(),
        honeypot: form.elements.honeypot.value,
      };
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || section.dataset.postFailed);
        form.reset();
        setStatus(section.dataset.pending);
      } catch (error) {
        setStatus(error.message || section.dataset.postFailed, true);
      } finally {
        inputs.forEach(input => { input.disabled = false; });
        submit.removeAttribute('aria-disabled');
        random.removeAttribute('aria-disabled');
        submit.textContent = submit.dataset.submit;
      }
    });

    submit.dataset.submit = submit.textContent;
    load();
  }
})();
