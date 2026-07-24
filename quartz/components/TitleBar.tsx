import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const TitleBar: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const title = fileData.frontmatter?.title
  if (!title) return null

  const slug = fileData.slug ?? ""
  const parts = slug.split("/")
  const currentLang: "ru" | "en" | null = parts[0] === "ru" ? "ru" : parts[0] === "en" ? "en" : null
  const isIndex = slug === "index" || slug === "ru/index" || slug === "en/index"

  let pairUrl: string
  let otherLang: "ru" | "en"
  let activeLang: string

  if (isIndex) {
    otherLang = currentLang === "en" ? "ru" : "en"
    pairUrl = `/${otherLang}/`
    activeLang = currentLang || "ru"
  } else if (currentLang) {
    otherLang = currentLang === "ru" ? "en" : "ru"
    pairUrl = `/${[otherLang, ...parts.slice(1)].join("/")}`
    activeLang = currentLang
  } else {
    return <h1 class={classNames(displayClass, "article-title")}>{title}</h1>
  }

  const labels: Record<"ru" | "en", string> = { ru: "RU", en: "EN" }
  const langLabel = labels[otherLang]
  const titleAttr = otherLang === "en" ? "Switch to English" : "Переключить на русский"

  return (
    <div class={classNames(displayClass, "title-bar")}>
      <h1 class="article-title">{title}</h1>
      <div class="lang-switcher">
        <span class="lang-current">{labels[activeLang as "ru" | "en"]}</span>
        <span class="lang-divider">|</span>
        <a
          href={pairUrl}
          class="lang-other"
          title={titleAttr}
          data-lang={otherLang}
          data-pair-url={pairUrl}
          id="lang-switcher-link"
        >
          {langLabel}
        </a>
      </div>
    </div>
  )
}

TitleBar.css = `
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin: 2rem 0 0 0;
}
.title-bar .article-title {
  margin: 0;
  min-width: 0;
  flex: 1;
}
.title-bar .lang-switcher {
  flex-shrink: 0;
  white-space: nowrap;
}
`

export default (() => TitleBar) satisfies QuartzComponentConstructor
