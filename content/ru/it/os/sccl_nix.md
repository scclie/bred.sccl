---
title: "sccl_nix: Декларативный рай"
description: "Модульная конфигурация NixOS на базе flakes, home-manager и disko, рассчитанная на масштабирование между несколькими машинами и пользователями без превращения /etc/nixos в хаос. Архитектура разделяет hosts, пользовательские profiles и общие shared-модули, чтобы dotfiles оставались поддерживаемыми, воспроизводимыми и расширяемыми без копипасты и if hostname костылей."
lang: ru
tags:
  - "#os"
  - "#project"
  - "#shitpost"
date: 2026-06-22
---

# Если этот shitpost-like статья выглядит как шиза
Нормальная дока на ангельском: [github/scclie/sccl_nix/README.md](https://github.com/scclie/sccl_nix)


# ~~На*&я~~ Зачем?

Потому, что необдуманный [NixOs](https://nixos.org/) config - это всегда один и тот же сценарий:

- сначал "аккуратно структурируешь"
- добавляешь второй хост
- потом третий
- прог всяких сыпешь, конфигов, исключений
- `/etc/nixos` превращается в помойку с условными `if hostname == ...`
> "ладно, сейчас я это нормально рефакторну"

*(нет)*

---

# Чотут?

Дотфайлы разделены на 3 сущности:

- `hosts` - железо и вся системная шалуха
- `profiles` - пользователь
- `shared` - всё, что ты устал копировать

машина != пользователь != окружение

---

## hosts
Всё, что нельзя синхронить между разными машинами

- диски
- дрова
- network
- system packages

## profiles

Это уже "человек"

- окружение(-я)
- свои проги
- настройки шелла
- весь этот user-level мусор

На одном хосте может быть сколько угодно профилей, хоть для разных людей, хоть под какие-то свои задачи.
Система билдится под хост, а профили подтягиваются

## shared

Это попытка остановить копипасту

- базовые пакеты
- wm конфиги
- дефолтные штуки

---

## Как эт связано

Максимально просто:

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
```

# Подвох?
Ну конечно при большом скилле и тут можно насрать, накидав зависимостей *не туда*
