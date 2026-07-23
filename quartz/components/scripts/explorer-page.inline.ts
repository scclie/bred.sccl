document.addEventListener("DOMContentLoaded", () => {
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
})
