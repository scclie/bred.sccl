---
title: 'Rulemak CAWS'
description: "Russian phonetically equivalent variant of Colemak CAWS layout"
lang: en
tags:
  - "#peripheral"
date: 2026-06-22
---

The Colemak CAWS project itself was created by the Colemak community to unite popular mods: `Curl`, `Angle`, `Wide`, `Symbols`, with the main work on CAWS done by [DreymaR](https://dreymar.colemak.org/). This Russian variant is my adaptation for Cyrillic.

## Core Concept

The Russian layout is built as a phonetic analogue of the English one:

* A > А
* R > Р
* S > С
* T > Т
* G > Г

and so on, where possible.

This approach means you don't have to learn a new layout from scratch — you can start typing confidently right away, knowing only the base layout: many words and combinations are typed with similar finger movements regardless of which layout you're using.

## Why It Works

Letter and sound frequencies in Russian and English are largely similar. Therefore, phonetically mapping the English layout to Russian provides a reasonably good distribution of workload without requiring separate deep optimization for Russian texts. ([Russian](https://ru.wikipedia.org/wiki/%D0%A7%D0%B0%D1%81%D1%82%D0%BE%D1%82%D0%BD%D0%BE%D1%81%D1%82%D1%8C), [English](https://en.wikipedia.org/wiki/Letter_frequency))

## Heatmap
Top 1000 words for Russian and English
![[rulemak_caws_thermal.png]]
![[colemak_caws_thermal.png]]

You can poke around and compare on my visualizer:

[heatkeys.sccl.cc](https://heatkeys.sccl.cc) **(you can poke it right here!)**

<iframe
  src="https://heatkeys.sccl.cc"
  style="width: 100%; height: 770px; border: 1px solid var(--secondary); border-radius: 8px;"
  loading="lazy"
></iframe>

## What's Here?

One of the features of Colemak CAWS is the central block of keys with symbols:

`- [ \ / ]`

Because of this, the layout feels almost like a split keyboard: there's additional space between the hands, and some rarely used symbols end up under the index fingers.

In the Russian version, this space turned out to be perfect for letters:

`Щ`, `Ш`, `Э`.

They're not used that often, but they're significantly more comfortable to press than in traditional layouts, where such letters are usually relegated to the right pinky.

Not all phonetic correspondences are obvious. For example:

- `V → В`
- `W → Ж`

This mapping might look strange, but it's actually historically accurate.

The remaining letters had to be shoved wherever they'd fit:

- `Ъ` ended up under the pinky, much as I'd prefer otherwise, since it's used extremely rarely.
- `Ю` took the place of `\`. This letter isn't too frequent either, so this turned out to be the least painful placement option.
- `Ё` — some idiot in the Russian layout stuck it in the ass-end of the world — in this variant it's on `Е`, but on the *AltGr* layer.

The layout doesn't try to be perfect for Russian. The goal was to make the Russian part as similar as possible to the English one, so you don't have to keep two different layouts in your head, while preserving the ergonomics and convenience of Colemak.

## Compatibility

The layout was made for ANSI keyboards.

On ISO it might work slightly differently.

On Split I use the regular phonetic DH.

## Installation for Windows
The layout was built using [Microsoft Keyboard Layout Creator](https://www.microsoft.com/en-us/download/details.aspx?id=102134) (`.kdl` file for editing is in the archive)

It's better to drop the DLL files manually and register them in the registry by hand too.

But you can run the installer and pray the system doesn't croak.

**Download archive:**
[[rumkcaws.7z]]

## Linux
-# No version for Linux, I use split and DH there anyway — the layout itself is basically for a laptop.
