---
title: "Билдим Zine на Cloudflare Pages с Github"
description: "Как мне довелось перенести sccl.cc с Astro на Zine и деплоить это на Cloudflare Pages"
lang: ru
tags:
- "#it"
- "#shitpost"
- "#web"
date: 2026-06-24
---

*статья скорее о моей невнимательности, и, в какой то степени, тупости*

Недавно мне приспичило перенести [sccl.cc](https://sccl.cc) с жирного [Astro](https://astro.build) на [Zine](https://zine-ssg.io).

Сам Zine - прикольная штука. Быстрый, написан на Zig, шаблоны на SuperHTML.
Всё собирается быстро, локально вроде всё летает.

**Подробнее в статье [[/ru/it/Migration-from-Astro-to-Zine.md]]**

Но вот deploy эт отдельная история.

---

Zine скомпилен в standalone-бинарник со статической линковкой. Никаких зависимостей и рантаймов - скачал, запустил. В `npm` его нет, из пакетных менеджеров не установишь. Значит над как-то доставлять его на раннер.

Есть варики:
- качать curl-ом при каждом билде
- закоммитить в репозиторий

Первый вариант - костыль. Второй звучит надёжнее...

# Пихаем в репу

Первая мысль была - закоммитить zine в репозиторий, чтоб билдилось из коробки:

```bash
cp /tmp/zine bin/zine
git add bin/zine && git commit
git push
> remote: error: File bin/zine is 152.19 MB; this exceeds GitHub's file size limit
```

И тут вспоминается, что GitHub не пускает больше 100 МБ.

*пора хостить свой git*
-# *может быть... потом...*

Ок, откатываем, делаем, что ничего не было. Лезем в документацию Zine - там рекомендуют `kristoff-it/setup-zine@v1` в GitHub Actions.

# GitHub Actions

Пихаем `kristoff-it/setup-zine@v1` в gh actions:

```yaml
- uses: kristoff-it/setup-zine@v1
  with:
    version: v0.11.3
- run: zine release
- uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy public/ --project-name sccl-cc
```

Всё логично: экшен ставит zine, zine собирает, wrangler пушит на cf pages. 

Из секретов нужны только `CLOUDFLARE_API_TOKEN` и `CLOUDFLARE_ACCOUNT_ID` 

(права `Account → Cloudflare Pages → Edit`).

---

*Над было смотреть доку сразу, но чет беглым взлглядом на неё эт инфа затерялась.*
