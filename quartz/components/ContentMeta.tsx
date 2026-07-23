import { Date as DateComponent, formatDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"

interface ContentMetaOptions {
  showComma: boolean
}

const defaultOptions: ContentMetaOptions = {
  showComma: true,
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const segments: (string | JSX.Element)[] = []

    // Show created date
    const created = fileData.dates?.created
    if (created && !isNaN(created.getTime())) {
      segments.push(<DateComponent date={created} locale={cfg.locale} />)
    }

    // Show lastmod from frontmatter (manually set by author, NOT from git)
    const lastmod = fileData.frontmatter?.modified
    if (lastmod && typeof lastmod === "string") {
      const modDate = new globalThis.Date(lastmod)
      if (!isNaN(modDate.getTime())) {
        // Don't show "updated" if same day as created
        const sameDay =
          created &&
          !isNaN(created.getTime()) &&
          created.getFullYear() === modDate.getFullYear() &&
          created.getMonth() === modDate.getMonth() &&
          created.getDate() === modDate.getDate()

        if (!sameDay) {
          segments.push(
            <span>
              {"updated "}
              <DateComponent date={modDate} locale={cfg.locale} />
            </span>,
          )
        }
      }
    }

    if (segments.length === 0) {
      return null
    }

    return (
      <p show-comma={options.showComma} class={classNames(displayClass, "content-meta")}>
        {segments}
      </p>
    )
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor
