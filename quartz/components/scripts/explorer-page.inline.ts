// Folder toggle
document.querySelectorAll(".explorer-page-folder-toggle").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const li = btn.closest(".explorer-page-folder") as HTMLElement
    const children = li.querySelector(".explorer-page-children") as HTMLElement
    const arrow = btn.querySelector(".explorer-page-arrow") as HTMLElement

    if (!li || !children) return

    const isOpen = li.getAttribute("data-collapsed") === "false"

    if (isOpen) {
      children.style.display = "none"
      li.setAttribute("data-collapsed", "true")
      if (arrow) arrow.textContent = "\u25B8"
    } else {
      children.style.display = ""
      li.setAttribute("data-collapsed", "false")
      if (arrow) arrow.textContent = "\u25BE"
    }
  })
})

// Explorer language filter
const STORAGE_KEY = "explorer-lang"
let currentLang = localStorage.getItem(STORAGE_KEY) || "ru"

function getOtherLang(lang: string) {
  return lang === "ru" ? "en" : "ru"
}

function updateToggleUI(lang: string) {
  const other = getOtherLang(lang)
  const label = document.getElementById("explorer-lang-current")
  const link = document.getElementById("explorer-lang-switch")
  if (label) label.textContent = lang.toUpperCase()
  if (link) link.textContent = other.toUpperCase()
}

function filterByLang(lang: string) {
  const enTree = document.getElementById("explorer-tree-en")
  const ruTree = document.getElementById("explorer-tree-ru")
  if (enTree) enTree.style.display = lang === "en" ? "" : "none"
  if (ruTree) ruTree.style.display = lang === "ru" ? "" : "none"
}

function initExplorerLang() {
  updateToggleUI(currentLang)
  filterByLang(currentLang)

  const langBtn = document.getElementById("explorer-lang-switch")
  if (langBtn) {
    langBtn.addEventListener("click", (e) => {
      e.preventDefault()
      currentLang = getOtherLang(currentLang)
      localStorage.setItem(STORAGE_KEY, currentLang)
      updateToggleUI(currentLang)
      filterByLang(currentLang)
    })
  }
}

initExplorerLang()
document.addEventListener("nav", initExplorerLang)
