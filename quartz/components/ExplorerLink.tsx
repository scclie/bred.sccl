import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const ExplorerLink: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "explorer-link")}>
      <a href="/explorer">[explorer]</a>
    </div>
  )
}

ExplorerLink.css = `
.explorer-link a {
  text-decoration: underline;
  text-underline-offset: 3px;
}
`

export default (() => ExplorerLink) satisfies QuartzComponentConstructor
