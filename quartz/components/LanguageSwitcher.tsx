/**
 * LanguageSwitcher.tsx
 */

import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import style from "./styles/languageSwitcher.scss"

const LanguageSwitcher: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  const fm = fileData.frontmatter as Record<string, unknown> | undefined

  // Определяем текущий язык по первому сегменту пути
  const parts = slug.split("/")
  const currentLang: "ru" | "en" | null = parts[0] === "ru" ? "ru" : parts[0] === "en" ? "en" : null

  // Если мы вне ru/en — не показываем переключатель
  if (!currentLang) return null

  const otherLang: "ru" | "en" = currentLang === "ru" ? "en" : "ru"

  // Строим slug пары (меняем первый сегмент)
  const pairSlug = [otherLang, ...parts.slice(1)].join("/")
  const pairUrl = `/${pairSlug}`

  // Флаги
  const isAutoTranslated = fm?.autoTranslated === true || fm?.autoTranslated === "true"

  // Метки кнопок
  const labels: Record<"ru" | "en", string> = { ru: "RU", en: "EN" }
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
        {labels[currentLang]}
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

// Клиентский скрипт: сохраняет выбор и при входе без префикса редиректит
LanguageSwitcher.afterDOMLoaded = `
(function() {
  const STORAGE_KEY = "preferred-lang";
  const LANGS = ["ru", "en"];

  // Сохраняем выбор при клике
  const link = document.getElementById("lang-switcher-link");
  if (link) {
    link.addEventListener("click", function() {
      const lang = this.dataset.lang;
      if (lang) localStorage.setItem(STORAGE_KEY, lang);
    });
  }

  // Определяем текущий язык из URL
  const parts = window.location.pathname.replace(/^\\//, "").split("/");
  const currentLang = LANGS.includes(parts[0]) ? parts[0] : null;

  if (currentLang) {
    // Обновляем localStorage под текущую страницу
    localStorage.setItem(STORAGE_KEY, currentLang);
    // Помечаем <html> для CSS-фильтрации Explorer
    document.documentElement.setAttribute("data-lang", currentLang);
  }
})();
`

export default (() => LanguageSwitcher) satisfies QuartzComponentConstructor
