---
chapter: false
date: 2016-10-29T19:25:10+01:00
icon: <i class="fa fa-home" aria-hidden="true"></i>
next: /getting-started
title: Botmaster v 2.2.2
weight: 0
---

## What is botmaster?

Botmaster is a lightweight highly extendable, highly configurable chatbot framework. It was meant to be used both in small scale and large scale projects. Its purpose is to integrate your chatbot into a variety of messaging channels - currently Facebook Messenger, Slack, Twitter DM, Telegram and socket.io. Using botmaster looks something like this:

```js
const Botmaster = require('botmaster');
const config = require('./config');
const botsSettings = [{ telegram: config.telegramSettings },
                      { messenger: config.messengerSettings },
                      { twitter: config.twitterSettings },
                      { slack: config.slackSettings }];

const botmasterSettings = { botsSettings };

const botmaster = new Botmaster(botmasterSettings);

botmaster.on('update', (bot, update) => {
  bot.reply(update, 'Right back at you!');
});
```

## Botmaster is platform agnostic

Botmaster is platform agnostic in two important ways. Firstly, out of the box, developers can have bots running on Facebook Messenger, Slack, Twitter DM, Telegram and their personal webapp/app via socket.io with not only a standardized text message format, but also a standardized attachment format. Secondly, BotMaster makes no assumptions about the back-end bot itself - you can write code that allows BotMaster to call conversational engines such as IBM Watson's conversation API, open source frameworks or even write the conversation engine yourself.

## Botmaster's Philosophy

Its philosophy is to minimise the amount of code developers have to write in order to create 1-on-1 conversational chatbots that work on multiple platforms. It does so by defining a standard with respect to what format messages take and how 1-on-1 conversations occur. Messages to/from the various messaging channels supported are all mapped onto this botmaster standard, meaning the code you write is much reduced when compared to a set of point:point integrations.
