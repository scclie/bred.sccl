import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

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
        mapping: "specific",
        strict: false,
        reactionsEnabled: true,
        inputPosition: "bottom",
        lightTheme: "light",
        darkTheme: "dark",
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

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs({
        spacerSymbol: "/",
        rootName: "index",
        resolveFrontmatterTitle: false,
        showCurrentPage: true,
      }),
      condition: (page) => {
        const slug = page.fileData.slug ?? ""
        return slug !== "index" && slug !== "ru/index" && slug !== "en/index"
      },
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.LanguageSwitcher(),
    Component.TranslationNotice(),
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
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      title: "",
      folderClickBehavior: "toggle",
      folderDefaultState: "open",
      useSavedState: true,
      useCompactFolders: true,
      filterFn: (node) => {
        if (node.name === "templates" || node.name === "private" || node.slugSegment === "tags") {
          return false
        }
        return true
      },
    }),
    Component.ExplorerLangFilter(),
  ],
  right: [
    //Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
    Component.RecentNotes({
      title: "Recents",
      limit: 5,
      showTags: false,
      linkToMore: "tags/",
    }),
  ],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs({
        spacerSymbol: "/",
        rootName: "index",
        resolveFrontmatterTitle: false,
        showCurrentPage: false,
      }),
      condition: (page) => {
        const slug = page.fileData.slug ?? ""
        return slug !== "index" && slug !== "ru/index" && slug !== "en/index"
      },
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.LanguageSwitcher(),
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
    Component.Explorer({
      title: "",
      filterFn: (node) => {
        if (node.name === "templates" || node.name === "private" || node.slugSegment === "tags") {
          return false
        }
        return true
      },
    }),
    Component.ExplorerLangFilter(),
  ],
  right: [],
}
