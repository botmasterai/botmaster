---
date: 2016-10-31T22:24:20Z
next: /getting-started/slack-setup
prev: /getting-started/getting-set-up
title: Facebook Messenger Setup
toc: true
weight: 40
---

## Code

```js
const Botmaster = require('botmaster');

const messengerSettings = {
  credentials: {
    verifyToken: 'YOUR verifyToken',
    pageToken: 'YOUR pageToken',
    fbAppSecret: 'YOUR fbAppSecret',
  },
  webhookEndpoint: '/webhook1234',
};

const botsSettings = [{ messenger: messengerSettings }];

const botmaster = new Botmaster({ botsSettings });

botmaster.on('update', (bot, update) => {
  bot.reply(update, 'Right back at you');
});
```

## Getting your Credentials

If you don't already have these, follow the steps **1-4** on the Facebook Messenger guide:
https://developers.facebook.com/docs/messenger-platform/guides/quick-start

In **step 2**, where you setup your webhook, no need to code anything. Just specify the webhook, enter any secure string you want as a verify token(`verifyToken`) and copy that value in the settings object. Also, click on whichever message [those are "update"s using botmaster semantics] type you want to receive from Messenger (`message_deliveries`, `messages`, `message_postbacks` etc...).

To find your Facebook App Secret (`fbAppSecret`), navigate to your apps dashboard and under `App Secret` click show, enter your password if prompted and then there it is.

## Webhooks

{{% notice note %}}
If you are not too sure how webhooks work and/or how to get them to run locally, go to [webhooks](/getting-started/webhooks) to read some more.
{{% /notice %}}
