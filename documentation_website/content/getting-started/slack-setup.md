---
date: 2016-10-31T23:01:53Z
next: /next/path
prev: /prev/path
title: Slack setup
toc: true
weight: 50
---

If you want to build a Slack supported bot, you'll want to have code that looks something like this:

```js
const Botmaster = require('botmaster');

const slackSettings = {
  credentials: {
    clientId: 'YOUR app client ID',
    clientSecret: 'YOUR app client secret',
    verificationToken: 'YOUR app verification Token',
    landingPageURL: 'YOUR landing page URL' // users will be redirected there after adding your bot app to slack. If not set, they will be redirected to their standard slack chats.
  },
  webhookEndpoint: '/webhook',
  storeTeamInfoInFile: true,
};

const botsSettings = [{ slack: slackSettings }];

const botmaster = new Botmaster({ botsSettings });

botmaster.on('update', (bot, update) => {
  bot.reply(update, 'Right back at you');
});
```

The `slackSettings` object contains

The bit we haven't seen in the previous sections here is how to get the credentials. Here's how you do this for Messenger:

If you don't already have these, follow the steps **1-4** on the Facebook Messenger guide:
https://developers.facebook.com/docs/messenger-platform/quickstart

In **step 2**, where you setup your webhook, no need to code anything. Just specify the webhook, enter any secure string you want as a verify token(`verifyToken`) and copy that value in the settings object. Also, click on whichever message [those are "update"s using botmaster semantics] type you want to receive from Messenger (`message_deliveries`, `messages`, `message_postbacks` etc...).

To find your Facebook App Secret (`fbAppSecret`), navigate to your apps dashboard and under `App Secret` click show, enter your password if prompted and then there it is.

If you are not too sure how webhooks work and/or how to get them to run locally, go to [webhooks](/getting-started/webhooks) to read some more.
