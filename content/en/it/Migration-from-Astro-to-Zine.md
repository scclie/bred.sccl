---
title: "sccl.cc: bye Astro, hello Zig Zag Zine"
description: "Moved sccl.cc from Astro to Zine. What did it get me?"
lang: en
tags:
- "#it"
- "#shitpost"
- "#web"
date: 2026-06-24
---

My site [sccl.cc](https://sccl.cc) was originally on [Astro](https://astro.build).

Astro is a cool thing.
For quickly whipping up something nice it's fine, but over time it started pissing me off:

**Heavy runtime.** To build a site you need Node.js, npm, `node_modules` at a hundred megabytes. For some static pages.

**Complexity.** Astro does everything: islands, ssr, endpoints, middleware. And I have a site with three pages: contacts, projects, peripherals - I don't need much.

# Alternatives?

I stumbled upon [Zine](https://zine-ssg.io).

Zine is an SSG in Zig. One binary, no dependencies.

Templates use SuperHTML - it's valid html with templating added. No `{{ }}`, no Pug/Jade. Just html with attributes like `:text`, `:if`, `:loop`.

Content uses SuperMD - extended .md without needing to drop into html.

# Migration process

Overall the migration was pretty simple - rewrite layouts from Astro to SuperHTML, port over existing scripts. The most tedious part is that astro uses its fucking `.astro` files with their weird mix of js and html, while SuperHTML is just html with extras.

# Benefits?

**Speed.** Build in milliseconds instead of seconds.

**Simplicity.** No `node_modules`. No `package-lock.json`. No hundreds of dependencies. One binary, a content folder, a templates folder.

**Control.** I know every line of generated HTML. No hidden JS that Astro adds by default.

# Downsides?

Zine is in beta.

Documentation is sparse in places. Community is small. If something breaks - you're the first to notice.

But for a personal site it's great.

One binary, a couple .smd files, one layout, and done.

How I ended up deploying this thing is described in [[/en/it/How-to-ZINE-on-CF.md]].
