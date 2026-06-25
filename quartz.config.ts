import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "> scclie://\nnotes",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "shiza.sccl.cc",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "local",
      cdnCaching: true,
      typography: {
        header: "Martian Mono",
        body: "Cascadia Mono",
        code: "Cascadia Code",
      },
      colors: {
        lightMode: {
          light: "#ECEFF4", // Nord6 - основной фон
          lightgray: "#E5E9F0", // Nord5
          gray: "#D8DEE9", // Nord4
          darkgray: "#4C566A", // Nord3
          dark: "#2E3440", // Nord0
          secondary: "#5E81AC", // Nord10
          tertiary: "#88C0D0", // Nord8
          highlight: "rgba(129, 161, 193, 0.15)", // Nord9
          textHighlight: "#EBCB8B88", // Nord13
        },
        darkMode: {
          light: "#2E3440", // Nord0 - Самый темный фон
          lightgray: "#3B4252", // Nord1 - Более светлый фон
          gray: "#434C5E", // Nord2 - Еще светлее, для элементов UI
          darkgray: "#D8DEE9", // Nord4 - Текст на темном фоне
          dark: "#E5E9F0", // Nord5 - Яркий текст/акценты
          secondary: "#81A1C1", // Nord9 - Синий (акцент)
          tertiary: "#88C0D0", // Nord8 - Голубой (акцент)
          highlight: "rgba(76, 86, 106, 0.3)", // Nord3 с прозрачностью - подсветка
          textHighlight: "#A3BE8C88", // Nord14 с прозрачностью - подсветка текста (зеленый)
        },
      },
    },
  },
  plugins: {
    transformers: [
      {
        name: "DiscordSmallText",
        textTransform: (ctx, text) => {
          return text.replace(/^-\s*#\s*(.+)$/gm, "<small>$1</small><br>")
        },
      },
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      //Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.RecentsPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages({
        cfg: {
          font: "Cascadia Mono",
          imageWidth: 1200,
          imageHeight: 630,
          fonts: [
            {
              name: "Cascadia Mono",
              style: "normal",
              weight: 700,
              path: "./quartz/static/fonts/Cascadia Mono.ttf", // Указываем точное имя файла
            },
          ],
        },
      }),
    ],
  },
}

export default config
