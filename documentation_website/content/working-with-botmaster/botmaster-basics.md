---
date: 2016-11-04T01:31:15Z
next: /working-with-botmaster/path
prev: /working-with-botmaster
title: Botmaster Basics
toc: true
weight: 10
---

Hopefully, by now you've gathered your credentials for at least one platform and got some basic bot running. We remember from the [quickstart](/getting-started/quickstart) and the various Setup guides in [getting-started](/getting-started) that we can start our botmaster server like this:

```js
const Botmaster = require('botmaster');
.
. // full settings object omitted for brevity
.
const botsSettings = [{ messenger: messengerSettings },
                      { twitter: twitterSettings },
                      { telegram: telegramSettings }];

const botmasterSettings = {
  botsSettings: botsSettings,
  // by default botmaster will start an express server that listens on port 3000
  // you can pass in a port argument here to change this default setting:
  port: 3001
}

const botmaster = new Botmaster(botmasterSettings);
```

### Settings

The `botmasterSettings` object has the following parameters:

| Parameter | Description
|--- |---
| botsSettings | An `array` of platform specific settings. See [Getting set up](#getting-set-up) for more info on that
| port  | (__optional__) The port to use for your webhooks (see [webhooks](#webhooks) to understand more about webhooks). This will only be used if the `app` parameter is not provided. Otherwise, it will be ignored
| app  | (__optional__) An `express.js` app object to mount the `webhookEnpoints` onto. If you choose to do this, it is assumed that you will be starting your own express server and this won't be done by Botmaster.
| server | (__optional__) an `http` server object. It can be accessed via `botmaster.server` once instantiated. If passed and using socket.io. This server object will be used as the socker.io server.

{{% notice info %}}
Please note, if you are passing in an app object to the settings, it is assumed that you are dealing with anything realating to
{{% /notice %}}

### Events

Botmaster is built on top of the EventEmitter node.js class. Which means it can emit events and most importantly for us here, it can listen onto them. By doing the following:

```js
botmaster.on('update', (bot, update) => {
  console.log(bot.type);
  console.log(update);
});

botmaster.on('server running', (message) => {
  console.log(message);
});

botmaster.on('error', (bot, err) => {
  console.log(bot.type);
  console.log(err.stack);
});

botmaster.on('warning', (bot, warning) => {
  console.log(warning);
});
```

I am registering four new listeners onto the botmaster object. One that listens for any updates that come in and one that listens for any potential error that might occur when receiving updates. The `update` events is of course the one you will want to focus most of your attention onto. You see here that every `update` event will come with a `bot` and an `update` object as arguments. This will always be the case. In general, the updates are standardized as well as the methods to use from the bot object (i.e. sending a message).

### Bot object

Every Botmaster instance will have a list of bots that can be accessed by calling: `botmaster.bots` assuming your Botmaster instance is named 'botmaster'.

Bot instances can be accessed through that array or more commonly, directly within an `update` event. Because you might want to act differently on bots of a certain type or log information differently based on type, every bot comes with a `bot.type` parameter that is one of: `messenger`, `twitter` or `telegram` (for now). Use these to write more platform specific code (if necessary).

I'll note quickly that each bot object created comes from one of the `TelegramBot`, `MessengerBot` or `Twitterbot` classes. They act in the same way on the surface (because of heavy standardization), but have a few idiosynchrasies here and there.

You can also create bot objects directly from their base classes. Here is an example of creating a twitter bot.

```js
const TwitterBot = require('botmaster').botTypes.TwitterBot;

const twitterSettings = {
    consumerKey: 'YOUR consumerKey',
    consumerSecret: 'YOUR consumerSecret',
    accessToken: 'YOUR accessToken',
    accessTokenSecret: 'YOUR accessTokenSecret',
  }
}

twitterBot = new TwitterBot(twitterSettings);
```

All bot items are also of the EventEmitters class. So you will be able to do something like this:

```js
twitterBot.on('update', (update) => {
  console.log(update);
})
```

The update object will be of the same format as the ones you'll get using `botmaster.on('update', ...)`.

If for some reason you created a bot this way but now want it to be in a botmaster object, you can do this easily this way:

```js
botmaster.addBot(twitterBot);
```
This is important if you create your own Bot that extends the `Botmaster.botTypes.BaseBot` class. For instance, you might want to create your own class that supports your pre-existing messaging standards. Have a look at the [writing_a_botmaster_supported_bot-class.md](writing_a_botmaster_supported_bot_class_readme.md) file to learn how to do this.
