---
title: "Discord: Security Problem"
description: "Discord and the secret technology of 'an open file containing your password'. Maximum openness of the client to completely random people."
lang: en
tags:
  - "#it"
  - "#security"
  - "#shitpost"
date: 2026-06-18
---

# Discord and the secret technology of "an open file containing your password"

It's almost surprising how many Discord spammers there are, to the point that they literally created the `1.jpg, 2.jpg, 3.jpg, 4.jpg @everyone @here` meme.

![[discord_spam.png]]

Then you start digging into the topic and realize that basically any unauthorized file read is enough to steal your session with a single token grep.

---

# What is a token?

Very roughly, in Discord:

```text
login + password + 2fa
↓
Discord gives you a token (a hash based on some data)
↓
the token becomes your session
```

From then on, the client just throws this token at the server:

> "it's still me"

Server:

> "aight, come in"

---

# What if someone steals the token?

Then literally nothing interesting happens:

Take the token.

&&

Feed it to another client.

&&

T H A T ' S  I T...

: You're already inside the account.

![[discord_token_login.webp]]

* No login.
* No password.
* No 2FA.
* No SMS.
* No passkey.
* No push notification.
* No confirmations.
* No alerts about a new login.

![[discord_2fa.webp]]


---

# So... is it easy to steal?

Yeah.

![[discord_grep_token.webp]]

*just read a file*

# And how do I notice that it was stolen?

You don't.

The new login isn't even registered as a new one — the old session simply "moves" to another machine.

The only thing you might notice is that you got logged out from the device where the token was stolen.

And that's only if somebody actually used the token immediately instead of saving it for a rainy day.

---

# So how do you protect against this?

Obviously, absolute security doesn't exist.

If a full-blown stealer is running on your machine, it'll probably find *some* way to steal something, depending on the hacker's skill.

But between:

> "read a file"

and

> "inject into a process, go through system dialogs, spoof the environment"

there's a massive gap.

# HOW DISCORD DEVELOPERS COULD HAVE DONE IT

- storing secrets via the OS keychain;
- confirmation prompts when accessing secrets;
- device fingerprinting;
- binding tokens to hardware;
- a separate device-generated key;
- security alerts on sudden environment changes;
- etc, etc, etc...

Yeah, all of this can also be bypassed.

But at what cost?

---

# And right now?

Right now the attack chain looks like this:

```text
downloaded some suspicious thing
↓
it read a file
↓
your session got hijacked: `1.jpg, 2.jpg, 3.jpg, 4.jpg @everyone @here`
```

---

# If Discord can't

One workaround is to log into Discord from a dedicated user account that's used **only** for Discord.

That way, only that user has permission to read the session database.

Assuming there are no internal exploits in the Discord application itself, the chance of having your session stolen becomes minimal.

This is easy to do on Linux because its permission hierarchy was designed for this from the beginning.

On Windows you can do something similar too, but the security guarantees aren't as strong since its permission model mostly appeared as a patchwork solution around the Vista era.

Still better than leaving an account access file readable by everyone because Discord, for some mysterious reason, couldn't protect it itself.

![[discord_rights.webp]]
> [!NOTE]  This security layer is implemented in my [NixOs config](/en/it/os/sccl_nix)
