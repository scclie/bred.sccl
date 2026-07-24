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

initRandomNote()
document.addEventListener("nav", initRandomNote)
