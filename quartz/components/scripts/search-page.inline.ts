declare const fetchData: Promise<Record<string, any>>

const searchPageStyles = `
.search-page-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5em 1em;
  font-family: inherit;
  font-size: 1.1em;
  color: var(--dark);
  background: var(--light);
  border: 1px solid var(--lightgray);
  margin-bottom: 2em;
}
.search-page-input:focus {
  outline: none;
}
.search-page-results {
  list-style: none;
  margin: 0;
  padding: 0;
}
.search-page-results li {
  margin-bottom: 1em;
}
.search-page-results a {
  display: block;
  padding: 1em;
  background: var(--light);
  border: 1px solid var(--lightgray);
}
.search-page-results a:hover {
  background: var(--lightgray);
}
.search-page-results a h3 {
  margin: 0 0 0.25em;
}
.search-page-results a p {
  margin: 0;
  color: var(--gray);
  font-size: 0.9em;
}
.search-page-results a .search-snippet {
  margin-top: 0.5em;
  line-height: 1.4;
  color: var(--darkgray);
}
.search-page-none {
  color: var(--gray);
  text-align: center;
  padding: 2em;
}
.highlight {
  background: color-mix(in srgb, var(--tertiary) 60%, rgba(255, 255, 255, 0));
}
`

async function setupSearchPage() {
  const input = document.getElementById("search-input") as HTMLInputElement | null
  const results = document.getElementById("search-results")
  if (!input || !results) return

  // inject search page styles only once
  if (!document.getElementById("search-page-styles")) {
    const style = document.createElement("style")
    style.id = "search-page-styles"
    style.textContent = searchPageStyles
    document.head.appendChild(style)
  }

  const index = await fetchData

  const contextWords = 40

  function highlight(text: string, term: string) {
    if (!text) return ""
    const re = new RegExp("(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi")
    return text.replace(re, '<span class="highlight">$1</span>')
  }

  function extractSnippet(text: string, term: string): string {
    const lower = text.toLowerCase()
    const idx = lower.indexOf(term.toLowerCase())
    if (idx === -1) return ""

    const words = text.slice(idx).split(/\s+/).slice(0, contextWords)
    const before = text.slice(0, idx).split(/\s+/)
    const beforeWords = before.slice(Math.max(before.length - 10, 0))

    const snippet = [...beforeWords, ...words].join(" ")
    const prefix = before.length > beforeWords.length ? "..." : ""
    const suffix = words.length >= contextWords ? "..." : ""

    return prefix + highlight(snippet, term) + suffix
  }

  function doSearch(query: string) {
    if (!query.trim()) {
      results.innerHTML = ""
      return
    }
    const q = query.toLowerCase().trim()
    const matches = Object.entries(index)
      .filter(([slug, data]: [string, any]) => {
        return (
          data.title.toLowerCase().includes(q) ||
          (data.tags && data.tags.some((t: string) => t.toLowerCase().includes(q))) ||
          data.content.toLowerCase().includes(q)
        )
      })
      .slice(0, 50)

    if (matches.length === 0) {
      results.innerHTML = '<p class="search-page-none">No results.</p>'
      return
    }

    results.innerHTML =
      '<ul class="search-page-results">' +
      matches
        .map(([slug, data]: [string, any]) => {
          const snippet = extractSnippet(data.content, q)
          return `<li><a href="/${slug}"><h3>${highlight(data.title, q)}</h3>${snippet ? `<p class="search-snippet">${snippet}</p>` : ""}</a></li>`
        })
        .join("") +
      "</ul>"
  }

  input.addEventListener("input", () => doSearch(input.value))
  input.focus()
}

document.addEventListener("nav", setupSearchPage)
setupSearchPage()
