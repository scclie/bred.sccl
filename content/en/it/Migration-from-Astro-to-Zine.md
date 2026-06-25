---
title: "sccl.cc: Bye Astro, Hello Zig Zag Zine"
description: "Felt like moving sccl.cc from Astro to Zine. What did it give?"
lang: en
autoTranslated: "true"
translationLock: "true"
tags:
- "#it"
- "#shitpost"
- "#web"
date: 2026-06-24
---

My site [sccl.cc](https://sccl.cc) was originally built with [Astro](https://astro.build).

Astro is cool and all. For quickly whipping up something pretty it's fine, but over time it started to annoy me:

**Heavy runtime.** To build a site you need Node.js, npm, `node_modules` clocking in at hundreds of megabytes. For a static site.

**Overengineered.** Astro does everything: islands, SSR, endpoints, middleware. And I have a three-page business card site: contacts, projects, peripherals. Don't need much.

# Alternatives?

I stumbled upon [Zine](https://zine-ssg.io).

Zine is an SSG written in Zig. One binary, no dependencies.

Templates use SuperHTML - valid HTML with templating bolted on. No `{{ }}`, no Pug/Jade. Just HTML with attributes like `:text`, `:if`, `:loop`.

Content uses SuperMD - extended markdown without needing to drop into HTML.

# Migration process

Overall the migration was straightforward - rewrite layouts from Astro to SuperHTML, move existing scripts over.

The most annoying part is that Astro uses its fucking `.astro` files with a weird mix of JS and HTML, while SuperHTML is just HTML with extras.

# What did I get?

**Speed.** Build in milliseconds instead of seconds.

**Simplicity.** No `node_modules`. No `package-lock.json`. No hundreds of dependencies. One binary, a content folder, a layouts folder.

**Control.** I know what's in every line of generated HTML. No hidden JS that Astro adds by default.

# Downsides?

Zine is in beta.

Documentation is sparse in places. Community is tiny. If something breaks - you'll be the first to notice.

But for a personal site it's great.

One binary, a couple of .smd files, one layout - and you're done.

How I ended up deploying this thing is described in [[/en/it/How-to-ZINE-on-CF.md]].
