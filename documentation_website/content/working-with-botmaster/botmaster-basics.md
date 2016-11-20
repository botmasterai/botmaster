---
date: 2016-11-04T01:31:15Z
next: /working-with-botmaster/writing-your-own-bot-class
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

This event is thrown whenever an error internal to Botmaster occurs. I.e. if for some reason a misconfigured message was sent in. Or if some other kind of error occurred directly within Botmaster. It is good to listen onto this event and keep track of potential errors. Also, if you code an error within `botmaster.on`, and don't catch it, it will be caught by Botmaster and emitted in to `error`. So like this you have full control of what is going on and can log everything straight from there.

### Bot object

Bot objects are really the ones running the show in the Botmaster framework. Your `botmaster` object is simply a central point of control for you to manage all of your bots. Botmaster assumes that most of your bots will have a central bit of code that you don't want to have to replicate for every platform/bot instance. Which should make sense. To drive the point a little further, here is another [perfectly acceptable way] of starting botmaster.


```js
const Botmaster = require('botmaster');
const MessengerBot = Botmaster.botTypes.MessengerBot;
.
.
const botmaster = new Botmaster();
.
. // full settings objects omitted for brevity
.
const messengerBot = new MessengerBot(messengerSettings);
const slackBot = new SlackBot(slackSettings);
const twitterBot = new TwitterBot(twitterSettings);
const socketioBot = new SocketioBot(socketioSettings);
const telegramBot = new TelegramBot(telegramSettings);

botmaster.addBot(messengerBot);
botmaster.addBot(slackBot);
botmaster.addBot(twitterBot);
botmaster.addBot(socketioBot);
botmaster.addBot(telegramBot);
```

Although the point of botmaster is for developers to do something like this after declaring the botmaster instance:

```js
botmaster.on('update', (bot, update) => {
  // do stuff with your bot and update here
});
```

One can just as well do:

```js
messengerBot.on('upadte', (update) => {
  // do stuff with your messenger bot here
});

// this applies to all the bot objects that would have been declared separately.
```

The `update` object is the as the botmaster `update` one you would get from that bot. Of course, this code would only apply to your `messengerBot` instance and not the others.

As seen, bot instances can be accessed directly within an `update` event. Because you might want to act differently on bots of a certain type or log information differently based on type, every bot comes with a `bot.type` parameter that is one of: `messenger`, `slack`, `twitter`, `socketio`, `telegram` or whatever third-party bot class you might have installed or created.

It is important to note here, that you can have multiple bot objects for a certain type. I'm sure you can find reasons for why you would want to do this. This is important to mention, as you might have, say, 2 bots of type `messenger` dealt with via Botmaster. You might want to do platform specific code by doing the following:

```js
botmaster.on('update', (bot, update) => {
  if (bot.type === 'messenger' {
    // do messenger specific stuff
    return;
  })
})
```

Then you might want to do bot object specific code. You would do this as such:

```js
botmaster.on('update', (bot, update) => {
  if (bot.type === 'messenger' {
    // do messenger specific stuff
    if (bot.id === 'YOUR_BOT_ID') {// this will be the user id of bot for messenger
      // do bot object specific stuff
      return;
    }
  })
})
```

{{% notice warning %}}
Botmaster does not assure you that the `id` parameter of the `bot` object will exist upon instantiation. the `id` is only assured to be there once an update has been received by the bot. This is because some ids aren't known until botmaster knows 'who' [your bot] the message was sent to.
{{% /notice %}}

Or if you declared your bots and botmaster as in the beginning of this section, you might have done the following:

```js
const Botmaster = require('botmaster');
const botmaster = new Botmaster();
.
. // full settings objects omitted for brevity
.
const messengerBot1 = new MessengerBot(messengerSettings1);
const messengerBot2 = new MessengerBot(messengerSettings2);
const slackBot = new SlackBot(slackSettings);
const twitterBot = new TwitterBot(twitterSettings);

botmaster.addBot(messengerBot);
botmaster.addBot(slackBot);
botmaster.addBot(twitterBot);

botmaster.on('update', (bot, update) => {
  if (bot.type === 'messenger' {
    // do messenger bot specific stuff


    if (bot === messengerBot1) { // without using ids
      // do messengerBot1 specific stuff
    }
    return;
  })
})
```

If you want to perform bot object specific code, I recommend declaring your objects in this way rather than the standard way. If you want to perform platform specific way, the standard way is perfectly fine.

I'll note quickly that each bot object created comes from one of the various bot classes as seen above. They act in the same way on the surface (because of heavy standardization), but have a few idiosynchrasies here and there. You can read about them all in their own sections.

Also useful to note is that you can access all the bots added to botmaster by doing `botmaster.bots`. you can also use `botmastet.getBot` or `botmaster.getBots` to get a specific bot (using type or id);

It is important to note the `addBot` syntax as you can create your own Bot class that extends the `Botmaster.botTypes.BaseBot` class. For instance, you might want to create your own class that supports your pre-existing messaging standards. Have a look at the [working with a botmaster supported bot class ](working-with-botmaster/writing-a-botmaster-supported-bot-class-readme.md) documentation to learn how to do this.

## Message/Update format

Standardization is at the heart of Botmaster. The framework was really created for that purpose. This means that messages coming from any platform have to have the same format.

In order to do that, the **Facebook Messenger message format** was chosen and adopted. This means that when your botmaster object receives an 'update' event from anywhere, you can be sure that it will be of the same format as a similar message that would come from Facebook Messenger.

### Incoming update

Typically, it would look something like this for a message with an image attachment. Independent of what platform the message comes from:

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

This allows developers to handle these messages in one place only rather than doing it in multiple places. For more info on the various incoming messages formats, read the messenger bot doc on webhooks at: https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received.

Currently, you will only get updates for `Messages` (and not delivery, echo notification etc) for all platforms. On Messenger, it is assumed that you don't want to get updates for delivery, read and echo. This can't be turned on at the moment, but will be in later versions as it might be a requirement.

#### Note on attachment types and conversions
Attachment type conversion on incoming updates works as such for __Twitter__:

| Twitter Type | Botmaster conversion
|--- |---
| photo | image
| video  | video
| gif  | video

!!!Yes `gif` becomes a `video`. because Twitter doesn't actually use gifs the way you would expect it to. It simply loops over a short `.mp4` video.

Also, here's an important caveat for Twitter bot developers who are receiving attachments. Image links that come in from the Twitter API will be private and not public, which makes using them quite tricky. You might need to make authenticated requests to do so. The twitterBot objects you will receive in the update will have a `bot.twit` object. Documentation for how to use this is available [here](https://github.com/ttezel/twit).

Receiving and sending attachments [the Botmaster way] is not yet supported on **Slack** as of version 2.2.1. However, Slack supports url unfurling (meaning if you send images and other types of media this will be shown in the messages and users won't just see a url). Also, because of how Botmaster is built (don't throw any of the original information from the message away) you can find all the necessary information in the `update.raw` object of the update.

Attachment type conversion works as such for __Telegram__:

| Telegram Type | Botmaster conversion
|--- |---
| audio | audio
| voice  | audio
| photo  | image
| video  | video
| location  | location
| venue  | location

`contact` attachment types aren't supported in Messenger. So in order to deal with them in Botmaster, you will have to look into your `update.raw` object which is the standard Telegram update. You will find your contact object in `update.raw.contact`.

Also, concerning `location` and `venue` attachments. The url received in Botmaster for Telegram is a google maps one with the coordinates as query parameters. It looks something like this: `https://maps.google.com/?q=<lat>,<long>`

A few of you will want to use attachments with your `socket.io` bots. Because the Botmaster message standard is the Facebook Messenger one, everything is URL based. Which means it is left to the developer to store both incoming and outgoing attachments. A tutorial on how to deal with this will be up soon in the [Tutorials](/tutorials) section.

### Outgoing messages

Again, outgoing messages are expected to be formatted like messages the Messenger platform would expect. They will typically look something like this for a text message:

```js
const message = {
  recipient: {
    id: update.sender.id,
  },
  message: {
    text: 'Some arbitrary text of yours'
  },
}
```

and you would use this as such in code:

```js
botmaster.on('update', (bot, update) => {
  const message = {
    recipient: {
      id: update.sender.id,
    },
    message: {
      text: 'Some arbitrary text of yours'
    },
  };
  bot.sendMessage(message);
});
```

As you can see, the `sendMessage` method used is used directly from the bot object and not using the botmaster one.

Because you might not always want to code in a complex json object just to send in a simple text message or photo attachment, Botmaster comes with a few helper methods that can be used to send messages with less code:

`bot.sendMessageTo`

| Argument | Description
|--- |---
| message | an object without the recipient part. In the previous example, it would be `message.message`.
| recipientId  | a string representing the id of the user to whom you want to send the message.

`bot.sendTextMessageTo`

| Argument | Description
|--- |---
| text | just a string with the text you want to send to your user
| recipientId  | a string representing the id of the user to whom you want to send the message.

Typically used like so to send a text message to the user who just spoke to the bot:

```js
botmaster.on('update', (bot, update) => {
  bot.sendTextMessageTo('something super important', update.sender.id);
});
```

`bot.reply`

| Argument | Description
|--- |---
| update | an update object with a valid `update.sender.id`.
| text  | just a string with the text you want to send to your user

This is is typically used like so:

```js
botmaster.on('update', (bot, update) => {
  bot.reply(update, 'something super important!');
});
```

#### Attachments

`bot.sendAttachmentTo`

We'll note here really quickly that Messenger only takes in urls for file attachment (image, video, audio, file). Most other platforms don't support sending attachments in this way. So we fall back to sending the url in text which really results in a very similar output. Same goes for Twitter that doesn't support attachments at all.

| Argument | Description
|--- |---
| attachment | a valid Messenger style attachment. See [here](https://developers.facebook.com/docs/messenger-platform/send-api-reference) for more on that.
| recipientId  | a string representing the id of the user to whom you want to send the message.

This is the general attachment sending method that will always work for Messenger but not necessarily for other platforms as Facebook Messenger supports all sorts of attachments that other platforms don't necessarily support. So beware when using it. To assure your attachment will be sent to all platforms, use `bot.sendAttachmentFromURLTo`.

This is typically used as such for sending an image url.

```js
botmaster.on('update', (bot, update) => {
  const attachment = {
    type: 'image'
    payload: {
      url: "some image url you've got",
    },
  };
  bot.sendAttachment(attachment, update.sender.id);
});
```

`bot.sendAttachmentFromURLTo`

Just easier to use this to send standard url attachments. And URL attachments if used properly should work on all out-of-the-box platforms:

| Argument | Description
|--- |---
| type | string representing the type of attachment (audio, video, image or file)
| url  | the url to your file
| recipientId  | a string representing the id of the user to whom you want to send the message.

This is typically used as such for sending an image url.

```js
botmaster.on('update', (bot, update) => {
  bot.sendAttachment('image', "some image url you've got", update.sender.id);
});
```

#### Status

`bot.sendIsTypingMessageTo`

To indicate that something is happening on your bots end, you can show your users that the bot is 'working' or 'typing' something. to do so, simply invoke sendIsTypingMessageTo.

| Argument | Description
|--- |---
| recipientId  | a string representing the id of the user to whom you want to send the message.

It is used as such:

```js
botmaster.on('update', (bot, update) => {
    bot.sendIsTypingMessageTo(update.sender.id);
});
```

It will only send a request to the platforms that support it. If unsupported, nothing will happen.


#### Buttons

Buttons will almost surely be part of your bot. Botmaster provides a method that will send what is assumed to be a decent way to display buttons throughout all platforms.

`bot.sendDefaultButtonMessageTo`

| Argument | Description
|--- |---
| buttonTitles | array of button titles (no longer than 10 in size).
| recipientId  | a string representing the id of the user to whom you want to send the message.
| textOrAttachment  | (__optional__) a string or an attachment object similar to the ones required in `bot.sendAttachmentTo`. This is meant to provide context to the buttons. I.e. why are there buttons here. A piece of text or an attachment could detail that. If not provided,  text will be added that reads: 'Please select one of:'.

The function defaults to sending `quick_replies` in Messenger, setting `Keyboard buttons` in Telegram, buttons in Slack and simply prints button titles one on each line in Twitter as it doesn't support buttons. The user is expecting to type in their choice in Twitter. In the socketio implementation, the front-end/app developer is expected to write the code that would display the buttons on their front-end.

## Using Botmaster with your own express() app

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
