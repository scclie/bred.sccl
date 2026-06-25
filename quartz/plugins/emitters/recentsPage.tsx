import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { defaultProcessedContent, QuartzPluginData } from "../vfile"
import { FullPageLayout } from "../../cfg"
import { FullSlug, joinSegments, pathToRoot } from "../../util/path"
import { defaultListPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { RecentsContent } from "../../components"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { StaticResources } from "../../util/resources"

async function processRecentsPage(
  ctx: BuildCtx,
  slug: FullSlug,
  allFiles: QuartzPluginData[],
  opts: FullPageLayout,
  resources: StaticResources,
) {
  const cfg = ctx.cfg.configuration
  const [tree, file] = defaultProcessedContent({
    slug,
    frontmatter: {
      title: "Recents",
      tags: [],
    },
  })

  const externalResources = pageResources(pathToRoot(slug), resources)
  const componentData: QuartzComponentProps = {
    ctx,
    fileData: file.data,
    externalResources,
    cfg,
    children: [],
    tree,
    allFiles,
  }

  const contentHtml = renderPage(cfg, slug, componentData, opts, externalResources)
  return write({ ctx, content: contentHtml, slug, ext: ".html" })
}

export const RecentsPage: QuartzEmitterPlugin = () => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    pageBody: RecentsContent(),
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "RecentsPage",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx, content, resources) {
      const allFiles = content.map((c) => c[1].data)
      const slugs: FullSlug[] = [
        joinSegments("recents", "index") as FullSlug,
        joinSegments("en", "recents", "index") as FullSlug,
        joinSegments("ru", "recents", "index") as FullSlug,
      ]

      for (const slug of slugs) {
        yield processRecentsPage(ctx, slug, allFiles, opts, resources)
      }
    },
    async *partialEmit(ctx, content, resources, _changeEvents) {
      yield* this.emit!(ctx, content, resources)
    },
  }
}
