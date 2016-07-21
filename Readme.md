Bot framework
---

This is a lightweight bot framework that can be used for creating bots on a variety of different platforms. 

## hot so use botmaster
```js
const botmaster = new Botmaster(botsSettings, app);

botmaster.on('update', (bot, update) => {
  bot.sendMessage({
    recipient: {
      id: update.sender.id,
    },
    message: {
      text: 'Well right back at you!',
    },
  });
});
```

As you can see here, the Botmaster constructor takes two arguments, botsSettings and app. Here is a full example with the arguments set for a simple bot

## how to use (speaking with both a telegram and a messenger bot)
```js
const express = require('express');
const app = express();
const port = 3000;

const Botmaster = require('botmaster');

const telegramSettings = {
  credentials: {
    authToken: process.env.TELEGRAM_TEST_TOKEN,
  },
  // !! botmaster will mount your webhooks on /<botType>/webhookEndpoint.
  // so in this case, it will mount it on: /telegram/webhook1234.
  // If using localtunnel as specified below the whole path will be:
  // https://botmastersubdomain.localtunnel.me/telegram/webhook1234/
  webhookEndpoint: '/webhook1234/',
};

const messengerSettings = {
  credentials: {
    verifyToken: process.env.MESSENGER_VERIFY_TOKEN,
    pageToken: process.env.MESSENGER_PAGE_TOKEN,
    fbAppSecret: process.env.FACEBOOK_APP_SECRET,
  },
  webhookEndpoint: '/webhook1234/',
};

const botsSettings = [{ telegram: telegramSettings },
                      { messenger: messengerSettings }];

const botmaster = new Botmaster(botsSettings, app);

botmaster.on('update', (bot, update) => {
  bot.sendMessage({
    recipient: {
      id: update.sender.id,
    },
    message: {
      text: 'Well right back at you!',
    },
  });
});

console.log(`Loading App`);
// start server on the specified port and binding host
app.listen(port, '0.0.0.0', () => {
  // print a message when the server starts listening
  console.log(`Running App on port: ${port}`);
});
```

See the examples folder for examples on how to use botmaster


## You will need to set up the a bot on telegram. See this page:
https://core.telegram.org/bots for an intro;
https://core.telegram.org/bots/api for all the doc.

## For the facebook Messenger bot, follow this guide to set up the bot:
https://developers.facebook.com/docs/messenger-platform/quickstart


## Dealing with webhooks on local machine:

Simply install localtunnel on local machine

```bash
npm install -g localtunnel
```

Then run the localtunnel with a predetermined subdomain. e.g:

```bash
lt -p 3000 -s botmastersubdomain //for example
```

-l is for the localhost we want to point to. -p is the port and -s is the subdomain we want.
In this case, your url will be: http://botmastersubdomain.localtunnel.me.

So if you specified messenger's webhook endpoint to, say, /messenger/webhook1234/, you will have to set up the webhook for your demo app at:

https://botmastersubdomain.localtunnel.me/messenger/webhook1234/
(localtunnel provides both an http and https url. But messenger requires an https one)
