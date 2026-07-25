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
  footer: Component.Footer(),
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
        return slug !== "index" && slug !== "ru/index" && slug !== "en/index" && slug !== "explorer"
      },
    }),
    Component.TitleBar(),
    Component.ContentMeta(),
    Component.TranslationNotice(),
    Component.TagList(),
    Component.ConditionalRender({
      component: Component.ExplorerPage(),
      condition: (page) => {
        const slug = page.fileData.slug ?? ""
        return slug === "explorer"
      },
    }),
    Component.ConditionalRender({
      component: Component.RecentsContent(),
      condition: (page) => {
        const slug = page.fileData.slug ?? ""
        return slug === "recents" || slug === "en/recents" || slug === "ru/recents"
      },
    }),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.SidebarButtons(),
    Component.RecentNotes({
      title: "Recents",
      limit: 8,
      showTags: false,
      linkToMore: "recents/",
    }),
  ],
  right: [Component.DesktopOnly(Component.TableOfContents())],
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
    Component.TitleBar(),
    Component.ContentMeta(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.SidebarButtons(),
    Component.RecentNotes({
      title: "Recents",
      limit: 8,
      showTags: false,
      linkToMore: "recents/",
    }),
    // Component.SlimExplorer({
    //   title: "",
    //   filterFn: (node) => {
    //     if (node.slugSegment === "templates" || node.slugSegment === "private" || node.slugSegment === "tags") {
    //       return false
    //     }
    //     return true
    //   },
    // }),
  ],
  right: [],
}
