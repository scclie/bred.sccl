function initRandomNote() {
  document.querySelectorAll(".random-note-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const data = btn.getAttribute("data-slugs")
      if (!data) return
      const slugs = JSON.parse(data)
      if (slugs.length === 0) return
      window.location.href = slugs[Math.floor(Math.random() * slugs.length)]
    })
  })
}

function initNavButtons() {
  document.querySelectorAll(".recent-prev-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slugs = JSON.parse(btn.getAttribute("data-slugs") || "[]")
      const current = btn.getAttribute("data-current") || ""
      const idx = slugs.indexOf(current)
      if (idx > 0) window.location.href = slugs[idx - 1]
      else if (slugs.length > 0) window.location.href = slugs[slugs.length - 1]
    })
  })

  document.querySelectorAll(".recent-next-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slugs = JSON.parse(btn.getAttribute("data-slugs") || "[]")
      const current = btn.getAttribute("data-current") || ""
      const idx = slugs.indexOf(current)
      if (idx >= 0 && idx < slugs.length - 1) window.location.href = slugs[idx + 1]
      else if (slugs.length > 0) window.location.href = slugs[0]
    })
  })
}

function getPreferredLang() {
  const STORAGE_KEY = "preferred-lang"
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && (saved === "ru" || saved === "en")) return saved
  const parts = window.location.pathname.replace(/^\//, "").split("/")
  if (parts[0] === "ru" || parts[0] === "en") return parts[0]
  return "ru"
}

function initRecentLangFilter() {
  const lang = getPreferredLang()

  document.querySelectorAll(".recent-ul > .recent-li[data-lang]").forEach((li) => {
    const itemLang = li.getAttribute("data-lang")
    ;(li as HTMLElement).style.display = itemLang === lang ? "" : "none"
  })
}

initRandomNote()
initNavButtons()
initRecentLangFilter()
document.addEventListener("nav", () => {
  initRandomNote()
  initNavButtons()
  initRecentLangFilter()
})
