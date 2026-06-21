import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.Comments({
      provider: "giscus",
      options: {
        repo: "scclie/shiza-comments",
        repoId: "R_kgDOTBPD2g",
        category: "General",
        categoryId: "DIC_kwDOTBPD2s4C_nyY",
        mapping: "pathname",
        strict: false,
        reactionsEnabled: true,
        inputPosition: "bottom",
        lightTheme: "custom",
        darkTheme: "custom",
        themeUrl: "https://shiza.sccl.cc/gisco",
        lang: "en",
      },
    }),
  ],
  footer: Component.Footer({
    links: {
      Contacts: "https://sccl.cc",
      GitHub: "https://github.com",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.LanguageSwitcher(),
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => {
        const slug = page.fileData.slug ?? ""
        return slug !== "index" && slug !== "ru/index" && slug !== "en/index"
      },
    }),
    Component.ArticleTitle(),
    Component.TranslationNotice(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
      ],
    }),
    Component.Explorer({
      title: "Explorer",
      folderClickBehavior: "toggle",
      folderDefaultState: "open",
      useSavedState: true,
      useCompactFolders: true,
      filterFn: (node) => {
        if (node.name === "templates" || node.name === "private") return false
        return true
      },
    }),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.RecentNotes({
      title: "Recents",
      limit: 10,
      showTags: false,
      linkToMore: "tags/",
    }),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.LanguageSwitcher(),
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
