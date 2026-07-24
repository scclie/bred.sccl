import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import style from "./styles/languageSwitcher.scss"

const LanguageSwitcher: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  const fm = fileData.frontmatter as Record<string, unknown> | undefined

  const parts = slug.split("/")
  const currentLang: "ru" | "en" | null = parts[0] === "ru" ? "ru" : parts[0] === "en" ? "en" : null

  const isIndex = slug === "index" || slug === "ru/index" || slug === "en/index"

  let pairUrl: string
  let otherLang: "ru" | "en"

  if (isIndex) {
    // На любом index: ru/index → /en/, en/index → /ru/, index → /en/
    otherLang = currentLang === "en" ? "ru" : "en"
    pairUrl = `/${otherLang}/`
  } else if (currentLang) {
    // На обычных страницах: ru/foo → /en/foo
    otherLang = currentLang === "ru" ? "en" : "ru"
    pairUrl = `/${[otherLang, ...parts.slice(1)].join("/")}`
  } else {
    return null
  }

  const isAutoTranslated = fm?.autoTranslated === true || fm?.autoTranslated === "true"
  const labels: Record<"ru" | "en", string> = { ru: "RU", en: "EN" }
  const activeLang = currentLang || "ru"
  const langLabel = otherLang === "en" && isAutoTranslated ? "🤖 EN" : labels[otherLang]
  const title =
    otherLang === "en" && isAutoTranslated
      ? "Automatic translation (may be inaccurate)"
      : otherLang === "en"
        ? "Switch to English"
        : "Переключить на русский"

  return (
    <div class={classNames(displayClass, "lang-switcher")}>
      <span class="lang-current" aria-current="true">
        {labels[activeLang]}
      </span>
      <span class="lang-divider">|</span>
      <a
        href={pairUrl}
        class={`lang-other${isAutoTranslated && otherLang === "en" ? " lang-auto" : ""}`}
        title={title}
        data-lang={otherLang}
        data-pair-url={pairUrl}
        id="lang-switcher-link"
      >
        {langLabel}
      </a>
    </div>
  )
}

LanguageSwitcher.css = style

LanguageSwitcher.afterDOMLoaded = `
(function() {
  var STORAGE_KEY = "preferred-lang";
  var link = document.getElementById("lang-switcher-link");
  if (link) {
    link.addEventListener("click", function() {
      var lang = this.dataset.lang;
      if (lang) {
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.setAttribute("data-lang", lang);
      }
    });
  }
})();
`

export default (() => LanguageSwitcher) satisfies QuartzComponentConstructor
