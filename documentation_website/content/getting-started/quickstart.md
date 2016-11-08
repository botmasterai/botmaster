---
date: 2016-10-31T21:39:47Z
prev: /getting-started/installation
next: /getting-started/getting-set-up
title: Quickstart
toc: true
weight: 20
---

If you already know your credentials for the platforms you want to be supporting in your project the following code will help you get started

```js

// settings stuff
const Botmaster = require('botmaster');

const messengerSettings = {
  credentials: {
    verifyToken: 'YOUR verifyToken',
    pageToken: 'YOUR pageToken',
    fbAppSecret: 'YOUR fbAppSecret',
  },
  webhookEndpoint: '/webhook1234', // botmaster will mount this webhook on https://Your_Domain_Name/messenger/webhook1234
};

const twitterSettings = {
  credentials: {
    consumerKey: 'YOUR consumerKey',
    consumerSecret: 'YOUR consumerSecret',
    accessToken: 'YOUR accessToken',
    accessTokenSecret: 'YOUR accessTokenSecret',
  }
}

const telegramSettings = {
  credentials: {
    authToken: 'YOUR authToken',
  },
  webhookEndpoint: '/webhook1234/',
};

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

const socketioSettings = {
  id: 'SOME_ID_OF_YOUR_CHOOSING',
};

const botsSettings = [{ telegram: telegramSettings },
                      { messenger: messengerSettings },
                      { twitter: twitterSettings },
                      { slack: slackSettings },
                      { socketio: socketioSettings }];

const botmasterSettings = {
  botsSettings: botsSettings,
  // by default botmaster will start an express server that listens on port 3000
  // you can pass in a port argument here to change this default setting:
  port: 3001,
}

const botmaster = new Botmaster(botmasterSettings);

// actual code
botmaster.on('update', (bot, update) => {
  bot.sendTextMessageTo('Right back at you!', update.sender.id);
});

botmaster.on('error', (bot, err) => {
  console.log(err.stack);
  console.log('there was an error');
});
```
