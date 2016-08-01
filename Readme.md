# Botmaster

Botmaster is an opinionated lightweight chatbot framework. Botmaster is platform agnostic, which means that in its current state, developers can have bots running on Facebook Messenger, Twitter DM and Telegram with just one integration.

Its purpose is to minimise the amount of code developers have to write in order to create a 1-on-1 conversational chatbot that works on multiple different platforms. It does so by defining a standard with respect to what format messages take and how 1-on-1 conversations occur.

## install

```bash
npm install --save botmaster
```

## Quick start
```js

// settings stuff
const Botmaster = require('botmaster');
const config = require('./tests/config.js')

const messengerSettings = {
  credentials: {
    verifyToken: 'YOUR verifyToken',
    pageToken: 'YOUR pageToken',
    fbAppSecret: 'YOUR fbAppSecret'
  },
  webhookEndpoint: '/webhook1234', // botmaster will mount this webhook on https://Your_Domain_Name/messenger/webhook1234
};

const twitterSettings = {
    consumerKey: 'YOUR consumerKey',
    consumerSecret: 'YOUR consumerSecret',
    accessToken: 'YOUR accessToken',
    accessTokenSecret: 'YOUR accessTokenSecret',
  }
}

const botsSettings = [{ messenger: messengerSettings },
                      { twitter: twitterSettings }];

const botmasterSettings = {
  botsSettings: botsSettings,
  // by default botmaster will start an express server that listens on port 3000
  // you can pass in a port argument here to change this default setting:
  port: 3001
}

const botmaster = new Botmaster(settings);

// actual code
botmaster.on('update', (bot, update) => {
  bot.sendMessage({
    recipient: {
      id: update.sender.id,
    },
    message: {
      text: 'Right back at you!', // yes, this bot doesn't really do anything smart
    },
  });
});

botmaster.on('error', (bot, err) => {
  console.log(err.stack);
  console.log('there was an error');
});
```

## Getting set up

As you can see here, the Botmaster constructor takes a botmasterSettings argument. 
This object is of the following form:

```js
botmasterSettings = {
  botsSettings: botsSettings, // see below for a definition of botsSettings
  app: app, // optional, an express app object if you are running your own server
  port: port, // optional, only used if "app" is not defined. Defaults t0 3000 in that case
  sessionStore: sessionStore // optional. Define if you will be dealing with sessions
}
```

botsSettings look something like what you saw in the quick start example:

```js
const botsSettings = [{ messenger: messengerSettings },
                      { twitter: twitterSettings },
                      { twitter: otherTwitterSettings }];
```

I.e. it is an array of single key objects. Where you specify the type as the key of each object and the settings is is the value. Here I show that you can define multiple bots of the same type at once (twitter ones in this example). As you surely guessed, each different platform will expect different credentials. So platform specific settings will differ.

### Getting set up with Messenger

We've seen a messenger settings object looks like:

const messengerSettings = {
  credentials: {
    verifyToken: 'YOUR verifyToken',
    pageToken: 'YOUR pageToken',
    fbAppSecret: 'YOUR fbAppSecret'
  },
  webhookEndpoint: '/webhook1234'
};

If you don't already have these, follow the steps **1-4** on the Facebook Messenger guide:
https://developers.facebook.com/docs/messenger-platform/quickstart

In step 2, where you setup your webhook, no need to code anything. Just specify the webhook, enter any secure string you want as a verify token and copy that value in the settings object.

If you are not too sure how webhooks work and/or how to get it to run locally, go to the section about webhooks.

### Getting set up with Telegram
https://core.telegram.org/bots for an intro.
https://core.telegram.org/bots/api for all the doc.

### Getting set up with Twitter

We've also seen a twitter settings object looks like:

const twitterSettings = {
    consumerKey: 'YOUR consumerKey',
    consumerSecret: 'YOUR consumerSecret',
    accessToken: 'YOUR accessToken',
    accessTokenSecret: 'YOUR accessTokenSecret',
  }
}

Twitter setup is slightly more cumbersome than the two other ones. Because in Twitter you have to create an actual account and not a page or a bot, you'll have to do a few more steps.

1. Setting up the bot account
   * Just create a standard account as you would any other. Name it as you want
   * navigate to your security and privacy settings (click on your image profile > settings > privacy and security settings)
   * scroll to the bottom of the page and make sure "Receive Direct Messages from anyone" is ticked. (currently this has to be done because of Twitter's rules concerning DMs, where in order to send a DM to someone, they have to be following you).

2. Setting up the app
  *  


## Message format

Standardization is at the heart of Botmaster. The framework was really created for that purpose. This means that messages coming from any platform have to have the same format.

In order to do that, the Facebook Messenger message format was chosen and adopted. This means that when your botmaster object receives an 'update' event from anywhere (twitter, telegram or Messenger as of this writing), you can be sure that it will be of the same format as a similar message that would come from Messenger. 

### incoming messages
Typically, it would look something like this for a message with an image attachment. Independant of what platform the message comes from:

```js
{
  raw: <platform_specific_raw_update>,
  sender: {
    id: <id_of_sender>
  },
  recipient: {
    id: <id_of_the_recipent> // will typically be the bot's id
  },
  timestamp: <unix_miliseconds_timestamp>,
  message: {
    mid: <message_id>,
    seq: <message_sequence_id>,
    attachments: [
      {
        type: 'image',
        payload: {
          url: 'https://scontent.xx.fbcdn.net/v/.....'
        }
      }
    ]
  }
};
```

This allows developers to handle these messages in on place only rather than doing it in multiple ones.

### outgoing messages
...

### buttons
...

## sessions

## webhooks

### On a local machine:

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


## Using Botmaster with your own express() object

Here's an example on how to do so:

```js
const express = require('express');
const app = express();
const port = 3000;

const Botmaster = require('botmaster');

const telegramSettings = {
  credentials: {
    authToken: process.env.TELEGRAM_TEST_TOKEN,
  },
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

const botmasterSettings = { 
  botsSettings: botsSettings,
  app: app,
}

const botmaster = new Botmaster(botmasterSettings);

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

## More examples

Checkout the examples folder for cool examples of how to use botmaster

