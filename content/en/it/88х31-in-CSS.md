---
title: "Shoving 88x31 images into CSS"
description: "Optimizing image loading on the site. Loading base64 images through CSS."
lang: en
autoTranslated: "true"
translationLock: "true"
tags:
- "#it"
- "#shitpost"
- "#web"
date: 2026-07-23
---

# Well fuck all this then?

Since I strive for maximum loading speed of [my site](https://sccl.cc/) - I try to keep it within 1rtt (more on that in [[/en/it/14kb-cap.md]])

On top of that I get a bonus of bypassing Russian TSPU, since the first packet doesn't get caught by them.

But I wanted to add banner links to other sites - what to do?

# What do people usually do?
Most of the time it looks like a shitload of http requests, one per each image

![[88x31_http_requests.webp]]

Which sounds maximally shitty.

At least most people don't hotlink, and host these images themselves.

*otherwise it would be a complete disaster*

Maybe some even do it automatically.

# How did I want it?
Since my site is 1http request 1rtt - need to come up with something.

Obviously shoving all images at the same resolution into 1rtt we won't be able to, so just inlining is not an option.

But we can shove all images into CSS as base64 and load them with one http request!

# Let's do it.
The CSS itself is generated at build time - all current banners are fetched based on a config and stuffed into CSS in base64 format.

Something like:
```css
.badge{display:inline-block;width:88px;height:31px;image-rendering:pixelated;image-rendering:crisp-edges}
.badge-0{background:url(data:image/gif;base64,R0lGODdhWAAfAHcAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQEIgAAACwAAAAAWAAfAIMuNEA7QlJARVJaaF1SV2ONpH9/hI6jvoy0jq3l6fAAAAAAAAAAAAAAAAAAAAAAAAAE/xDJSau9OOvNefhgKI5kaZ5oOk5q674wKgUA8Na37eK7bko6HyrYIqqMKSQJ+BE2fUYnDdqsing0qxQbHfFmXK2Xmi2HwuUtWfkEdWcltkketybtoIR+v6/CzW5kbmODZ4R4gG12fIxfCFVSg1SRkJJzZjaUWTqMfCF/kYKIdk6hhaeGi516ZWBXQ68fAgZ6BqcECbYnpSirrCBMmZuWwsWYuAbGxpXKw8w0vgl+j024ewRZtLUCTdq53DbIZta5w97YzwAD68bRm8HIBgYEAjba8uUA97TJNMjFAgjwE8ZPYAJww2wMOFBgQLFowlzRwvYwAYFw9QLooUgvizhl+f+g2bKRq5lChg6zuMsEr9Y8lclwZApZ7F9Cjf1IMhpJo4DPnwUOoJzpK+IjG7POibxZ8ubHTTVo5iJAlV6mhUKzah2g0tc7BDXCAqBaEsDGKWE3hkX7T2zanGYPohW7ru46oQ3TFg0bLKC8iTX2vdTncl7YWVPBCeRnmHAueZlkig2aV++qta7IWVzrranjWjIRbw7QuSxpPnDdLmyIVuNeGsHcup0bWfba2bbF0qYtmzZEHEB0887Ng7jtJ8aFJ497mS/Y27WTTxl+XPLy6cl/1wguGXtx3JFb8/Yuvnf3tePPbwdbHrz3IO6tI4f+fr769rq5G38v3Xr/6Pv5t58mfvtRl5t90hl4nIKyEbjcgxBGKGFyE0xo4YUYGtfBhhx26CGHEQAAIfkEBSIAAAAsAQADAFYAGQCBAAAALjRAO0JSAAAAAv+EBBCR7X3SetQgxaqLWO87UZeQZdpYekZCSirqerAiMi1txYad5vgOxHFMrVtmCOHFOD6iUghKBo9R1pOqK/aQ1mBlZvp2f+LpaxyWMWwNLJm9rLouUB2N7k6f5Ij1A9EHQZMG+BNIuEI0+Jeo4gBnWAGpSDEpWLmS5ShyeddW5nmoZcZSrZ5KtmpQsq66kHpGNYKi/po+8mCu8vb6/sLHCw8fLuJx0s7Srz8kNzpzLyBGlsMWq0ZHbgL3Yxs/aqcmtsdTq6KWYg+jW2uXVrtTgcfiam7mRbCBOvGyr/PIg9VwBgBRrhSYLAWQnvhCjK0NaKKQ4dxCPY51kTCxVwvXCZi7LhRI0eJIevg8DjS4sKKJ0vmeViP4sBiMg/WVHhzlL5R/ngCvNdTUlAKBQAAIfkEBSIAAAAsAQADAFYAGQCBAAAALjRAO0JSAAAAAv+ELWIR559WezQCRqu6Mx+LVcjUZZtAesi4qMCZqnB7fQ1Kg/Yb6yxee206OODEx0sGc8OdEdH89aLJp5BWnWKpJtayqyyJwq4ZKoG2KFubILLWPnJvBzkWXodK0IG0+7Wk0CCmIPhRQwhIhAiheDgIwXeWAPlAt5VxGZgJiEmhubggifZ1yJY3VupyemeKt5XG19nmErrqQKtiW/tx1vebeys83Hi7a+k7SbzM3LyaDOwsPc0MbF1MHCesfRv8/MtwRu3B/TyObG11LCJWtuneLsMRzhCieo6/Eu8wCF7fVgSMQFzyUqXSxI+DL3rBDK349MhVQn0SUTl6aElhvXBewkKo0WVnlUdvlkJK2LgRY8YLJ3ixVAnxZScPJFqeRDkoio8+Mt1E4cmTCQ2g3HYKKvozzlFURnuGrOlUTxCiTJNG7RSU5FCbNEXBXJnVZdhPJkFKrVWWZtpMaw0UAAAh+QQFIgAAACwBAAMAVgAZAIEAAAAuNEA7QlIAAAAC/4R/IhaBnxZoECrmKroza8N5jyRkogWaH0CqX8uscJg4ZcxK3n1PoF5juWgpIY5ovNmGwGIvg+Qxccmpz2mFuj... /* and so on */
.badge-1{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAAAfCAYAAABjyArgAAAAAXNSR0IArs4c6QAAAixJREFUaIHtWVFuwzAIxVMv0vsfKkfZvpgsCrxHjBVt8pOqdTEGggnwUpGDrRgiIt/v9/fTjvxHjOsaInICvAMa069ocf54G+13dM3Th3TP8plsBuTvbnwEWJ0Y1zU0xdlAemusPrtf5X8fs0U89ZS6GTzflHeDc9AYI0jfblT97cSLEfIciwI/rmtUsiWS9YKykoVPBFckCLAGKto0B3HV8SiA6FCrwX4qiz9KhFcnvWZn5eyhRM0FHd4OVOp/N9IaPAeWLRP2utXFBFefEO9gV/BUmThz8Aakc/BBHz6aXJTN3nSAGlQmr+uocXm6vD2zXFQKGB+9e7X27F5Yelh2FrEpNGplehkSg0gNw9YsK0Q2siaN7ntee6xEdEwTKJjRE7TCEKvTSFuAuzs+qz8qIfpZ8QnZZA6JYnLWqDWUGWMeIyabWeLTCVR7GZQzmH0Jk73k8daquFNiOt+ssbbLGRwZ8zLbZjiiwlX9ESJfEHFi9ERNOdV3iMZ9oEnoEI0GZNkbBjibA+336tzKyup6NHZ51xn9jDw7X6NSQ2dwNTAdyJqh1r1oLfKR9bvrPXT4m9z8N5sCor0MGNmsUWZ7ssZTGesqTdFDmMFWIfpfnWEd6WJyiAwwNjPmt+oj/bLHKxHRII7QEVyRmAgg20gPkq8A/ug5G7Hz7cpcy8raRrNCTNR2JRF0zx2bIgWi4ZWI3Y0uIwd3iMudg235FeQQjX5oTF/2wsHBn8IPBK3Yniql8jMAAAAASUVORK5CYII=) no-repeat 0 0}
/* and so on */
```

Configs like:
```json
{
    "badges": [
      { // Fetch from site
        "url": "https://example.com/assets/example.png",
        "href": "https://example.com",
        "alt": "example.com",
        "file": "1.png"
      },
      { // Grab locally
        "href": "https://test.com",
        "alt": "test.com",
        "local": "../img/test.com",
        "file": "2.png"
      },
    ]
```
Then the generator based on the config inserts them as buttons

Applies the image as a style
![[base64style.webp]]

# The profit:
We grab all images at once with one request.
![[imgs_in_css.webp]]
*the "data:" lines are not requests, that's the process of decoding base64 into an image/gif locally.*

1http req & 1rtt for the main site

1http req & 1rtt for banners *(if there are more than 10 we'll probably go to 2rtt, but it won't affect speed much)*

We get a total of two requests.

The downside is that the images themselves weigh a bit more, and if we have like a hundred of them, it all becomes pointless.
