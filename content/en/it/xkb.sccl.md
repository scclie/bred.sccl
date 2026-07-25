---
title: "XKB GUI config generator: xkb.sccl.cc"
description: "A website for generating xkb keyboard layout configs on Linux."
lang: en
tags:
- "#it"
- "#shitpost"
- "#web"
- "#linux"
date: 2026-07-26
---

# Background
Unfortunately, historically it so happened that I need at least 2 keyboard layouts behind my computer - English and Russian.
Moreover, I've been using Colemak-type layouts (Vanilla / DH / CAWS) and various custom modifications for Russian like RulemakDH or RulemakCAWS (see [[/en/Peripheral/Keyboards/Rulemak-CAWS.md]]) for a long time.
And all of this on two different matrices - the usual Staggered ANSI that everyone's used to, and a split Columnar one.

So far I haven't reached any kind of ideal - it's just clear that you need different layouts for ANSI and split keyboards.
It would be cool to completely get rid of ANSI keyboards, but a couple of times a week I have to use a laptop, and bringing my own split keyboard along every time isn't always convenient.

# XKB GUI Generator
In the end, I got tired of manually editing keyboard layout configs, so the tool [xkb.sccl.cc](https://xkb.sccl.cc/) was created - a web-based visual editor for xkb layouts on Linux.

![[xkb_sccl_cc.webp]]

There's nothing special about it - just a QoL thing: click the buttons you need, copy your config, and use it happily.

All possible standard xkb symbols for binding are already on the site. But xkb supports typing any Unicode characters, so you're not limited to just those.

![[xkb_sccl_bind.webp]]

Everything is, of course, [open source](https://github.com/scclie/xkb.sccl)

# Contributing
The site has its own config format, stored in localdata. You can download it at any time (besides the raw xkb config), and if you want, [create a PR](https://github.com/scclie/xkb.sccl/pulls) (dropping the json into `assets/presets/`) to add a layout to the site.

-# *Maybe I'll add direct import from xkb config later.*
