/**
 * explorerLangFilter.inline.ts
 *
 * Инлайн-скрипт для Explorer: скрывает папку ru/ или en/
 * в зависимости от текущего языка страницы.
 *
 * Подключается через afterDOMLoaded в quartz.layout.ts как отдельный
 * компонент-заглушка, либо добавляется в LanguageSwitcher.afterDOMLoaded.
 *
 * КАК РАБОТАЕТ:
 *  1. Читает data-lang с <html> (устанавливается LanguageSwitcher)
 *  2. Ищет в Explorer ссылки/кнопки, чей путь начинается с /ru/ или /en/
 *  3. Скрывает папку противоположного языка
 *  4. Слушает popstate (SPA-навигация Quartz) и обновляет фильтр
 */

export const explorerLangFilterScript = `
(function() {
  const LANGS = ["ru", "en"];

  function getCurrentLang() {
    // Сначала смотрим на атрибут html (выставляется LanguageSwitcher)
    const fromHtml = document.documentElement.getAttribute("data-lang");
    if (fromHtml && LANGS.includes(fromHtml)) return fromHtml;

    // Фолбэк — URL
    const parts = window.location.pathname.replace(/^\\//, "").split("/");
    return LANGS.includes(parts[0]) ? parts[0] : null;
  }

  function filterExplorer() {
    const lang = getCurrentLang();
    if (!lang) return;

    const hideLang = lang === "ru" ? "en" : "ru";

    // Explorer рендерит дерево через <ul> с li > a или li > button
    // Ищем корневые li, соответствующие папкам ru/ и en/
    const explorerList = document.querySelector(".explorer-content > ul, #explorer ul");
    if (!explorerList) return;

    // Quartz строит ссылки вида href="/ru/..." или data-slug="ru/..."
    // Проходим по всем <li> первого уровня
    const topItems = explorerList.querySelectorAll(":scope > li");
    topItems.forEach((li) => {
      const anchor = li.querySelector("a");
      const button = li.querySelector("button.folder-button");

      // Определяем slug папки
      let slug = "";
      if (anchor) {
        slug = (anchor.getAttribute("href") || "").replace(/^\\//, "").split("/")[0];
      } else if (button) {
        // Quartz хранит slug в data-атрибутах или в тексте кнопки
        slug = (
          button.getAttribute("data-slug") ||
          button.getAttribute("data-path") ||
          button.textContent ||
          ""
        ).trim().toLowerCase();
      }

      if (slug === hideLang) {
        (li as HTMLElement).style.display = "none";
      } else if (LANGS.includes(slug)) {
        (li as HTMLElement).style.display = "";
      }
    });
  }

  // Запускаем сразу и после каждой SPA-навигации
  filterExplorer();

  // Quartz эмитит событие 'nav' при SPA-переходах
  document.addEventListener("nav", () => {
    // data-lang обновится LanguageSwitcher, ждём микро-тик
    setTimeout(filterExplorer, 0);
  });

  // Фолбэк для popstate
  window.addEventListener("popstate", filterExplorer);
})();
`
