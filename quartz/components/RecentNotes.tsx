import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, SimpleSlug, resolveRelative } from "../util/path"
import { QuartzPluginData } from "../plugins/vfile"
import { byDateAndAlphabetical } from "./PageList"
import style from "./styles/recentNotes.scss"
import { Date, getDate } from "./Date"
import { GlobalConfiguration } from "../cfg"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

interface Options {
  title?: string
  limit: number
  linkToMore: SimpleSlug | false
  showTags: boolean
  filter: (f: QuartzPluginData) => boolean
  sort: (f1: QuartzPluginData, f2: QuartzPluginData) => number
}

const defaultOptions = (cfg: GlobalConfiguration): Options => ({
  limit: 3,
  linkToMore: false,
  showTags: true,
  filter: () => true,
  sort: byDateAndAlphabetical(cfg),
})

export default ((userOpts?: Partial<Options>) => {
  const RecentNotes: QuartzComponent = ({
    allFiles,
    fileData,
    displayClass,
    cfg,
  }: QuartzComponentProps) => {
    const opts = { ...defaultOptions(cfg), ...userOpts }

    // Определяем текущий язык по первому сегменту slug текущей страницы
    const currentSlug = fileData.slug ?? ""
    const currentLang = currentSlug.startsWith("en/") ? "en" : "ru"

    // Фильтруем страницы по языку: показываем только те, что в той же языковой папке
    const langFilter = (f: QuartzPluginData) => {
      const slug = f.slug ?? ""
      if (currentLang === "en") return slug.startsWith("en/")
      // ru: всё, что НЕ начинается с en/ (включая корень и папку ru/)
      return !slug.startsWith("en/")
    }

    const pages = allFiles
      .filter((f) => {
        const slug = f.slug ?? ""
        if (slug === "index" || slug === "en/index" || slug === "ru/index") return false
        if (slug.startsWith("tags/")) return false
        if (slug === "recents" || slug === "recents/index" || slug.endsWith("/recents/index")) return false
        if (slug === "search") return false
        return true
      })
      .filter((f) => f.frontmatter?.title)
      .filter(langFilter)
      .filter(opts.filter)
      .sort(opts.sort)

    const remaining = Math.max(0, pages.length - opts.limit)
    return (
      <div class={classNames(displayClass, "recent-notes")}>
        <h3>{opts.title ?? i18n(cfg.locale).components.recentNotes.title}</h3>
        <ul class="recent-ul">
          {pages.slice(0, opts.limit).map((page) => {
            const title = page.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title

            return (
              <li class="recent-li">
                <div class="section">
                  <div class="desc">
                    <h3>
                      <a href={resolveRelative(fileData.slug!, page.slug!)} class="internal">
                        {title}
                      </a>
                    </h3>
                  </div>
                  {page.dates && (
                    <p class="meta">
                      <Date date={getDate(cfg, page)!} locale={cfg.locale} />
                    </p>
                  )}

                </div>
              </li>
            )
          })}
        </ul>
        {opts.linkToMore && remaining > 0 && (
          <p>
            <a href={resolveRelative(fileData.slug!, `${currentLang}/${opts.linkToMore}` as SimpleSlug)}>
              {i18n(cfg.locale).components.recentNotes.seeRemainingMore({ remaining })}
            </a>
          </p>
        )}
      </div>
    )
  }

  RecentNotes.css = style
  return RecentNotes
}) satisfies QuartzComponentConstructor
