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
const botsSettings = [{ telegram: telegramSettings },
                      { messenger: messengerSettings },
                      { twitter: twitterSettings },
                      { slack: slackSettings },
                      { socketio: socketioSettings }];

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
| botsSettings | An `array` of platform specific settings. See [Quickstart](/getting-started/quickstart) to see an example of those and the various setup guides in [Getting started](/getting-started) to see how to get started with the various platforms.
| port  | (__optional__) The port to use for your webhooks (see [webhooks](#webhooks) to understand more about webhooks). This will only be used if the `app` parameter is not provided. Otherwise, it will be ignored
| app  | (__optional__) An `express.js` app object to mount the `webhookEnpoints` onto. If you choose to do this, it is assumed that you will be starting your own express server and this won't be done by Botmaster. Unless you also specify a `server` parameter, `botmaster.server` will be `null`
| server | (__optional__) an `http` server object. It can be accessed via `botmaster.server` once instantiated. If passed and using socket.io. This server object will be used as the socker.io server.

{{% notice info %}}
Please note, if you are passing in an `app` object to the settings, it is assumed that you are dealing with anything relating to your http server. That is start listening, closing it if necessary etc.
{{% /notice %}}

{{% notice warning %}}
If using socket.io (`socketio`), you will need to either define BOTH an `app` object and its corresponding `server` object in the settings. Or if you would rather botmaster manage this for you, you can define none of them. Alternatively, if you want, say, to have a different http server for your main botmaster app and for socket.io, you can do something like this:
```js
.
.
const socketioSettings = {
  id: 'SOME_ID_OF_YOUR_CHOOSING',
  server: 'SOME_HTTP_SERVER_OF_YOURS', // this server can't run on port 3000 in this example
};

const botsSettings = [{ telegram: telegramSettings },
                      { messenger: messengerSettings },
                      { twitter: twitterSettings },
                      { slack: slackSettings },
                      { socketio: socketioSettings }];

const botmasterSettings = {
  botsSettings: botsSettings,
}

const botmaster = new Botmaster(botmasterSettings);
```
In this example, a server will be started under the hood by botmaster using your express. This http server will be a different one from the one used in
{{% /notice %}}

### Events

Botmaster is built on top of the EventEmitter node.js class. Which means it can emit events and most importantly for us here, it can listen onto them. By doing any of the following:

```js
botmaster.on('server running', (message) => {
  console.log(message);
});

botmaster.on('update', (bot, update) => {
  console.log(bot.type);
  console.log(update);
});

botmaster.on('error', (bot, err) => {
  console.log(bot.type);
  console.log(err.stack);
});
```

These are the only four listeners that you can listen onto in botmaster. Let's go though them briefly:

#### server running

This event will be emitted only if you are not managing your own server (i.e. you started botmaster without setting the `app` parameter). It is just here to notify you that the server has been started. You don't necessarily need to use it. But you might want to do things at this point.

#### update

This is really where all the magic happens. Whenever a message (update in Botmaster semantic) is sent into your application. Botmaster will parse it and format it into its [FB Messenger] standard. Along with it, you will get a `bot` object which is the underlying object into which the message was sent. Note that the updates are standardized as well as the methods to use from the bot object (i.e. sending a message). Read further down to see how those two objects work.

#### error

This event is thrown whenever an error internal to botmaster occurs. I.e. if for some reason a misconfigured message was sent in. Or if some other kind of error occured directly within Botmaster. It is good to listen onto this event and keep track of potential errors. Also, if you code an error within `botmaster.on`, and don't catch it, it will be caught by botmaster and emitted in to `error`. So like this you have full control of what is going on and can log everything straight from there.

### Bot object

Bot objects are really the ones running the show in the Botmaster framework. Your `botmaster` object is simply a central point of control for you to manage all of your bots. Botmaster simply assumes that most of your bots will have a central bit of code that you don't want to have to replicate for every platform/bot instance. Which should make sense. To drive the point a little further, here is another [perfectly acceptable way] of starting botmaster.


```js
const Botmaster = require('botmaster');
.
. // full settings object omitted for brevity
.
const botsSettings = [{ telegram: telegramSettings },
                      { messenger: messengerSettings },
                      { twitter: twitterSettings },
                      { slack: slackSettings },
                      { socketio: socketioSettings }];

const botmasterSettings = {
  botsSettings: botsSettings,
  // by default botmaster will start an express server that listens on port 3000
  // you can pass in a port argument here to change this default setting:
  port: 3001
}

const botmaster = new Botmaster(botmasterSettings);
```

Bot instances can be accessed directly within an `update` event. Because you might want to act differently on bots of a certain type or log information differently based on type, every bot comes with a `bot.type` parameter that is one of: `messenger`, `slack`, `twitter`, `socketio` or `telegram`. Use these to write more platform specific code (if necessary).

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

Every Botmaster instance will have a list of bots that can be accessed by calling: `botmaster.bots` assuming your Botmaster instance is named 'botmaster'.

To get a bot object, you can either parse the `botmaster.bots` array yourself
