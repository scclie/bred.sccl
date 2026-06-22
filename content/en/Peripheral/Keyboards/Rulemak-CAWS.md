---
title: Rulemak CAWS
description: Phonetically equivalent variant of the Colemak CAWS layout
lang: en
tags:
  - "#peripheral"
date: 2025-06-22
autoTranslated: true
---

The Colemak CAWS project itself was created by the community around Colemak to combine the popular mods `Curl`, `Angle`, `Wide`, `Symbols`, and the main work on CAWS was done by [DreymaR](https://dreymar.colemak.org/). This Russian version is my adaptation for the Cyrillic alphabet.

## Main idea

The Russian layout is built as a phonetic analogue of the English one:

* A > A
* R > P
* S > C
* T > T
* G > G

and so on, where possible.

This approach allows you not to learn a new layout - you can type on it immediately confidently knowing only the basic one: many words and combinations are typed with similar finger movements, regardless of the selected layout.

## Why does it work

The frequency of letters and sounds in Russian and English is largely similar. Therefore, the phonetic mapping of the English layout into Russian provides a fairly good load distribution without separate deep optimization for Russian texts. ([Russian](https://ru.wikipedia.org/wiki/%D0%A7%D0%B0%D1%81%D1%82%D0%BE%D1%82%D0%BD%D0%BE%D1%81%D1%82%D1%8C), [English](https://en.wikipedia.org/wiki/Letter_frequency) )

## Heatmap
Top 1000 words for Russian and English
![[rulemak_caws_thermal.png]]
![[colemak_caws_thermal.png]]

You can check and compare on my visualizer:

[heatkeys.sccl.cc](https://heatkeys.sccl.cc)

## What's here?

One of the features of Colemak CAWS is the central block of keys with signs:

`-[ \ / ]`

Because of it, the layout feels almost like a split keyboard: there is additional space between the hands, and some of the rarely used characters are under the index fingers.

In the Russian version, this place was perfect for letters:

`Shch`, `Sh`, `E`.

They are not used as often, but they are much more comfortable to press than in traditional layouts, where such letters are usually sent to the right little finger.

Not all phonetic matches are obvious. For example:

- `V → В`
- `W → Ж`

This comparison may look strange, but it is quite historically accurate.

The remaining letters had to be shoved wherever they fit:

- `Ъ` went under the little finger, as I would have liked, since it is used extremely rarely.
- `Yu` took the place of `\`. The letter is also not very frequent, so this turned out to be the most painless option for its placement.
- `E` some idiot in Russian shoved it into the ass of the world - in this version it is on `E`, but on the *AltGr* layer

The layout does not try to be perfect for the Russian language. The goal was to make the Russian part as similar to the English part as possible, so that you wouldn’t have to keep two different layouts in your head, but still retain the ergonomics and convenience of Colemak.

## Compatibility

The layout was made for ANSI keyboards.

It may work a little differently at ISO.

On Split I use regular phonetic DH.

## Installation for Windows
The layout was compiled via [microsoft keyboard layout creator](https://www.microsoft.com/en-us/download/details.aspx?id=102134) (`.kdl` file for editing in the archive)

It’s better to throw in dlls manually and register them in the registry manually too.

But you can click the installer and pray that the system doesn’t die.

**Download archive:**
[[rumkcaws.7z]]

## Linux
-# But for the line, no, I use split and dh there, the layout itself is, in fact, for the laptop.
