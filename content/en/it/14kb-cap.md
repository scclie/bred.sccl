---
title: "max 14KB aka 1 RTT"
description: "Why squeeze a site into 1 HTTP request, why many small packets are way worse than big ones? Transport layer bullshit: DNS, TLS, TCP slow start. The story of optimizing sccl.cc to 12 KB gzip in one packet."
lang: en
autoTranslated: "true"
translationLock: "true"
tags:
- "#it"
- "#shitpost"
- "#web"
date: 2026-07-01
---

# Why 14 KB?

Look at real requests.

**A site that fits in 14 KB:**
![[site_download.webp]]

**A site that doesn't:**
![[big_site_download.webp]]

Download 1 ms vs 63 ms.

Time difference — 63х

Payload difference — 7х

## TCP Slow Start

Here's the thing — TCP won't give you the content in one packet. Even when the server is ready to respond, TCP says "hold up brother, we have congestion control":

It starts with initcwnd — 10 segments (RFC 6928), that's ~1460 bytes each.
- Server sends 14 KB — waits for ACK,
- ACK arrives — window doubles to 20 segments (~29 KB),
- Now sends 29 KB — waits again...

*And so on until everything is sent.*

Each loop is one RTT.

Bigger response → more rounds.

If your response fits in 14.6 KB — it goes out in one packet.

No waiting && no doubling && no extra RTTs.

:: One round trip.

On large files (images, heavy content) this doesn't matter — TCP *has time to ramp up*.

But most websites serve files under 100 KB — and that's a real problem.

And that's assuming just one request. If you have separate fonts, scripts, images — each one goes through the full circle. Its own setup, its own slow start, its own RTTs. One site turns into 5-10-30 sequential requests, and each one wastes time on protocol chatter instead of actual data.

Bad example — [New-York Times](https://www.nytimes.com/) — 891 HTTP requests for 9 MB of content, 6 seconds of blocking time. And it's literally a standard newspaper layout with nothing heavy.

## Clubs

There's [14KB Club](https://14kbclub.com) — sites under 14 KB raw. They count uncompressed size, so a site that's ~20-30 KB but fits in 1 RTT thanks to gzip won't get in — questionable rules.

[512KB Club](https://512kb.club) — if you don't fit here, it's the biggest disrespect to users and the internet as a whole. Delete your fucking site.

*this butthurt doesn't apply to useful content like photos/video*

---

# My shit

Got a little site [sccl.cc](https://sccl.cc).

Built with [Zine](https://zine-ssg.io) — SSG in Zig. Three pages: contacts, projects, peripherals.

Originally the server served:

- HTML (~15 KB)
- Space Mono 400 woff2 (~40 KB)
- Avatar png (~2 MB)
- Favicon png (~1 MB)

![[50kb_scclcc.webp]]
-# the screenshot is already a little bit opatemized, it was worse :skull:

*(before migrating to Zine it was 150+ KB, see [[/ru/it/Migration-from-Astro-to-Zine.md]])*

Four requests per page for content that weighs almost nothing.

That's with full setup (DNS + TCP + TLS) happening once (keep-alive, HTTP/2). But still — each new tab, each page navigation — new setup. And the font and avatar hang as separate requests.

## Optimization

Plan: everything in one HTML. Base64 inline everything, zero external requests. And make it fit in initcwnd.

### Font

The fattest part — I had 2 fonts with bold versions.

Decided to keep only one.

And from the font file, strip everything except ASCII chars actually used on the site.

Disable hinting, disable layout features.

Result: 4.2 KB. Then base64 into @font-face → 5.7 KB of text in HTML.

This is the only concession to aesthetics. *Better to have no custom fonts at all.*

### Avatar

Initial was ultra chonky.

But ran it through a shakler — reduced the image to 3 colors first.

In PNG it was 1.9 KB.

Converted to WebP: 702 B. Base64 → 940 B.

### Favicon

199 B, kept it in PNG.

268 B in base64.

### JS

Honestly could've cut hard here, but I managed to keep all site functionality and stuff all JS inline.
Animated buttons, animated background, an easter egg with animation — basically all the unnecessary shit without which you could squeeze the site to 5 KB. (which wouldn't make it faster)

## Result

**Before:** 4 requests, ~50 KB total

**After:** 1 request, 12 KB gzip / 27 KB raw

Fits in initcwnd. One TCP packet. One round trip for data.

![[12kb_scclcc.webp]]

## Dilemma

Inlining everything is a tradeoff.

When navigating to another page, the browser downloads the same font again — the font is inside HTML, it doesn't cache separately. With a separate file, the font would be cached after the first load, and the next page would load without it.

Also worth noting that inlining usually weighs slightly more than an external dependency, and if we don't need to fit in initcwnd anyway — there's no point.

### Example
**1. Everything in one HTML (base64 fonts)**
- 2 pages at 14 KB each
- each loads in 1 round trip
- but you burn the full 14 KB every time, even if the font repeats

**2. HTML + separate font**
- 2 pages at 8 KB + 4 KB font separately
- first visit: 2 requests (HTML + font)
- navigation between pages: only 8 KB (font cached)

In practice, nobody feels the difference between 14 KB and 8 KB load time.

But delays between packets — you do.
