import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"

export default (() => {
  const Footer: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
    const slug = fileData.slug ?? ""
    const filename = slug.split("/").at(-1) ?? slug
    return (
      <footer class={`${displayClass ?? ""}`}>
        <span>{filename}.md</span>
        <div class="footer-center">
          <a href="/index.xml" target="_blank" class="zine-credit">
            rss
          </a>
          <a href="/index-full.xml" target="_blank" class="zine-credit">
            rss full
          </a>
          <a href="https://github.com/scclie/bred.sccl" target="_blank" class="zine-credit">
            source
          </a>
        </div>
        <a href="https://sccl.cc" target="_blank" class="symbol">
          sccl.cc
        </a>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
