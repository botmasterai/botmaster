---
date: 2016-10-25T22:21:03+01:00
title: one
---

## Quick start
(Go to [Getting set up](#getting-set-up) to see how to get all the required credentials)
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
    landingPageURL: 'YOUR landing page URL' // users will be redirected there after adding your bot app to slack. If not set, they will go straight to their slack account
  },
  webhookEndpoint: '/webhook',
  storeTeamInfoInFile: true,
};

const botsSettings = [{ telegram: telegramSettings },
                      { messenger: messengerSettings },
                      { twitter: twitterSettings },
                      { slack: slackSettings }];

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
