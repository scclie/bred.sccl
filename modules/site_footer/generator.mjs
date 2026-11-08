import { execFileSync } from 'node:child_process';

export default async function ({ i18n }, env = process.env) {
  let sha = env.GITHUB_SHA;
  if (sha === undefined) {
    try {
      sha = execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: new URL('../../', import.meta.url),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 1000,
      }).trim();
    } catch {
      // Source archives and machines without Git can still build the blog.
      sha = '';
    }
  }
  const commit = /^[a-f0-9]{40}$/i.test(sha ?? '')
    ? ` <a href="https://github.com/scclie/bred.sccl">${sha.slice(0, 7)}</a>`
    : '';
  return `<p class="footer-text"><a href="https://sccl.cc">sccl.cc</a> | ${commit} | <span>${i18n('generated_by')}</span> <a href="https://zine-ssg.io">zine</a> <span>${i18n('with')}</span> <a href="https://git.sccl.cc/scclie/notizine">notizine</a></p>`;
}
