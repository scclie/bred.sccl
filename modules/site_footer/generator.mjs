export default async function ({ i18n }) {
  return `<p class="footer-text"><span>${i18n('generated_by')}</span> <a href="https://zine-ssg.io">zine</a> <span>${i18n('with')}</span> <a href="https://notizine.sccl.cc">notizine</a></p>`;
}
