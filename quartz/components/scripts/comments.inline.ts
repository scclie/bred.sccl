const changeTheme = (e: CustomEventMap["themechange"]) => {
  const theme = e.detail.theme
  const iframe = document.querySelector("iframe.giscus-frame") as HTMLIFrameElement
  if (!iframe) {
    return
  }

  if (!iframe.contentWindow) {
    return
  }

  iframe.contentWindow.postMessage(
    {
      giscus: {
        setConfig: {
          theme: getThemeUrl(getThemeName(theme)),
        },
      },
    },
    "https://giscus.app",
  )
}

const getThemeName = (theme: string) => {
  if (theme !== "dark" && theme !== "light") {
    return theme
  }
  const giscusContainer = document.querySelector(".giscus") as GiscusElement
  if (!giscusContainer) {
    return theme
  }
  const darkGiscus = giscusContainer.dataset.darkTheme ?? "dark"
  const lightGiscus = giscusContainer.dataset.lightTheme ?? "light"
  return theme === "dark" ? darkGiscus : lightGiscus
}

const getThemeUrl = (theme: string) => {
  const giscusContainer = document.querySelector(".giscus") as GiscusElement
  if (!giscusContainer) {
    return `https://giscus.app/themes/${theme}.css`
  }
  return `${giscusContainer.dataset.themeUrl ?? "https://giscus.app/themes"}/${theme}.css`
}

type GiscusElement = Omit<HTMLElement, "dataset"> & {
  dataset: DOMStringMap & {
    repo: `${string}/${string}`
    repoId: string
    category: string
    categoryId: string
    themeUrl: string
    lightTheme: string
    darkTheme: string
    mapping: "url" | "title" | "og:title" | "specific" | "number" | "pathname"
    strict: string
    reactionsEnabled: string
    inputPosition: "top" | "bottom"
    lang: string
  }
}

document.addEventListener("nav", () => {
  setTimeout(() => {
    const container = document.querySelector(".giscus") as HTMLElement | null
    if (!container) return

    // 💥 удаляем только старый iframe
    document.querySelectorAll("iframe.giscus-frame").forEach((el) => el.remove())

    // 💥 НЕ трогаем container

    // 💥 создаём script заново
    const script = document.createElement("script")
    script.src = "https://giscus.app/client.js"
    script.async = true
    script.crossOrigin = "anonymous"

    script.setAttribute("data-repo", container.dataset.repo!)
    script.setAttribute("data-repo-id", container.dataset.repoId!)
    script.setAttribute("data-category", container.dataset.category!)
    script.setAttribute("data-category-id", container.dataset.categoryId!)
    script.setAttribute("data-mapping", container.dataset.mapping!)
    script.setAttribute("data-term", container.dataset.term ?? "")
    script.setAttribute("data-reactions-enabled", container.dataset.reactionsEnabled!)
    script.setAttribute("data-input-position", container.dataset.inputPosition!)
    script.setAttribute("data-lang", container.dataset.lang!)

    const theme = document.documentElement.getAttribute("saved-theme")
    if (theme) {
      script.setAttribute("data-theme", getThemeUrl(getThemeName(theme)))
    }
    document.addEventListener("themechange", changeTheme)

    container.appendChild(script)
  }, 0)
})
