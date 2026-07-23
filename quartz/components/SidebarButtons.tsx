import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
// @ts-ignore
import darkmodeScript from "./scripts/darkmode.inline"
// @ts-ignore
import searchPageScript from "./scripts/search-page.inline"

const SidebarButtons: QuartzComponent = (props: QuartzComponentProps) => {
  return (
    <div class={classNames(props.displayClass, "sidebar-buttons")}>
      <a href="/explorer" class="explorer-link">
        [explorer]
      </a>
      <div class="search">
        <a href="/search">[search]</a>
      </div>
      <button class="darkmode">[theme]</button>
      <a href="/recents" class="recents-link">
        [recents]
      </a>
    </div>
  )
}

SidebarButtons.beforeDOMLoaded = darkmodeScript
SidebarButtons.afterDOMLoaded = searchPageScript

SidebarButtons.css = `
.sidebar-buttons {
  text-align: center;
  padding: 0.5rem 0;
  font-weight: 600;
  white-space: nowrap;
}
.sidebar-buttons .search {
  display: inline;
  margin-right: 1rem;
}
.sidebar-buttons .explorer-link {
  margin-right: 1rem;
}
.sidebar-buttons .search a,
.sidebar-buttons .explorer-link {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.sidebar-buttons .darkmode {
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  color: var(--secondary);
  text-underline-offset: 3px;
  background: none;
  border: none;
  padding: 0;
  font-weight: 600;
  text-decoration: underline;
}
.sidebar-buttons .darkmode:hover {
  color: var(--tertiary);
}
.sidebar-buttons .recents-link {
  display: none;
}
@media all and (max-width: 800px) {
  .sidebar-buttons {
    white-space: normal;
  }
  .sidebar-buttons .recents-link {
    display: inline;
    margin-left: 1rem;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}
`

export default (() => SidebarButtons) satisfies QuartzComponentConstructor
