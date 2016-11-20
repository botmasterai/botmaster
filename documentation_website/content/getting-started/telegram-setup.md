---
date: 2016-11-04T01:04:24Z
next: /getting-started/webhooks
prev: /getting-started/twitter-setup
title: Telegram Setup
toc: true
weight: 80
---

## Code

```js

const Botmaster = require('botmaster');

const telegramSettings = {
  credentials: {
    authToken: 'YOUR authToken',
  },
  webhookEndpoint: '/webhook1234/',
};

const botsSettings = [{ telegram: telegramSettings }];

const botmaster = new Botmaster({ botsSettings });

botmaster.on('update', (bot, update) => {
  bot.reply(update, 'Right back at you');
});
```

## Credentials

All you need here is an authToken. In order to get one, you will need to either create a new bot on telegram.

Basically, you'll need to send a `/newbot` command(message) to Botfather (go talk to him [here](https://web.telegram.org/#/im?p=@BotFather)). Once you're done with giving it a name and a username, BotFather will come back to you with your authToken. Make sure to store it somewhere. More info on BotFather can be found [here](https://core.telegram.org/bots#create-a-new-bot ) if needed.

For more on Telegram, you can find the telegram api docs [here](https://core.telegram.org/bots/api)

## Webhooks

Setting up your webhook requires you to make the following request outside of Botmaster (using curl for instance or a browser):


```http
https://api.telegram.org/bot<authToken>/setWebhook?url=<'Your Base URL'>/telegram/webhook1234
```

{{% notice warning %}}
Because Telegram doesn't send any type of information to verify the identity of the origin of the update, it is highly recommended that you include a sort of hash in your webhookEndpoint. I.e., rather than having this: `webhookEndpoint: '/webhook/'`, do something more like this: `webhookEndpoint: '/webhook92ywrnc9qm4qoiuthecvasdf42FG/'`. This will assure that you know where the request is coming from.
{{% /notice %}}


{{% notice note %}}
If you are not too sure how webhooks work and/or how to get them to run locally, go to [webhooks](/getting-started/webhooks) to read some more.
{{% /notice %}}
