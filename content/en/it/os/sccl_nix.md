---
title: "sccl_nix - Declarative paradise"
description: "A modular NixOS configuration built on flakes, home-manager and disko, designed to scale across multiple machines and users without turning /etc/nixos into chaos. The architecture separates hosts, user profiles and shared modules to keep dotfiles maintainable, reproducible and extensible without copy-paste and hostname-based hacks."
lang: en
tags:
  - "#os"
  - "#project"
  - "#shitpost"
date: 2026-06-22
---

# If this shitpost-like article looks like insanity
Proper documentation: [github/scclie/sccl_nix/README.md](https://github.com/scclie/sccl_nix)


# Why ~~the f*&^~~ ?

Bc an unstructured NixOS config is always the same story:

- first you "organize it properly"
- then you add a second host
- then a third
- then packages, configs, exceptions start piling up
- `/etc/nixos` slowly turns into a dump of `if hostname == ...` conditionals

> “ok, Ill refactor this properly later”

*(no u wont)*

---

# What is this?

Dotfiles are split into 3 core entities:

- `hosts` - hardware and system-level stuff
- `profiles` - the user layer
- `shared` - everything you got tired of copying around

machine != user != environment

---

## hosts
Everything that cannot realistically be shared between machines

- disks
- drivers
- network
- system packages

---

## profiles

This is basically the “human layer”

- environments
- personal software
- shell configuration
- all that user-level mess

One host can contain as many profiles as you want — different users, different purposes, whatever.

The system is built per-host, and profiles are attached on top.

---

## shared

An attempt to stop copy-paste culture

- base packages
- WM configs
- default settings

---

## How it connects

Very simple:

```mermaid
flowchart TD
    F[❄️ flake.nix<br/>Auto-discovery]

    P1[👤 profiles/paper]
    P2[👤 profiles/guest]

    H1[🖥️  hosts/sacculos]
    H2[💻 hosts/laptop]

   NM[⚙️ nixos/modules<br/>System services]
   PS[📦 profiles/shared<br/>Base configs&packages]

    F --> H1
    F --> H2
    
    H1 --> P1
    H1 --> P2
    H2 --> P2
    
    P1 --> PS
    P2 --> PS
    
    H1 --> NM
    H2 --> NM
    
    classDef flakeStyle stroke:#517599,stroke-width:2px,color:currentColor
    classDef hostStyle stroke:#5e81ac,stroke-width:2px,color:currentColor
    classDef profileStyle stroke:#8fbcbb,stroke-width:2px,color:currentColor
    classDef sharedStyle stroke:#d08770,stroke-width:2px,color:currentColor
    classDef moduleStyle stroke:#bf616a,stroke-width:2px,color:currentColor
    
    class F flakeStyle
    class H1,H2 hostStyle
    class P1,P2 profileStyle
    class PS sharedStyle
    class NM moduleStyle
````

# The catch?

ofc, with enough skill you can still mess it up completely by wiring dependencies *in all the wrong places*
