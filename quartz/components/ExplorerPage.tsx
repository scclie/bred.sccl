import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { trieFromAllFiles } from "../util/ctx"
import { FileTrieNode } from "../util/fileTrie"
import { classNames } from "../util/lang"
import style from "./styles/explorer-page.scss"
// @ts-ignore
import script from "./scripts/explorer-page.inline"

function renderNode(
  node: FileTrieNode,
  currentSlug: string,
  depth: number = 0,
): JSX.Element | null {
  if (node.isFolder) {
    const children = node.children
      .filter((child) => child.data !== null || child.isFolder)
      .sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1
        if (!a.isFolder && b.isFolder) return 1
        return a.displayName.localeCompare(b.displayName, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      })

    if (children.length === 0) return null

    const isOpen = true

    return (
      <li class="explorer-page-folder" data-collapsed={!isOpen}>
        <button class="explorer-page-folder-toggle" type="button">
          <span class="explorer-page-arrow">{isOpen ? "\u25BE" : "\u25B8"}</span>
          <a href={resolveRelative(currentSlug, node.slug)} class="internal">
            {node.displayName}
          </a>
        </button>
        <ul class="explorer-page-children" style={isOpen ? "" : "display: none"}>
          {children.map((child) => renderNode(child, currentSlug, depth + 1)).filter(Boolean)}
        </ul>
      </li>
    )
  }

  if (!node.data) return null

  return (
    <li class="explorer-page-file">
      <a href={resolveRelative(currentSlug, node.slug)} class="internal">
        {node.displayName}
      </a>
    </li>
  )
}

function sortTrieChildren(nodes: FileTrieNode[]): FileTrieNode[] {
  return nodes.sort((a, b) =>
    a.displayName.localeCompare(b.displayName, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  )
}

export default (() => {
  const ExplorerPage: QuartzComponent = ({
    cfg,
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    const trie = trieFromAllFiles(allFiles)
    const currentSlug = fileData.slug ?? ""

    // Get language folders (en, ru)
    const langFolders = trie.children.filter((node) => {
      const seg = node.slugSegment
      return (
        node.isFolder &&
        seg !== "tags" &&
        seg !== "templates" &&
        seg !== "private" &&
        seg !== "files" &&
        seg !== "pictures" &&
        seg !== "memes"
      )
    })

    const enFolders = sortTrieChildren(langFolders.filter((n) => n.slugSegment === "en"))
    const ruFolders = sortTrieChildren(langFolders.filter((n) => n.slugSegment === "ru"))

    // Collect all content folders from both languages for each
    const renderLangTree = (folders: FileTrieNode[]) => {
      const allChildren = folders.flatMap((f) => f.children)
      // Deduplicate by slugSegment, merge children
      const merged = new Map<string, FileTrieNode>()
      for (const child of allChildren) {
        const key = child.slugSegment
        if (merged.has(key)) {
          const existing = merged.get(key)!
          for (const grandChild of child.children) {
            if (!existing.children.some((c) => c.slugSegment === grandChild.slugSegment)) {
              existing.children.push(grandChild)
            }
          }
        } else {
          merged.set(key, child)
        }
      }
      return sortTrieChildren(Array.from(merged.values()))
    }

    const enTree = renderLangTree(enFolders)
    const ruTree = renderLangTree(ruFolders)

    return (
      <div class={classNames(displayClass, "explorer-page")}>
        <div class="explorer-lang-toggle">
          <span class="lang-current" id="explorer-lang-current">RU</span>
          <span class="lang-divider">|</span>
          <a href="javascript:void(0)" class="lang-other" id="explorer-lang-switch">EN</a>
        </div>
        <div id="explorer-tree-en" style="display: none">
          <ul class="explorer-page-tree">
            {enTree.map((folder) => renderNode(folder, currentSlug))}
          </ul>
        </div>
        <div id="explorer-tree-ru">
          <ul class="explorer-page-tree">
            {ruTree.map((folder) => renderNode(folder, currentSlug))}
          </ul>
        </div>
      </div>
    )
  }

  ExplorerPage.css = style
  ExplorerPage.afterDOMLoaded = script
  return ExplorerPage
}) satisfies QuartzComponentConstructor
