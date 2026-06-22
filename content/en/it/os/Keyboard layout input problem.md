---
title: 'Scan Code & Virtual Key: An Anglocentric Conspiracy of Operating Systems'
description: scan_code virtual_key Symbol
lang: en
tags: 
date: 2026-06-21
autoTranslated: true
---

How did you manage to shit on such a basic thing as keyboard input?

# Shinda
Keyboard input in Windows has several levels of abstraction:
`scan_code` `virtual_key` `Symbol` *well, then there may be other symbols, ala shift, altgr, etc.*

, where `scan_code` is unchangeable, assigned by the driver (well, in modern firewood you can remap the matrix, but that’s not the point)
`virtual_key` is useless crap that was born from the stupidity of the OS developers, but does not disappear due to the stupidity of the program developers who got attached to it. Initially created to support hotkeys in all languages, i.e. The usual qwerty layout is mapped into it, so that hotkeys work on the conditional ytsuken (the right way: bind the input to `sc`, not `vk`)
`Symbol` - well, the letters are absolutely any in accordance with the layout. 

#Games?
Fucking outdated DirectInput maps to `VK` - everything on it is shit. 

Fucking Unity came up with its own Input Manager, where `Input.getKey` is anally tied to `Symbol`
It seems like they updated the input system - now you can grab keys through scanned codes like `Keyboard.current.wKey`, but in some situations shit still happens in the case of custom layouts.

in UE, if the developer doesn’t hit the mark ala “use scan code”, the input will be via `vk`.

It’s just that Uncle Gaben uses `scan_code` in the resource to enter a movement.

# There are other examples of norms
Somewhere before 1.9-1.12 (I don’t remember exactly)
In the lane there was a different input code - everything was tied to `vk`.
Those. conditionally, if you have it changed (and in some layouts it is changed, like in fr and de, if I’m not mistaken, I’m not talking about normal ones) - you had to rebind.

Then in newer versions they rewrote it to `sc` - everything began to work crap. 

*fuck you in minicraft bedrock, we have directinput yo*

# What about the programs?
And the fucking aseprite fucking `Symbol` sucks and sincerely doesn’t understand what the fuck happens when you change the layout to ytsuken or any other. Your hotkeys are flying off to God knows where.
So many are on `vk`, normal guys are on `sc`

Otherwise, everything goes through WinAPI - respectively `vk`

# And Linux
And there they also gave a shit, and even worse.
At the kernel hardware level `scan_code`
The kernel provides an abstraction of the same type, aka digests `scan_code` into conditional `key_q`, `key_w`, `key_e` (`linux_keycode`)
Some xkb thread assumes that the kernel is crap and deletes its positions aka `<AE01>`, `<AE02>` ... `<AB01>`, `<AB02>` ... `<AC01>`, `<AC02>`
And XKB maps this coordinate directly into symbols (Keysyms) - like `<AD01>` == `q`, or in Russian == `Cyrillic_shorti` (th).

-# *Maybe someday operating systems will support languages other than English.*
-# *But apparently it’s too early.*