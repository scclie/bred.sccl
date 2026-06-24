import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import explorerStyle from "./styles/explorer.scss"
// @ts-ignore
import calloutScript from "./scripts/callout.inline"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import { FileTrieNode } from "../util/fileTrie"
import { FullSlug, resolveRelative } from "../util/path"
import { trieFromAllFiles } from "../util/ctx"
import { h, JSX } from "preact"

const LANGS = ["ru", "en"]

interface SlimExplorerOptions {
  title?: string
  folderDefaultState?: "collapsed" | "open"
  useSavedState?: boolean
  filterFn?: (node: FileTrieNode) => boolean
  sortFn?: (a: FileTrieNode, b: FileTrieNode) => number
  order?: ("filter" | "map" | "sort")[]
}

const defaultOptions: SlimExplorerOptions = {
  folderDefaultState: "open",
  useSavedState: true,
  sortFn: (a, b) => {
    if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    }
    return a.isFolder ? -1 : 1
  },
  filterFn: (node) => node.slugSegment !== "tags",
  order: ["filter", "sort"],
}

function applyNodeOrder(
  node: FileTrieNode,
  order: ("filter" | "map" | "sort")[],
  opts: SlimExplorerOptions,
) {
  for (const fn of order) {
    switch (fn) {
      case "filter":
        if (opts.filterFn) node.filter(opts.filterFn)
        break
      case "map":
        break
      case "sort":
        if (opts.sortFn) node.sort(opts.sortFn)
        break
    }
  }
}

function getCurrentLang(slug: string): string | null {
  const parts = slug.split("/")
  return LANGS.includes(parts[0]) ? parts[0] : null
}

function findLangTree(trie: FileTrieNode, lang: string): FileTrieNode[] | null {
  const langNode = trie.children.find((c) => c.isFolder && c.slugSegment === lang)
  if (!langNode) return null
  return langNode.children
}

function renderFile(
  node: FileTrieNode,
  currentSlug: FullSlug,
): JSX.Element {
  const href = resolveRelative(currentSlug, node.slug as FullSlug)
  const active = currentSlug === node.slug
  return (
    <li>
      <a href={href} class={active ? "active" : undefined} data-for={node.slug}>
        {node.displayName}
      </a>
    </li>
  )
}

function renderTree(
  nodes: FileTrieNode[],
  currentSlug: FullSlug,
  depth: number,
  defaultOpen: boolean,
): JSX.Element[] {
  return nodes.map((node) => {
    if (!node.isFolder) {
      return renderFile(node, currentSlug)
    }

    if (depth === 0) {
      return (
        <li class="section-header">
          <span class="section-header-text">{node.displayName}</span>
          <ul>
            {renderTree(node.children, currentSlug, 1, defaultOpen)}
          </ul>
        </li>
      )
    }

    const folderPath = node.slug
    const isAncestor = currentSlug.startsWith(folderPath)
    const initialState = defaultOpen || isAncestor

    return (
      <li class="folder-node">
        <div class="folder-container" data-folderpath={folderPath}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="5 8 14 8"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="folder-icon"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span class="folder-title">{node.displayName}</span>
        </div>
        <div class={"folder-outer".concat(initialState ? " open" : "")}>
          <ul class="content">
            {renderTree(node.children, currentSlug, depth + 1, defaultOpen)}
          </ul>
        </div>
      </li>
    )
  })
}

let numExplorers = 0
export default ((userOpts?: Partial<SlimExplorerOptions>) => {
  const opts: SlimExplorerOptions = { ...defaultOptions, ...userOpts }

  const SlimExplorer: QuartzComponent = ({
    cfg,
    displayClass,
    fileData,
    allFiles,
  }: QuartzComponentProps) => {
    const id = `explorer-${numExplorers++}`
    const slug = fileData.slug ?? ""
    const currentLang = getCurrentLang(slug)

    const trie = trieFromAllFiles(allFiles)
    applyNodeOrder(trie, opts.order ?? ["filter", "sort"], opts)

    let treeNodes: FileTrieNode[]

    if (currentLang) {
      const langChildren = findLangTree(trie, currentLang)
      treeNodes = langChildren ?? trie.children
    } else {
      treeNodes = []
    }

    const renderLangGroup = (lang: string, defaultOpen: boolean) => {
      const children = findLangTree(trie, lang)
      if (!children) return null
      return (
        <li class="lang-group" data-lang={lang}>
          <ul>
            {renderTree(children, slug as FullSlug, 0, defaultOpen)}
          </ul>
        </li>
      )
    }

    return (
      <div
        class={classNames(displayClass, "explorer")}
        data-collapsed={opts.folderDefaultState}
        data-savestate={opts.useSavedState}
      >
        <button
          type="button"
          class="explorer-toggle mobile-explorer hide-until-loaded"
          data-mobile={true}
          aria-controls={id}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide-menu"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
        <button
          type="button"
          class="title-button explorer-toggle desktop-explorer"
          data-mobile={false}
          aria-expanded={true}
        >
          <h2>
            {opts.title ?? i18n(cfg.locale).components.explorer.title}
          </h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="5 8 14 8"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="fold"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <div id={id} class="explorer-content" aria-expanded={false} role="group">
          <ul class="explorer-ul">
            {currentLang
              ? renderTree(treeNodes, slug as FullSlug, 0, opts.folderDefaultState === "open")
              : LANGS.map((lang) => renderLangGroup(lang, opts.folderDefaultState === "open"))
            }
          </ul>
        </div>
      </div>
    )
  }

  SlimExplorer.css = [explorerStyle, `
.explorer .section-header {
  margin-top: 1.2rem;
}
.explorer .section-header:first-child {
  margin-top: 0.2rem;
}
.explorer .section-header > .section-header-text {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  pointer-events: none;
}
:root[saved-theme="dark"] .explorer .section-header > .section-header-text {
  color: #EBCB8B;
}
:root[saved-theme="light"] .explorer .section-header > .section-header-text {
  color: #D08770;
}
.explorer .section-header > ul {
  padding-left: 0.5rem;
  margin-top: 0.25rem;
  list-style: none;
}
.explorer .section-header > ul > li > .folder-container {
  border-left: none;
  padding-left: 0;
  margin-left: 0;
}
`]

  SlimExplorer.afterDOMLoaded = calloutScript + `
(function() {
  var STORAGE_KEY = "fileTree";
  var LANGS = ["ru", "en"];

  function getCurrentLang() {
    var parts = window.location.pathname.replace(/^\\//, "").split("/");
    if (LANGS.indexOf(parts[0]) !== -1) return parts[0];
    var saved = localStorage.getItem("preferred-lang");
    return (saved && LANGS.indexOf(saved) !== -1) ? saved : "ru";
  }

  function loadStates() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch(e) { return []; }
  }

  function saveStates(states) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  }

  function toggleFolder(evt) {
    var target = evt.target;
    var container = target.closest(".folder-container");
    if (!container) return;
    var outer = container.nextElementSibling;
    if (!outer || !outer.classList.contains("folder-outer")) return;

    outer.classList.toggle("open");
    var collapsed = !outer.classList.contains("open");

    var folderPath = container.dataset.folderpath;
    if (!folderPath) return;
    var states = loadStates();
    var found = false;
    for (var i = 0; i < states.length; i++) {
      if (states[i].path === folderPath) {
        states[i].collapsed = collapsed;
        found = true;
        break;
      }
    }
    if (!found) {
      states.push({ path: folderPath, collapsed: collapsed });
    }
    saveStates(states);
  }

  function applySavedState() {
    var states = loadStates();
    var containers = document.querySelectorAll(".folder-container[data-folderpath]");
    for (var i = 0; i < containers.length; i++) {
      var path = containers[i].dataset.folderpath;
      for (var j = 0; j < states.length; j++) {
        if (states[j].path === path && states[j].collapsed) {
          var outer = containers[i].nextElementSibling;
          if (outer && outer.classList.contains("folder-outer")) {
            outer.classList.remove("open");
          }
          break;
        }
      }
    }
  }

  function filterLanguage() {
    var lang = getCurrentLang();
    document.documentElement.setAttribute("data-lang", lang);
    var groups = document.querySelectorAll(".lang-group");
    for (var i = 0; i < groups.length; i++) {
      var gl = groups[i].getAttribute("data-lang");
      groups[i].style.display = gl === lang ? "" : "none";
    }
  }

  function setupEvents() {
    var containers = document.querySelectorAll(".folder-container");
    for (var i = 0; i < containers.length; i++) {
      containers[i].removeEventListener("click", toggleFolder);
      containers[i].addEventListener("click", toggleFolder);
    }
    var toggles = document.querySelectorAll(".explorer-toggle");
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].removeEventListener("click", toggleExplorer);
      toggles[i].addEventListener("click", toggleExplorer);
    }
  }

  function toggleExplorer() {
    var explorer = this.closest(".explorer");
    if (!explorer) return;
    explorer.classList.toggle("collapsed");
    var expanded = explorer.getAttribute("aria-expanded") === "true" ? "false" : "true";
    explorer.setAttribute("aria-expanded", expanded);
    if (expanded === "true") {
      document.documentElement.classList.add("mobile-no-scroll");
    } else {
      document.documentElement.classList.remove("mobile-no-scroll");
    }
  }

  applySavedState();
  filterLanguage();
  setupEvents();

  document.addEventListener("nav", function() {
    applySavedState();
    filterLanguage();
    setupEvents();
  });

  window.addEventListener("resize", function() {
    var explorer = document.querySelector(".explorer");
    if (explorer && !explorer.classList.contains("collapsed")) {
      document.documentElement.classList.add("mobile-no-scroll");
      return;
    }
  });

  document.addEventListener("prenav", function() {
    var explorer = document.querySelector(".explorer-ul");
    if (!explorer) return;
    sessionStorage.setItem("explorerScrollTop", explorer.scrollTop.toString());
  });
})();
`

  return SlimExplorer
}) satisfies QuartzComponentConstructor
