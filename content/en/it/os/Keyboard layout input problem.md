---
title: 'Scan Code & Virtual Key: An Anglocentric Conspiracy of Operating Systems'
description: "Why keyboard input is still a complete mess: scan codes, virtual keys, symbols, broken hotkeys, Unity, Unreal, Linux, and the never-ending anglocentric disaster of keyboard layouts."
lang: en
tags: 
  - "#it"
  - "#shitpost"
date: 2026-06-21
---

How the fuck did they manage to screw up something as basic as keyboard input?

# Windows
Keyboard input in Windows has several layers of abstraction:
`scan_code` `virtual_key` `Symbol` *well, then there might be other modifiers like shift, altgr, etc.*

where `scan_code` is immutable, assigned by the driver (well, in modern drivers you can remap the matrix, but whatever)
`virtual_key` - useless shit that was born from the stupidity of OS devs, but won't die because of the stupidity of app devs who got hooked on it. Originally created to support hotkeys across all languages, i.e., it maps the standard qwerty layout so hotkeys work on, say, a ЙЦУКЕН layout (the right way: bind input to `sc`, not `vk`)
`Symbol` - well, just any actual letters according to the current layout. 

# Games?
The fucking outdated DirectInput maps by `VK` - anything relying on it is pure shit. 

Shitty Unity came up with its own Input Manager, where `Input.getKey` is anally bound to `Symbol`
Seems they updated the input system - now you can grab keys via scan codes like `Keyboard.current.wKey`, but still, in some situations, shit goes down with custom layouts.

In UE, if the dev doesn't tick the little "use scan code" checkbox - input will go through `vk`.

But then again, Uncle Gabe in Source uses `scan_code` for movement input.

# There are other decent examples
Somewhere before 1.9-1.12 (don't remember exactly)
Minecraft had a different input code - everything was bound to `vk`.
So, like, if yours was changed (and in some layouts it is changed, like in FR and DE if I'm not mistaken, not to mention the *normal* ones) - you had to rebind everything.

Then in newer versions they rewrote it to use `sc` - and it started working fucking great. 

*in Minecraft Bedrock they went fuck themselves, we're on directinput yo*

# What about apps?
And the fucking Aseprite, damn it, smashes through `Symbol` and genuinely doesn't understand what the fuck is going on when you switch the layout to ЙЦУКЕН or anything else. Your hotkeys just fly off to god knows where.
So many are on `vk`, the decent folks are on `sc`

Otherwise, everyone goes through WinAPI - which means `vk` accordingly.

# What about Linux
They fucked that up too, and probably even harder.
At the hardware level, the kernel has `scan_code`
The kernel provides an abstraction of the same type, basically digesting `scan_code` into so-called `key_q`, `key_w`, `key_e` (`linux_keycode`)
Then some xkb takes whatever the kernel shat out and shits out its own positions like `<AE01>`, `<AE02>` ... `<AB01>`, `<AB02>` ... `<AC01>`, `<AC02>`
And then XKB maps this coordinate directly to symbols (Keysyms) - like `<AD01>` == `q`, or in Russian == `Cyrillic_shorti` (й).


-# *Maybe someday, operating systems will start supporting languages other than English.*
-# *But apparently it's too early for that yet.*
