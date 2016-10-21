# Botmaster

[![Build Status](https://travis-ci.org/jdwuarin/botmaster.svg?branch=master)](https://travis-ci.org/jdwuarin/botmaster)
[![Coverage Status](https://coveralls.io/repos/github/jdwuarin/botmaster/badge.svg?branch=master)](https://coveralls.io/github/jdwuarin/botmaster?branch=master)
[![Dependency Status](https://gemnasium.com/badges/github.com/jdwuarin/botmaster.svg)](https://gemnasium.com/github.com/jdwuarin/botmaster)
[![npm-version](https://img.shields.io/npm/v/botmaster.svg)](https://www.npmjs.com/package/botmaster)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](LICENSE)

Botmaster is a lightweight chatbot framework. Its purpose is to integrate your existing chatbot into a variety of messaging channels - currently Facebook Messenger, Twitter DM and Telegram.

Botmaster is platform agnostic in two important ways. Firstly, in its current state, developers can have bots running on Facebook Messenger, Twitter DM and Telegram - with just one integration. Secondly, BotMaster makes no assumptions about the back-end bot itself - you can write code that allows BotMaster to call conversational engines such as IBM Watson's conversation API, open source frameworks or even write the conversation engine yourself.

Its philosophy is to minimise the amount of code developers have to write in order to create a 1-on-1 conversational chatbot that works on multiple platforms. It does so by defining a standard with respect to what format messages take and how 1-on-1 conversations occur. Messages to/from the various messaging channels supported are all mapped onto this botmaster standard, meaning the code you write is much reduced when compared to a set of point:point integrations.

---
## Botmaster 2.0.0 Changes

In this new version, a lot of new things were added to Botmaster. A few others were removed.

### Breaking Changes
If you were using SessionStore in version 1.x.x, you won't be able to anymore in version 2.x.x. They have been scratched for the far more common middleware design pattern common in so many other frameworks (e.g. express). Middleware can be hooked into right before receiving an update and right before sending out a message. It fits ideally with people wanting to setup session storage at these points.

### Adding Slack
Support for Slack as the fourth channel supported by Botmaster has been added. Using the Events API, you can now send and receive messages on the platform.

### get User info
If the platform supports it and the bot class you are using supports it too, you can now use the `bot.getUserInfo` method to retrieve basic information on a user, including their name and profile pic.

### bug fixes
As with any release, a bunch of bugfixes were done.


---

## Install

```bash
npm install --save botmaster
```

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

## Getting set up

As you can see above, the Botmaster constructor takes a `botmasterSettings` argument.
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

I.e. it is an array of single key objects. Where you specify the type as the key of each object and the settings as the value. Here I show that you can define multiple bots of the same type at once (twitter ones in this example). As you surely guessed, each different platform will expect different credentials. So platform specific settings will differ.

### Getting set up with Messenger

We've seen a messenger settings object looks like:

```js
const messengerSettings = {
  credentials: {
    verifyToken: 'YOUR verifyToken',
    pageToken: 'YOUR pageToken',
    fbAppSecret: 'YOUR fbAppSecret',
  },
  webhookEndpoint: '/webhook1234',
};
```

If you don't already have these, follow the steps **1-4** on the Facebook Messenger guide:
https://developers.facebook.com/docs/messenger-platform/quickstart

In step 2, where you setup your webhook, no need to code anything. Just specify the webhook, enter any secure string you want as a verify token(`verifyToken`) and copy that value in the settings object. Also, click on whichever message [update] type you want to receive from Messenger (`message_deliveries`, `messages`, `message_postbacks` etc...).

To find your Facebook App Secret (`fbAppSecret`), navigate to your apps dashboard and under `App Secret` click show, enter your password if prompted and then there it is.

If you are not too sure how webhooks work and/or how to get them to run locally, go to [webhooks](#webhooks) to read some more.

### Getting set up with Telegram

We've seen a telegram settings object looks like:

```js
const telegramSettings = {
  credentials: {
    authToken: 'YOUR authToken',
  },
  webhookEndpoint: '/webhook1234/',
};
```

Which means all we need is an authToken. In order to get one, you will need to either create a new bot or include your authToken here.

Basically, you'll need to send a `/newbot` command(message) to Botfather (go talk to him [here](https://web.telegram.org/#/im?p=@BotFather)). Once you're done with giving it a name and a username, BotFather will come back to you with your authToken. Make sure to store it somewhere. More info on BotFather can be found [here](https://core.telegram.org/bots#create-a-new-bot ) if needed.

For more on Telegram, you can find the telegram api docs [here](https://core.telegram.org/bots/api)

Setting up your webhook requires you to make the following request outside of Botmaster (using curl for instance or a browser):

```http
https://api.telegram.org/bot<authToken>/setWebhook?url=<'Your Base URL'>/telegram/webhook1234
```

!!Because Telegram doesn't send any type of information to verify the identity of the origin of the update, it is highly recommended that you include a sort of hash in your webhookEndpoint. I.e., rather that having this: `webhookEndpoint: '/webhook/'`, do something more like this: `webhookEndpoint: '/webhook92ywrnc9qm4qoiuthecvasdf42FG/'`. This will assure that you know where the request is coming from.

If you are not too sure how webhooks work and/or how to get it to run locally, go to [webhooks](#webhooks) to read some more.

### Getting set up with Twitter

We've seen a twitter settings object looks like:

```js
const twitterSettings = {
  credentials: {
    consumerKey: 'YOUR consumerKey',
    consumerSecret: 'YOUR consumerSecret',
    accessToken: 'YOUR accessToken',
    accessTokenSecret: 'YOUR accessTokenSecret',
  }
}
```

Twitter's setup is slightly more tricky than the two other ones. Because Twitter requires you to create an actual account and not a page or a bot, you'll have to do a few more steps.

1. Setting up the bot account
   * Just create a standard account as you would any other. Name it as you want
   * navigate to your security and privacy settings (click on your image profile > settings > privacy and security settings)
   * scroll to the bottom of the page and make sure "Receive Direct Messages from anyone" is ticked. (currently this has to be done because of Twitter's rules concerning DMs, where in order to send a DM to someone, they have to be following you).

2. Setting up the app
   *  Navigate to the somewhat hard to find Twitter developer app dashboard at: https://apps.twitter.com/
   * Click Create New App. Enter your details (callback URL is not required if you are starting from scratch here). 'Website' can take in a placeholder like (http://www.example.com)
   * Now navigate straight to the 'Permissions' tab(do this before going to the 'Keys and Access Tokens' tab). Select 'Read, Write and Access direct messages' and then click 'Update Setting'
   * Navigate to the 'Keys and Access Tokens' tab. You'll find your consumerKey and consumerSecret right here
   * Scroll down and click on 'Create my access token'. You now have your accessToken  and your accessTokenSecret

! Makes sure not to create your access token before having reset your permissions. If you do that, you will need to change your permissions then regenerate your access token.

That should about do it. Because twitter DM is not completely separate from the rest of Twitter, it behaves quite differently from the other platforms on many aspects. All the points will be mentioned in the rest of this doc.


## Working with Botmaster

Now that you have your settings, you can go ahead and create a botmaster object. This essentially 'starts' botmaster. Briefly rehearsing what was mentioned in the 'Getting set up' section, doing so will look a little something like this:

```js
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

Where our platform-specific settings have been taken from the "Getting set up"
 step.

### Settings

The `botmasterSettings` object has the following parameters:

| Parameter | Description
|--- |---
| botsSettings | An `array` of platform specific settings. See [Getting set up](#getting-set-up) for more info on that
| port  | (__optional__) The port to use for your webhooks (see [webhooks](#webhooks) to understand more about webhooks). This will only be used if the `app` parameter is not provided. Otherwise, it will be ignored
| app  | (__optional__) An `express.js` app object to mount the `webhookEnpoints` onto. If you choose to do this, it is assumed that you will be starting your own express server and this won't be done by Botmaster.
| sessionStore | (__optional__) a `sessionStore` object to store basic context and information about the bot and the updates it receives. See the [session](#sessions) section below to read more about sessions

### Events

Botmaster is built on top of the EventEmitter node.js class. Which means it can emit events and most importantly for us here, it can listen onto them. By doing the following:

```js
botmaster.on('update', (bot, update) => {
  console.log(bot.type);
  console.log(update);
});

botmaster.on('error', (bot, err) => {
  console.log(bot.type);
  console.log(err.stack);
});
```

I am registering two new listeners onto the botmaster object. One that listens for any updates that come in and one that listens for any potential error that might occur when receiving updates. The `update` events is of course the one you will want to focus most of your attention onto. You see here that every `update` event will come with a `bot` and an `update` object as arguments. This will always be the case. In general, the updates are standardized as well as the methods to use from the bot object (i.e. sending a message).

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

## Message/Update format

Standardization is at the heart of Botmaster. The framework was really created for that purpose. This means that messages coming from any platform have to have the same format.

In order to do that, the Facebook Messenger message format was chosen and adopted. This means that when your botmaster object receives an 'update' event from anywhere (twitter, telegram or Messenger as of this writing), you can be sure that it will be of the same format as a similar message that would come from Messenger.

### Incoming update

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

This allows developers to handle these messages in one place only rather than doing it in multiple places. For more info on the various incoming messages formats, read the messenger bot doc on webhooks at: https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received.

Currently, you will only get updates for `Messages` (and not delivery, echo notification etc) for all platforms. On Messenger, it is assumed that you don't want to get updates for delivery, read and echo. This can't be turned on at the moment, but will be in later versions as it might be a requirement.

#### Note on attachment types and conversions
Attachment type conversion works as such for __Twitter__:

| Twitter Type | Botmaster conversion
|--- |---
| photo | image
| video  | video
| gif  | video

!!!Yes `gif` becomes a `video`. because Twitter doesn't actually use gifs the way you would expect it to. It simply loops over a short `.mp4` video.

Also, here's an important caveat for Twitter bot developers who are receiving attachments. Image links that come in from the Twitter API will be private and not public, which makes using them quite tricky. You might need to make authenticated requests to do so. The twitterBot objects you will receive in the update will have a `bot.twit` object. Documentation for how to use this is available [here](https://github.com/ttezel/twit).

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

The method used is used directly from the bot object and not using the botmaster one.

Because you might not always want to code in a complex json object just to send in a simple text message or photo attachment, Botmaster comes with a few methods that can be used to send messages with less code:

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
| update | and update object with a valid `update.sender.id`.
| text  | just a string with the text you want to send to your user

This is is typically used like so:

```js
botmaster.on('update', (bot, update) => {
  bot.reply(update, 'something super important!');
});
```

### Attachments

`bot.sendAttachmentTo`

We'll note here really quickly that Messenger only takes in urls for file attachment (image, video, audio, file). Telegram doesn't support attachments in this way. So we fall back to sending the url in text. Same goes for Twitter that doesn't support attachments at all.

| Argument | Description
|--- |---
| attachment | a valid Messenger style attachment. See [here](https://developers.facebook.com/docs/messenger-platform/send-api-reference) for more on that.
| recipientId  | a string representing the id of the user to whom you want to send the message.

This is the general attachment sending method that will always work for Messenger but not necessarily for other platforms. So beware when using it. To assure your attachment will be sent to all platforms, use `bot.sendAttachmentFromURLTo`.

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

Just easier to use this to send standard url attachments:

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

### Status

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


### Buttons

Buttons will almost surely be part of your bot. Botmaster provides a method that will send what is assumed to be a decent way to display buttons throughout all platforms.

`bot.sendDefaultButtonMessageTo`

| Argument | Description
|--- |---
| buttonTitles | array of button titles (no longer than 10 in size).
| recipientId  | a string representing the id of the user to whom you want to send the message.
| textOrAttachment  | (__optional__) a string or an attachment object similar to the ones required in `bot.sendAttachmentTo`. This is meant to provide context to the buttons. I.e. why are there buttons here. A piece of text or an attachment could detail that. If not provided,  text will be added that reads: 'Please select one of:'.

The function defaults to sending `quick_replies` in Messenger, setting `Keyboard buttons` in Telegram and simply prints button titles one on each line in Twitter as it deosn't support buttons. The user is expecting to type in their choice in Twitter.


## Webhooks

Most platforms rely on webhooks to work. As such, you are expected to setup webhooks on the various platforms that use them in order to use Botmaster with these platforms. In the 'Getting set up' part of this documentation, we briefly touched onto that for Telegram and it is mentioned in one of the steps in the Messenger documentation.

If you are unsue what webhooks are and how they work, for the purpose of chatbots, they are simply a URL provided by you where you expect messages and other updates to come in.

Any platform that requires webhooks won't work without a webhookEndpoint parameter in their settings. E.g. for Telegram:

```js
const telegramSettings = {
  credentials: {
    authToken: 'YOUR authToken',
  },
  webhookEndpoint: '/webhook1234/',
};
```

This will mount your telegram webhook on: `https://Your_Domain_Name/messenger/webhook1234`. And yes, you will need ssl in order to work with most platforms.

As an added layer of security, it is highly recommended that you include a sort of hash in your webhookEndpoint. I.e., rather that having this: `webhookEndpoint: '/webhook/'`, do something more like this: `webhookEndpoint: '/webhook92ywrnc9qm4qoiuthecvasdf42FG/'`. This will assure that you know where the request is coming from. It is more important on Telegram than on other platforms as Telegram doesn't set a header to verify the origin of the update.

Now we realise you will want to develop and test your code without always deploying to a server with a valid url that supports ssl.

### On a local machine:

We recommend using the great localtunnel tool that proxies one of your ports to their url (with a potential wanted subdomain) using ssh.

Simply install localtunnel on local machine

```bash
npm install -g localtunnel
```

Then run the localtunnel with a predetermined subdomain. e.g:

```bash
lt -p 3000 -s botmastersubdomain //for example
```

`-p` is the port and `-s` is the subdomain we want.
`-l` is for the localhost we want to point to. This is useful is you are using botmaster inside of a container. For instance if using docker-machine, simply `-l` to your docker-machines ip and `-p` to the port that your container exposes.

In the example above, url will be: `http://botmastersubdomain.localtunnel.me`. Localtunnel is great and supports both ssl and non ssl request, which means we will actually wan to use: `https://botmastersubdomain.localtunnel.me`

So if you specified your messenger's bot webhook endpoint to, say, /webhook1234/, you will have to set up the webhook for your demo app at:

```
https://botmastersubdomain.localtunnel.me/messenger/webhook1234/
```

For Telegram, it would look something like this:

```
https://botmastersubdomain.localtunnel.me/telegram/webhook1234/
```

If you keep on getting an error that looks like this:

```bash
your url is: https://customname.localtunnel.me
/usr/local/lib/node_modules/localtunnel/bin/client:58
        throw err;
        ^

Error: connection refused: localtunnel.me:44404 (check your firewall settings)
    at Socket.<anonymous> (/usr/local/lib/node_modules/localtunnel/lib/TunnelCluster.js:47:32)
    at emitOne (events.js:96:13)
    at Socket.emit (events.js:188:7)
    at emitErrorNT (net.js:1272:8)
    at _combinedTickCallback (internal/process/next_tick.js:74:11)
    at process._tickCallback (internal/process/next_tick.js:98:9)
```

This is due to a bug in localtunnel. You can either go try out ngrok (which you will have to pay for), or try this workaround in the terminal:

```bash
(while true; do
  lt -p 3000 -s botmastersubdomain
done)
```

or

```bash
( while true; do lt -p 3000 -s botmastersubdomain; done; )
```

If you prefer a one liner.

This will just restart the process whenever it crashes (which can happen very often...), making sure your webhook will always be up and listening for incoming requests.


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

Checkout the examples folder for some examples of how to use botmaster

## License

This library is licensed under the MIT [license](LICENSE)
