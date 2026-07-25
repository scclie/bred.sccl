import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { FullSlug, resolveRelative } from "../../util/path"
import { QuartzPluginData } from "../../plugins/vfile"
import { Date, getDate } from "../Date"
import { byDateAndAlphabetical } from "../PageList"
import { i18n } from "../../i18n"
import { concatenateResources } from "../../util/resources"
import style from "../styles/listPage.scss"

export default (() => {
  const RecentsContent: QuartzComponent = (props: QuartzComponentProps) => {
    const { allFiles, fileData, cfg } = props

    const currentSlug = fileData.slug ?? ""
    const isRootRecents = currentSlug === "recents" || currentSlug === "recents/index"

    const langFilter = (f: QuartzPluginData) => {
      if (!isRootRecents) {
        const slug = f.slug ?? ""
        if (currentSlug.startsWith("en/")) return slug.startsWith("en/")
        if (currentSlug.startsWith("ru/")) return !slug.startsWith("en/")
      }
      return true
    }

    const pages = allFiles
      .filter((file) => {
        const slug = file.slug ?? ""
        if (slug === "index" || slug === "en/index" || slug === "ru/index") return false
        if (slug.startsWith("tags/")) return false
        if (slug.endsWith("/recents/index")) return false
        if (slug === "recents" || slug === "recents/index") return false
        if (slug === "search") return false
        if (slug === "explorer") return false
        return true
      })
      .filter((file) => file.frontmatter?.title)
      .filter(langFilter)
      .sort(byDateAndAlphabetical(cfg))

    return (
      <div class="popover-hint">
        <div class="page-listing recents-listing">
          <p>{i18n(cfg.locale).pages.tagContent.itemsUnderTag({ count: pages.length })}</p>
          <ul class="section-ul">
            {pages.map((page) => {
              const title = page.frontmatter?.title ?? ""
              const description = page.frontmatter?.description
              const tags = page.frontmatter?.tags ?? []
              const pageLang = (page.slug ?? "").startsWith("en/") ? "en" : "ru"
              return (
                <li class="section-li" data-lang={pageLang}>
                  <div class="recents-entry">
                    <div class="recents-row">
                      <span class="recents-title">
                        <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                          {title}
                        </a>
                      </span>
                      {page.dates && (
                        <span class="recents-date">
                          <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                        </span>
                      )}
                    </div>
                    <div class="recents-row">
                      {description && <span class="recents-description">{description}</span>}
                      {tags.length > 0 && (
                        <ul class="tags recents-tags">
                          {tags.map((tag) => (
                            <li>
                              <a
                                href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
                                class="internal tag-link"
                              >
                                {tag}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        {isRootRecents && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
(function() {
  var LANGS = ["ru", "en"];
  function getPreferredLang() {
    var saved = localStorage.getItem("preferred-lang");
    if (saved && LANGS.includes(saved)) return saved;
    var parts = window.location.pathname.replace(/^\\//, "").split("/");
    if (LANGS.includes(parts[0])) return parts[0];
    return "ru";
  }
  function filterRecents() {
    var lang = getPreferredLang();
    var items = document.querySelectorAll(".section-ul > li.section-li[data-lang]");
    var visibleCount = 0;
    items.forEach(function(li) {
      if (li.getAttribute("data-lang") === lang) {
        li.style.display = "";
        visibleCount++;
      } else {
        li.style.display = "none";
      }
    });
    var countEl = document.querySelector(".page-listing > p");
    if (countEl) {
      if (lang === "en") countEl.textContent = visibleCount + " notes";
      else countEl.textContent = visibleCount + " заметок";
    }
  }
  filterRecents();
  document.addEventListener("nav", filterRecents);
})();
`,
            }}
          />
        )}
      </div>
    )
  }

  RecentsContent.css = concatenateResources(
    style,
    `
li.section-li > .recents-entry {
  display: flex;
  flex-direction: column;
  gap: 0.15em;
}

li.section-li {
  padding: 0.75em 0;
}

li.section-li:not(:last-child) {
  border-bottom: 1px dashed var(--gray);
}

.recents-entry .recents-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1em;
}

.recents-entry .recents-row:last-child {
  flex-direction: column;
  gap: 0.2em;
}

.recents-entry .recents-title {
  flex: 1;
  min-width: 0;
}

.recents-entry .recents-title a {
  background-color: transparent;
}

.recents-entry .recents-date {
  white-space: nowrap;
  text-align: right;
  opacity: 0.6;
  font-size: 0.85em;
}

.recents-entry .recents-description {
  flex: 1;
  min-width: 0;
  opacity: 0.75;
  font-size: 0.9em;
}

.recents-entry .recents-tags {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3em;
  justify-content: flex-end;
}
`,
  )

  return RecentsContent
}) satisfies QuartzComponentConstructor
