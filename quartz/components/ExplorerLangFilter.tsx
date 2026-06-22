/**
 * ExplorerLangFilter.tsx
 *
 * Делает папки ru/ и en/ "прозрачными":
 * - Скрывает li папки текущего языка
 * - Вытаскивает её дочерние li наверх (как будто папки нет)
 * - Полностью скрывает li папки другого языка
 */
import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ExplorerLangFilter: QuartzComponent = () => null as any

ExplorerLangFilter.afterDOMLoaded = `
(function() {
  const LANGS = ["ru", "en"];

  function getCurrentLang() {
    const parts = window.location.pathname.replace(/^\\//, "").split("/");
    if (LANGS.includes(parts[0])) return parts[0];
    const saved = localStorage.getItem("preferred-lang");
    return (saved && LANGS.includes(saved)) ? saved : "ru";
  }

  function promoteLanguageFolder() {
    const lang = getCurrentLang();
    localStorage.setItem("preferred-lang", lang);
    document.documentElement.setAttribute("data-lang", lang);

    const explorerUl = document.querySelector(".explorer-content ul.explorer-ul");
    if (!explorerUl) return false;

    const topItems = Array.from(explorerUl.querySelectorAll(":scope > li"));
    if (topItems.length === 0) return false;

    let promoted = false;

    topItems.forEach(function(li) {
      const folderTitle = li.querySelector(".folder-title");
      if (!folderTitle) return; // файл, не папка

      const name = (folderTitle.textContent || "").trim().toLowerCase();

      if (!LANGS.includes(name)) return; // не языковая папка

      if (name !== lang) {
        // Другой язык — просто скрываем полностью
        li.style.display = "none";
        return;
      }

      // Текущий язык — поднимаем дочерние элементы на верхний уровень
      // Дочерние li находятся в .folder-outer > ul.content
      const childUl = li.querySelector(".folder-outer > ul.content");
      if (!childUl) {
        // Папка ещё не раскрыта — раскрываем программно
        const folderBtn = li.querySelector("button.folder-button");
        if (folderBtn) {
          folderBtn.click();
          // После клика подождём и попробуем снова
          return;
        }
        li.style.display = "none";
        return;
      }

      const children = Array.from(childUl.querySelectorAll(":scope > li"));
      if (children.length === 0) {
        li.style.display = "none";
        return;
      }

      // Вставляем детей перед текущим li
      children.forEach(function(child) {
        explorerUl.insertBefore(child, li);
      });

      // Скрываем теперь пустую языковую папку
      li.style.display = "none";
      promoted = true;
    });

    return promoted;
  }

  // Запускаем с повторами — Explorer строится асинхронно
  var attempts = 0;
  var maxAttempts = 10;

  function tryPromote() {
    var result = promoteLanguageFolder();
    attempts++;
    if (!result && attempts < maxAttempts) {
      setTimeout(tryPromote, 200);
    }
  }

  tryPromote();

  // При SPA-навигации
  document.addEventListener("nav", function() {
    attempts = 0;
    setTimeout(tryPromote, 50);
  });

  window.addEventListener("popstate", function() {
    attempts = 0;
    tryPromote();
  });
})();
`

export default (() => ExplorerLangFilter) satisfies QuartzComponentConstructor
