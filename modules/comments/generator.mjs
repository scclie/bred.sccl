import { esc } from '../../scripts/lib/api.mjs';

const isPost = link => /^\/(?:ru\/)?posts\//.test(link);
const threadId = link => link.replace(/^\/ru(?=\/posts\/)/, '');

export default async function ({ page, i18n }) {
  if (page.isSection || !isPost(page.link)) return '';
  const thread = threadId(page.link);
  return `<section class="comments" data-thread="${esc(thread)}" data-empty="${esc(i18n('comments_empty'))}" data-load-failed="${esc(i18n('comments_load_failed'))}" data-post-failed="${esc(i18n('comments_post_failed'))}" data-posting="${esc(i18n('comments_posting'))}" data-pending="${esc(i18n('comments_pending'))}">
  <h2>${esc(i18n('comments_title'))}</h2>
  <div class="comments-list" aria-live="polite"></div>
  <form class="comments-form">
    <div class="comments-name-row">
      <input name="nickname" maxlength="32" required autocomplete="nickname" placeholder="${esc(i18n('comments_nickname'))}">
      <a href="#" role="button" class="see-more comments-random">${esc(i18n('comments_random'))}</a>
    </div>
    <input name="site" type="url" autocomplete="url" placeholder="${esc(i18n('comments_site'))}">
    <textarea name="content" maxlength="2000" required placeholder="${esc(i18n('comments_placeholder'))}"></textarea>
    <input class="comments-honeypot" name="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
    <a href="#" role="button" class="see-more comments-submit">${esc(i18n('comments_submit'))}</a>
    <p class="comments-status" aria-live="polite"></p>
  </form>
</section>`;
}
