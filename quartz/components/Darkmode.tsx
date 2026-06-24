// @ts-ignore
import darkmodeScript from "./scripts/darkmode.inline"
import styles from "./styles/darkmode.scss"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

const Darkmode: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
  return (
    <button class={classNames(displayClass, "darkmode")}>
      <span class="dayIcon" style="position:absolute;width:20px;height:20px;top:calc(50% - 10px);font-size:18px;line-height:20px;text-align:center;color:var(--darkgray);transition:opacity 0.1s ease" aria-label={i18n(cfg.locale).components.themeToggle.darkMode}>☀</span>
      <span class="nightIcon" style="position:absolute;width:20px;height:20px;top:calc(50% - 10px);font-size:18px;line-height:20px;text-align:center;color:var(--darkgray);transition:opacity 0.1s ease" aria-label={i18n(cfg.locale).components.themeToggle.lightMode}>☾</span>
    </button>
  )
}

Darkmode.beforeDOMLoaded = darkmodeScript
Darkmode.css = styles

export default (() => Darkmode) satisfies QuartzComponentConstructor
