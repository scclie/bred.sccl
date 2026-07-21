---
title: "Quartz: Time to lose weight"
description: "Your Quartz static site ballooned to 50 KB per page? Breakdown of bloat sources: fonts, KaTeX, Mermaid, inline scripts, images, and the Explorer. How to slim it down and how much you can cut."
lang: en
autoTranslated: "true"
translationLock: "true"
tags:
- "#it"
- "#shitpost"
- "#web"
date: 2026-06-23
---

You're sitting there, tinkering with your [Quartz](https://github.com/jackyzha0/quartz) wiki.

Check `public/` - each HTML page is already 50-60 KB. Not to mention `index.css` bloated to 40 KB.

Quartz itself isn't that fat out of the box.

But in the process of "improving" it piles up:

```text
Fonts:                ~2.5 MB
JS + CSS:             ~150 KB
HTML:                 ~1.6 MB
```

Hello, [motherfuckingwebsite.com](https://motherfuckingwebsite.com/)!

With this setup I won't make it into [14kbclub.com](https://14kbclub.com/).

*not that I wanted to, but at least I can try to get closer*

---

# What to do?

## Fonts - fat you're better off without

Custom fonts are always extra weight. Every `@font-face` is a request, rendering blocks until the font loads, and the user gets `FOUT` or `FOIT`.

Best solution - **don't use custom fonts at all**. System fonts (`system-ui, sans-serif`) are already on the device, nothing to download.

If you really want them - fonts should live only in `@font-face` via `fontOrigin: "local"`, no Google Fonts duplication.

---

## Inline scripts

Quartz shoves inline scripts straight into every page's HTML:

```html
<script>/* callout collapse - 8 KB */</script>
<script>/* contentIndex fetch */</script>
```

On one hand, inline isn't bad: if the script is tiny, it rides in the first TCP packet (1460 bytes) and doesn't block rendering.

But when these scripts pile up to tens of KB on every page - it's all duplicated, **not cached**, and the browser re-parses the same thing on every navigation.

Quartz bundles all `afterDOMLoaded` hooks from components into `postscript.js`, which **does get cached**. Callout didn't make it there - it was added via `externalResources()` from the `ObsidianFlavoredMarkdown` plugin as inline.

Fix - stitch the scripts into `afterDOMLoaded` of any component so they end up in `postscript.js`.

---

## Mermaid

[Mermaid](https://mermaid.js.org/) - a diagram library. The CDN version weighs **2.3 MB**, the loader script is 4.7 KB, CSS is another 9 KB.

Problem: Quartz adds them to EVERY page by default. Even if you don't have a single diagram.

It just. Sits there. Dead weight.

-# just there, but why?

Solution - check for mermaid blocks at build time and add only where needed:

```ts
if (opts.mermaid) {
  plugins.push(() => {
    return (tree, file) => {
      visit(tree, "element", (node) => {
        if (...) file.data.hasMermaid = true
      })
    }
  })
}
```

And in `contentPage.tsx`:

```ts
if (fileData.hasMermaid) {
  externalResources.js.push({ script: mermaidScript, ... })
  externalResources.css.push({ content: mermaidStyle, ... })
}
```

Now mermaid doesn't hang on pages that don't need it. Which is probably most of them.

## KaTeX

[KaTeX](https://katex.org/) - a formula rendering library. 600 KB CSS and 300 KB JS.

Quartz bundles it on every page out of the box. Even if you don't have a single formula.

The right approach - load KaTeX optionally, only on pages with formulas:
Scan HTML for `$...$` or `$$...$$`, and if found - add the scripts.
If not - don't load.

It's trickier than mermaid because formulas can be inline (`$x^2$`) - you can't catch them at the remark stage, you need regex or a rehype plugin. But it's worth it: 900 KB per page that doesn't cache well because KaTeX is CSS + fonts + JS.

---

## Images

Giving them up can be really hard.

If you really need them:

The simplest way - `loading="lazy"`.

Adds with one rehype plugin:

```ts
plugins.push(() => {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "img" && !node.properties?.loading) {
        node.properties.loading = "lazy"
      }
    })
  }
})
```

Now the browser doesn't block waiting for all images to load before showing text. It renders the page and loads images later.

---

## Explorer

Rendered server-side, and as the number of pages grows, its HTML becomes noticeable.

Every folder, every level of nesting - divs, wrappers, attributes. On a site with deep structure the tree can take up tens of KB just in markup.

If the site is big - either disable the Explorer and use graphs instead, or refine it: strip unnecessary wrappers, limit depth, lazy-load subfolders.

---

## Search

Quartz indexes all pages for fast site search and better SEO crawling.

Whether you need it or not - up to you.

---

# Does this even help?

| Component       | Before             | After                      |
| --------------- | ------------------ | -------------------------- |
| Google Fonts    | ~2.5 MB            | 0                          |
| KaTeX           | ~900 KB/page       | 0                          |
| Inline scripts  | ~600 KB            | `postscript.js` 102 KB     |
| Mermaid         | on every page      | only where needed          |
| Images          | A lot.             | `loading="lazy"`           |
| Explorer        | many divs          | somewhat lighter           |

A page without mermaid and without images now weighs ~10 KB HTML + 41 KB index.css + 102 KB postscript.js.

All cached. When jumping between pages, only the lightweight HTML needs to be fetched.
