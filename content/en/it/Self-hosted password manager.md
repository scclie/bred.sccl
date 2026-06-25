---
title: "Self-hosted password manager on Cloudflare Workers"
description: "Deploying NodeWarden (Bitwarden-compatible server) on Cloudflare Workers for free, no credit card needed. Why, how, and is it secure."
lang: en
autoTranslated: "true"
translationLock: "true"
tags:
- "#it"
- "#security"
- "#shitpost"
date: 2026-06-25
---

# Why tho?

Options for storing passwords:

1. In your head - *good luck*
2. In a text file - *sec^Wnot secure*
3. Google Chrome / Firefox / ... - *passwords are stored who knows where*
4. Bitwarden / 1Password / ProtonPass - *fine, but you gotta pay, and data is on someone else's servers*
5. Your own server - *let's go*

---

# Why not just run Bitwarden on a VPS?

You can. Bitwarden officially supports:

```
docker run bitwarden/self-host
```

But:

* Need a VPS - $3-5/mo
* Need Docker, need to monitor it, update it, back it up
* For one person - kinda overkill

What you actually want: free, zero maintenance, and it just works.

---

# NodeWarden - Bitwarden-compatible server on Cloudflare Workers

[NodeWarden](https://github.com/shuaiplus/nodewarden) is a fork of the Bitwarden server that runs directly on **Cloudflare Workers**.

So:

- Free (Workers - 100k req/day)
- Zero maintenance
- Cloudflare handles the infra
- Database - **Cloudflare D1** (free: 5 GB, 5M rows read/mo)

Works with all Bitwarden clients: browser extension, mobile app, CLI.

---

# Setup

Quick steps:

1. Fork [shuaiplus/nodewarden](https://github.com/shuaiplus/nodewarden).
2. Clone locally: `git clone <your-fork> && cd <your-repo> && npm install`
3. Edit `wrangler.toml`: `name`, `database_name`, etc.
4. D1 database is auto-created on first deploy - wrangler handles it from config.
5. Add `JWT_SECRET`: Dashboard -> your worker -> Settings -> Variables. Any string >=32 chars, e.g. `openssl rand -base64 32`.
6. Deploy: Cloudflare Dashboard -> Workers & Pages -> Create -> Pages -> Connect to GitHub, pick your fork. Cloudflare pulls code, builds, and deploys on every push to `main`. No GitHub Actions needed.

**Important:** Cloudflare's free plan requires a credit card to create R2 buckets. NodeWarden has a `deploy:kv` mode that uses KV instead of R2 (for file attachments). Database is D1 either way - no card needed.

---

# Is it secure?

*short answer: yes*

Under the hood it's standard Bitwarden end-to-end encryption:

* Master password -> KDF -> **master key** (symmetric, AES-256). Lives in the browser only, never leaves.
* Master key -> HKDF -> **encryption key** - this encrypts all passwords, TOTP keys, notes. Server only sees encrypted garbage.
* An asymmetric key pair is also generated: **public key** stored on the server openly, **private key** encrypted with the encryption key and sent to the server (needed for syncing between devices).
* Master password -> KDF -> **client hash** - sent to the server. Server salts it again (server hash) and stores only that.
* The server cannot decrypt the vault. At all. It has no keys - only a hash to verify your password at login.

Server stores only encrypted data. Even if someone steals the database - they get useless blobs that can't be cracked without the master key.

---

# Caveats

**Dependency on Cloudflare & GitHub**

Cloudflare *theoretically* could modify your worker if your GitHub or CF account gets compromised.

How realistic is that? Depends on your paranoia level and security hygiene.

---

# Send - expiring links

Bitwarden feature: create a self-destructing link. Type - text or file. Expires by time (1-31 days) or by view count - deletes after N opens.

You can optionally add a password on top of the link. You can revoke any Send manually at any time, even before it expires.

---

# TL;DR

**Pros:**
- Free
- Zero maintenance
- E2E encryption
- Bitwarden-compatible (any client)
- Public links (Send)

**Cons:**
- Depends on Cloudflare & GitHub
- No password sharing between users (everyone sees only their own vault)

Good "set and forget" option for those who don't want to pay for Bitwarden Premium, don't want to give Google all their passwords, and don't want to admin a VPS.
