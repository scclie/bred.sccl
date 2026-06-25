---
title: "Building Zine on Cloudflare Pages with GitHub Actions"
description: "How I migrated sccl.cc from Astro to Zine and deployed it on Cloudflare Pages"
lang: en
autoTranslated: "true"
translationLock: "true"
tags:
- "#it"
- "#shitpost"
- "#web"
date: 2026-06-25
---

*this article is more about my carelessness, and to some extent, stupidity*

Recently I felt like moving [sccl.cc](https://sccl.cc) from bloated [Astro](https://astro.build) to [Zine](https://zine-ssg.io).

Zine itself is a neat thing. Fast, written in Zig, templates in SuperHTML.
Everything builds quickly, locally it's all smooth.

**More details in the article [[/en/it/Migration-from-Astro-to-Zine.md]]**

But deploy - that's a separate story.

---

Zine is compiled into a standalone statically-linked binary. No dependencies, no runtimes - download and run. It's not in `npm`, you can't install it from any package manager. So you gotta deliver it to the runner somehow.

Options:
- download with curl on every build
- commit to the repository

First option is janky. Second sounds more reliable...

# Stuff it in the repo

First thought - just commit zine to the repo so it builds out of the box:

```bash
cp /tmp/zine bin/zine
git add bin/zine && git commit
git push
> remote: error: File bin/zine is 152.19 MB; this exceeds GitHub's file size limit
```

And then you remember GitHub doesn't allow files over 100 MB.

*time to self-host git*
-# *maybe... later...*

OK, rollback, pretend nothing happened. Check Zine docs - they recommend `kristoff-it/setup-zine@v1` in GitHub Actions.

# GitHub Actions

Throw `kristoff-it/setup-zine@v1` into gh actions:

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

Makes sense: action installs zine, zine builds, wrangler pushes to CF Pages.

The only secrets needed are `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`

(Permissions: `Account → Cloudflare Pages → Edit`).

---

*Should've checked the docs first, but somehow that info got lost in my quick glance.*
