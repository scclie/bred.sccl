---
title: "Пихаем 88x31 картинки в CSS"
description: "Оптимизируем загрузку картинок на сайте. Грузим base64 картинки через стиль."
lang: ru
tags:
- "#it"
- "#shitpost"
- "#web"
date: 2026-07-23
---

# Ну и нахуй всё это?

Т.к. я стремлюсь к максимальной быстроте загрузке [своего сайта](https://sccl.cc/) - я стараюсь его держать в рамках 1rtt (подробнее в [[/ru/it/14kb-cap.md]])
К тому же с этого я получаю ещё и бенефит в виде обхода расиянских ТСПУ, т.к. первый пакет ими не ловится.
Но мне захотелось добавить баннеры-переходы на другие сайты - как быть?

# Чо обычно делают?
У бол-ва обычно это выглядит как дохуя http запросов по одному на каждую картинку 

![[88x31_http_requests.webp]]

Что звучит максимально хуёво.

Благо бол-во таки не пихают hotlink, и хостят сами эти картинки.
*ато ваще пиздец бы был*

Может,  даже кто-то делает это автоматически.

# Как захотелось мне?
Т.к. сайт у меня в 1http request 1rtt - нужно чота придумывать.

Ясен хуй пихнуть всё картнки при расширении так же в 1rtt мы не сможем, т.ч. тупа inlinить нельзя. Но ведь можо пихать все картинки в CSS в виде base64 и подргружать их одним http запросом!

# Делаем.
Сам же CSS генерится при билде - фетчатся все актуальные баннеры на основе конфига пихаются в CSS в формате base64.

Типа так:
```css
.badge{display:inline-block;width:88px;height:31px;image-rendering:pixelated;image-rendering:crisp-edges}
.badge-0{background:url(data:image/gif;base64,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) no-repeat 0 0}
.badge-1{background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAAAfCAYAAABjyArgAAAAAXNSR0IArs4c6QAAAixJREFUaIHtWVFuwzAIxVMv0vsfKkfZvpgsCrxHjBVt8pOqdTEGggnwUpGDrRgiIt/v9/fTjvxHjOsaInICvAMa069ocf54G+13dM3Th3TP8plsBuTvbnwEWJ0Y1zU0xdlAemusPrtf5X8fs0U89ZS6GTzflHeDc9AYI0jfblT97cSLEfIciwI/rmtUsiWS9YKykoVPBFckCLAGKto0B3HV8SiA6FCrwX4qiz9KhFcnvWZn5eyhRM0FHd4OVOp/N9IaPAeWLRP2utXFBFefEO9gV/BUmThz8Aakc/BBHz6aXJTN3nSAGlQmr+uocXm6vD2zXFQKGB+9e7X27F5Yelh2FrEpNGplehkSg0gNw9YsK0Q2siaN7ntee6xEdEwTKJjRE7TCEKvTSFuAuzs+qz8qIfpZ8QnZZA6JYnLWqDWUGWMeIyabWeLTCVR7GZQzmH0Jk73k8daquFNiOt+ssbbLGRwZ8zLbZjiiwlX9ESJfEHFi9ERNOdV3iMZ9oEnoEI0GZNkbBjibA+336tzKyup6NHZ51xn9jDw7X6NSQ2dwNTAdyJqh1r1oLfKR9bvrPXT4m9z8N5sCor0MGNmsUWZ7ssZTGesqTdFDmMFWIfpfnWEd6WJyiAwwNjPmt+oj/bLHKxHRII7QEVyRmAgg20gPkq8A/ug5G7Hz7cpcy8raRrNCTNR2JRF0zx2bIgWi4ZWI3Y0uIwd3iMudg235FeQQjX5oTF/2wsHBn8IPBK3Yniql8jMAAAAASUVORK5CYII=) no-repeat 0 0}
/* ну и т.д. */
```

Кофги вида:
```json
{
    "badges": [
      { // Фетчить с сайта
        "url": "https://example.com/assets/example.png",
        "href": "https://example.com",
        "alt": "example.com",
        "file": "1.png"
      },
      { // Хряпать локально
        "href": "https://test.com",
        "alt": "test.com",
        "local": "../img/test.com",
        "file": "2.png"
      },
    ]
```
Дальше генератор на основе конфига вставляет их как кнопки

Применяяет картинку как стиль
![[base64style.webp]]

# Профит:
Хапаем сразу все картинки одним запросом.
![[imgs_in_css.webp]]
*строки "data:" не являются запросами, это процесс дешифровки base64 в картинку/гифку, который происходит локально.*

1http req & 1rtt на основной сайт

1http req & 1rtt на баннеры *(если их станет больше 10, то скорее уйдём на 2rtt, но на скорость это сильно не повлияет)*

Получаем всего два запроса.

Из минусов - сами картинки весят чуть больше, если у нас их будет условно сотня, то всё это уже безсмысленно.
