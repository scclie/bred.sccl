---
title: 'Scan Code & Virtual Key: The Anglocentric Conspiracy of Operating Systems'
description: "Why keyboard input still works like ass: scan code, virtual key, symbols, broken hotkeys, Unity, Unreal, Linux and the endless anglocentric clusterfuck with keyboard layouts."
lang: en
autoTranslated: "true"
translationLock: "true"
tags:
- "#os"
- "#it"
- "#shitpost"
date: 2026-06-21

---

How did they manage to fuck up something as basic as keyboard input?

Seriously. A keyboard is what we interact with a computer through. Every day. For hours. For years. And the input system is still built on the assumption that everyone uses QWERTY.

Switched to Colemak? Hotkeys in games are broken. Switched to Rulemak? Aseprite has no idea what's going on. Using non-QWERTY in some old program? Welcome to hell.

And it's not a bug. It's a feature. An anglocentric feature that's 40 years old.

---

# How it should work

There's hardware. There are keys. Each key has a physical position.

A scan code is simply the number of that position. Pressed the key in the top left corner - got a scan code. Doesn't matter what letter is painted on it. Doesn't matter what language. It's just "button number 16".

**The right approach:** a program (game, editor, whatever) listens to scan codes. Hotkey Ctrl+Z is bound to the physical position of the Z key - not the `Z` symbol, not the `VK_Z` virtual code, but the scan code. Then the hotkey works the same in any layout.

**What went wrong:** somewhere in the late 80s, the industry decided it was more convenient to work with symbols and virtual codes. Because "well everyone uses QWERTY anyway, what's the big deal".

And ever since, every layer of abstraction added on top of scan codes has created problems for anyone not on QWERTY.

-# PS/2 keyboards by the way support three scan code sets: XT (set 1), AT (set 2), and 3270 (set 3). Modern keyboards send set 2, the motherboard controller translates to set 1. Live with this knowledge.

---

# Windows: three layers of pain

Keyboard input on Windows goes through three levels:

```
scan_code -> virtual_key -> Symbol
```

**Scan code** - the only sane thing. Assigned by the keyboard driver, doesn't change with layout. Modern drivers can remap the matrix, but that's rare.

**Virtual key** - useless bullshit. Appeared back in Windows 3.1. The problem then was: there's an app written for QWERTY, and a user in France is on AZERTY. Hotkeys don't work. Microsoft's solution: let's create a layer that maps physical keys to their "QWERTY equivalent". Like "what letter would be on this key if the layout were QWERTY".

Originally the idea was reasonable. But vk should have died with Win16 applications.

It didn't die.

It's still in WinAPI. `GetKeyState(VK_CONTROL)`, `WM_KEYDOWN` with VK codes. All native Windows software sits on VK. And you can't just ignore VK because the entire WinAPI works through it.

**Symbol** - actual characters according to the layout. This part's fine - you press a key with Shift/AltGr applied, you get a letter.

The problem is there are two abstraction layers between scan code and the application. And every app picks its own.

---

# Games: every engine jerks off in its own way

## DirectInput

This fucking outdated DirectInput maps by VK.

It's an API from the 90s. Microsoft themselves [declared it deprecated](https://learn.microsoft.com/en-us/windows/win32/directinput/directinput-portal) back in 2005. They recommend XInput for gamepads and Raw Input for keyboards.

But it's still alive. Some games are still on it. Everything on DirectInput is garbage for non-QWERTY layouts.

## Unity

Fucking Unity invented their own Input Manager. `Input.getKey` is anally tied to Symbol.

That means a hotkey is bound not to a key, but to whatever letter that key produces in the CURRENT layout. Switch the layout - hotkeys are gone.

Supposedly they updated the input system to the "New Input System". Now you can grab keys through scan codes like `Keyboard.current.wKey`. But shit still happens with custom layouts in some situations anyway.

So they sort of fixed it, but not completely. Classic.

## Unreal Engine

In UE, if the dev doesn't slam that "use scan code" checkbox - input will be through VK.

Default is VK. Meaning every Unreal game is potentially broken. Depends on whether the dev gave a shit.

## Source Engine

But grandpa GabeN in Source (TF2, CS2, Portal...) uses scan codes for movement input.

And it just works. On any layout. Without rebinding.

-# no matter how much you hate Valve - they do know how to do some things right.

---

# Good examples

Besides Source, there are decent folks out there.

**Minecraft.** Up until somewhere around 1.9-1.12 (don't remember exactly) Minecraft had different input code - everything was bound to VK.

So if your layout wasn't QWERTY (and in some layouts the vk differs, like French and German) - you had to rebind. Every time. Every update.

Then somewhere around 1.12+ they rewrote it to scan codes. And everything started working beautifully. Because the physical W key is always the physical W key, no matter what letter your layout says it is.

*minecraft bedrock can go fuck itself, we've got DirectInput yo*

---

# Software: Aseprite and the rest

And fucking Aseprite, goddammit, uses Symbol.

You're drawing pixel art. You switch to a Russian layout (or any non-QWERTY). And the hotkeys fly off to god knows where.

Because `B` in the Russian layout is `И`. And Aseprite thinks "aha, the И key was pressed, let me check my hotkey table... nope, no hotkey for И".

Even though physically you pressed the same key.

Lots of programs do this. Aseprite is just the most painful example - its whole workflow is built on hotkeys.

Everything else goes through WinAPI - meaning VK. And VK maps to the "QWERTY equivalent". On some non-QWERTY layouts (French AZERTY, German QWERTZ) this equivalent differs from actual QWERTY. And hotkeys go to shit.

Decent folks use scan codes. They're the minority.

---

# Linux: its own set of rakes

Linux also shat the bed, and arguably even harder.

For starters, there are three abstraction layers before you get a symbol.

**Hardware scan code.** The keyboard (PS/2 or USB HID) sends a raw scan code. The kernel receives it.

**linux_keycode.** The kernel digests the scan code into things like `KEY_Q`, `KEY_W`, `KEY_E`. This is no longer a physical number, it's a "QWERTY position". At this level you've already lost the pure scan code.

That is, the Linux kernel immediately makes an anglocentric assumption.

**XKB.** X Keyboard Extension takes whatever the kernel shat out (`KEY_Q`, `KEY_W`...) and shits out its own positions: `<AD01>`, `<AD02>` ... `<AB01>`, `<AB02>`.

And XKB maps these coordinates directly to symbols (Keysyms). Like `<AD01>` = `q`, and in the Russian layout = `Cyrillic_shorti` (й).

The Linux problem is that if a program listens to linux_keycode directly (and many do, especially old X11 programs and some games through SDL), you get the same problems as with VK on Windows.

But if a program listens to XKB Keysyms - it gets the final characters. And if it binds hotkeys to characters rather than scan codes - broken again.

---

# What to do

Programmers: bind input to scan codes. Always. A key's physical position doesn't change with the layout.

Game devs: take a look at Source(Quake(Doom)). It was all figured out 30+ years ago.

Non-QWERTY users: suffer. Or file bug reports tagged "keyboard layout". Or build your own tools to work around this crap.

---

*Maybe, someday, operating systems will start supporting languages other than English.*

*But apparently not yet.*
