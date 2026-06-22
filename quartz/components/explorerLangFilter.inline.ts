/**
 * LanguageSwitcher.tsx
 *
 * Кнопка переключения RU ↔ EN в стиле Wikipedia.
 * Помещается в beforeBody (над заголовком) или в left-колонку.
 */

import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import fs from "fs"
import path from "path"

// @ts-ignore
import style from "./styles/languageSwitcher.scss"

// ─── ЧИТАЕМ СТРОКУ НАПРЯМУЮ С ДИСКА (БЕЗ IMPORT) ─────────────────────────────
// Это предотвращает вызов плагина inline-script-loader и убирает ошибки путей
const inlineFilePath = path.resolve("./quartz/components/explorerLangFilter.inline.ts")
const fileContent = fs.readFileSync(inlineFilePath, "utf-8")
const explorerLangFilterScript = fileContent.match(/export const explorerLangFilterScript = `([\s\S]*?)`/)?.[1] || ""

const LanguageSwitcher: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  const fm = fileData.frontmatter as Record<string, unknown> | undefined

  // Определяем текущий язык по первому сегменту пути
  const parts = slug.split("/")
  const currentLang: "ru" | "en" | null =
    parts[0] === "ru" ? "ru" : parts[0] === "en" ? "en" : null

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

// Клиентский скрипт: сохраняет выбор, навешивает клики при SPA-переходах и запускает фильтр
LanguageSwitcher.afterDOMLoaded = `
(function() {
  const STORAGE_KEY = "preferred-lang";
  const LANGS = ["ru", "en"];

  function setupLanguageSwitcher() {
    // Находим кнопку в DOM актуальной страницы и вешаем клик
    const link = document.getElementById("lang-switcher-link");
    if (link) {
      link.addEventListener("click", function() {
        const lang = this.dataset.lang;
        if (lang) localStorage.setItem(STORAGE_KEY, lang);
      });
    }

    // Определяем текущий язык из URL актуальной SPA-страницы
    const parts = window.location.pathname.replace(/^\\//, "").split("/");
    const currentLang = LANGS.includes(parts[0]) ? parts[0] : null;

    if (currentLang) {
      localStorage.setItem(STORAGE_KEY, currentLang);
      document.documentElement.setAttribute("data-lang", currentLang);
    }
  }

  // Запускаем логику при холодной загрузке
  setupLanguageSwitcher();

  // Перезапускаем при каждом SPA-переходе Quartz
  document.addEventListener("nav", () => {
    setupLanguageSwitcher();
  });
})();

// Внедряем ваш оригинальный скрипт фильтрации из файла explorerLangFilter.inline.ts
${explorerLangFilterScript}
`

const Constructor = (() => LanguageSwitcher) satisfies QuartzComponentConstructor
export default Constructor
