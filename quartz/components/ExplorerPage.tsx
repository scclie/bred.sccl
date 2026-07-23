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

// Merge children from multiple language folders into one merged folder
function mergeLangFolders(
  folders: FileTrieNode[],
): FileTrieNode[] {
  const merged = new Map<string, FileTrieNode>()

  for (const folder of folders) {
    for (const child of folder.children) {
      const key = child.slugSegment
      if (merged.has(key)) {
        // Merge children into existing folder
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
  }

  return Array.from(merged.values()).sort((a, b) =>
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

    // Merge content folders across languages
    const mergedFolders = mergeLangFolders(langFolders)

    return (
      <div class={classNames(displayClass, "explorer-page")}>
        <ul class="explorer-page-tree">
          {mergedFolders.map((folder) => renderNode(folder, currentSlug))}
        </ul>
      </div>
    )
  }

  ExplorerPage.css = style
  ExplorerPage.afterDOMLoaded = script
  return ExplorerPage
}) satisfies QuartzComponentConstructor
