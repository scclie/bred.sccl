import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const TranslationNotice: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const fm = fileData.frontmatter as Record<string, unknown> | undefined

  // Проверяем флаг автоперевода в Frontmatter статьи
  const isAutoTranslated = fm?.autoTranslated === true || fm?.autoTranslated === "true"

  // Если статья написана вручную, компонент ничего не рендерит
  if (!isAutoTranslated) return null

  // Определяем язык текущей страницы, чтобы перевести саму плашку
  const slug = fileData.slug ?? ""
  const isEn = slug.startsWith("en/")

  const message = isEn
    ? "🤖 This page was automatically translated and may contain inaccuracies."
    : "🤖 Эта страница была переведена автоматически и может содержать неточности."

  return (
    <div
      class={classNames(displayClass, "translation-notice")}
      style="
        background-color: var(--lightgray);
        padding: 0.75rem 1rem;
        border-left: 4px solid var(--secondary);
        border-radius: 4px;
        margin-top: 1.0rem;
        margin-bottom: 1.0rem;
        font-size: 0.9rem;
        color: var(--dark);
      "
    >
      {message}
    </div>
  )
}

export default (() => TranslationNotice) satisfies QuartzComponentConstructor
