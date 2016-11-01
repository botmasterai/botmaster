# Bot classes

This Readme assumes that you have read the main Readme.md and generally understand how Botmaster and more generally how chatbots work.

Because of that, we will pick up right from there and start looking into the bot classes Botmaster comes bundled with.

Botmaster makes three usable bot classes available to developers. `MessengerBot`, `TelegramBot` and `TwitterBot`.

For example, you can instantiate a new `MessengerBot` object as such:

```js
const Botmaster = require('botmaster');
const MessengerBot = Botmaster.botTypes.MessengerBot;

const messengerSettings = {
  credentials: {
    verifyToken: 'YOUR verifyToken',
    pageToken: 'YOUR pageToken',
    fbAppSecret: 'YOUR fbAppSecret'
  },
  webhookEndpoint: '/webhook1234',
};

const messengerBot = new MessengerBot(messengerSettings);
```

In order to get updates from Messenger, you would then be expected to mount your bot's express mini-app `messengerBot.app` onto your own express `app` by doing something like this:


```js
const app = require('express')();
app.use('/', messengerBot.app);
app.listen(3000, function() {});
```

This will mount your bot onto: `https://Your_Domain_Name/webhook1234`. Note how the bot type __is not__ part of the URL here.


## Making Botmaster objects and bot objects work together

In the main`Readme.md` we saw how botmaster objects return a bot object along with every update it receives. I.e. something like this happens:

```js
botmaster.on('update', (bot, update) => {
  console.log(bot.type);
  console.log(update);
});
```

We also saw in the last section how to setup a bot using its own bot class. Let's have a look at how to use this bot inside of a botmaster object.

As usual, we create a botmaster object. This one supports Twitter and Telegram, but not Messenger. We create it as such:


```js
const Botmaster = require('botmaster');

const twitterSettings = {
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

const botsSettings = [{ twitter: twitterSettings },
                      { telegram: telegramSettings }];

const botmasterSettings = { botsSettings: botsSettings };

const botmaster = new Botmaster(botmasterSettings);
```

In this example the `botmaster` object will start a new `express()` `app` server running locally on port `3000` as expected by default (see main Readme to see how to change that). However, we later might want to add to botmaster the object we created in the first section, namely, `messengerBot`.

We can achieve this by doing the following:

```js
botmaster.addBot(messengerBot);
```

This will mount your bot onto: `https://Your_Domain_Name/messenger/webhook1234`. Note how the bot type __is__ part of the endpoint here. This is because the Botmaster class assumes that you want your endpoint to be mounted onto its botType.

You will then get updates from the botmaster object as if you had instantiated it with the messenger settings too.

__What this means is that any bot class that follows a  certain set of rules will be able to be added to a botmaster object.__


## Creating your own bot classes

Before defining the rules that have to be respected in order to write a Botmaster compatible bot class let's look at the constructor of one of the pre-existing one, `TelegramBot`:

### `#constructor(settings)`

```js
class TelegramBot extends BaseBot {

  constructor(settings) {
    super(settings);
    this.type = 'telegram';
    this.requiresWebhook = true;
    this.requiredCredentials = ['authToken'];

    this.__applySettings(settings);
    .
    .
    .
    this.__createMountPoints();
  }

 }
```

Let's look into this line by line. The first line reads `super(settings)`. Which of course just means it calls the constructor of `TelegramBot`'s superclass, namely, BaseBot. `BaseBot`'s constructor doesn't actually do anything fancy a part from calling its own superclass's constructor and setting a few default values [as pointers for you, the developer]. BaseBot calls its own superclass's constructor as it inherits from node.js's `EventEmitter` which will allow your bot's classes to listen to events as well as emit them.

The following three lines setup some important values.

  1. `this.type`: the type of bot that is being instantiated. It's important to specify that as developers might want condition some code on the type of bot you are writing.
  2. `this.requiresWebhook`: whether the bot requires webhooks. If the platform you are coding for requires webhooks, you will be expected to set a `this.app` variable at some point in the setup. We'll look into this when we have a look at what the `this.__createMountPoints();` does.
  3. `this.requiredCredentials`: sets up an array of credentials that are expected to be defined for the platform you are coding your class for. Telegram only takes in 1, so we just have an array with the value `'authToken'`.

### `#__applySettings(settings)`

The next line calls the `this.__applySettings(settings)`. This function is implemented in BaseBot and will just make sure that the settings passed on to the bot constructor are valid with respect to the parameters you defined. You should always call this function directly after setting the three [or more if you want] parameters specific to the platform you are coding for. If valid, the settings will then be applied to the bot object. e.g. `this.webhookEndpoint` will be set to `settings.webhookEndpoing`.

### `#__createMountPoints()`

The last line of our controller makes a call to `this.__createMountPoints();`. This line should only be present if your bot class requires webhooks. If this is the case, you will be expected to define a class member function that looks like:

```js
  __createMountPoints() {
    this.app = express();
    // for parsing application/json
    this.app.use(bodyParser.json());
    // for parsing application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.post(this.webhookEndpoint, (req, res) => {
      this.__formatUpdate(req.body)

      .then((update) => {
        this.__emitUpdate(update);
      }, (err) => {
        err.message = `Error in __formatUpdate "${err.message}". Please report this.`;
        this.emit('error', err);
      });

      // just letting telegram know we got the update
      res.sendStatus(200);
    });
  }
```

Very importantly, this function creates an express router `this.app` that will be mounted onto the main `app` router from the botmaster object if `botmaster.addBot` is used.

It then sets up the post endpoint that listens onto `this.webhookEnpoint`. No further assumption is made here.

### `#__setBotIdIfNotSet(update)`

In order for botmaster to know which bot should handle an update message, botmaster looks for a bot with an `id` matching `update.recipient.id`. You can manage these IDs yourself, or if you want you can define the `setBotIdIfNotSet` method which will define the bot's id the first time an update is received.

The following is a good default implementation used in many of botmaster's internal bot types:

```js
__setBotIdIfNotSet(update) {
  if (!this.id) {
  	this.id = update.recipient.id;
  }
}
```


### `#__formatUpdate(rawUpdate)`

Although you can technically handle the body of the request as you wish. In our `__createMountPoints` example here (from TelegramBot code), we make a call to the `__formatUpdate` function with the body of the request.
It would make sense for you to do so for consitency and because it has to be defined if you want your bot class to eventually be added to the Botmaster project.

This function is expected to transform the `rawUpdate` into an object which is of the format of Messenger updates, while having an `update.raw` bit that references that `rawUpdate` received.

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

Your function should return the update object(or a promise that resolves a formatted update object) in order to then call `__emitUpdate` with it as a parameter.

### `#__emitUpdate(update)`

Like `__applySettings`, this method is implemented in `BaseBot`. It handles errors, calling the `incoming` middleware stack, and most importantly, actually calling `this.emit(update)` to emit the actual update. You can overwrite this method is you wish, but in its current state, it handles the most important cases you will want to deal with. You will however need to call it with your formatted update object as a parameter in order to actually get the update object in a `bot.on('update', callback)` block.

### `#__sendMessage(message)`

All previous methods had either something to do with object instantiation or with incoming messages. We'll now have a look at what needs to be done within your bot class to send messages.

The `__sendMessage` method needs to be implemented. The method should take in a Messenger style message and send a formatted message to the bot platform. It should return a `Promise` that resolves to something like this:

```js
  {
   raw: rawBody,
   recipient_id: <id_of_user>,
   message_id: <message_id_of_what_was_just_sent>
  }
 ```

Please note that the `BaseBot` superclass defines a set of methods that allow developers to more easily send messages to all platforms without having to build the whole Messenger compatible object themselves. These methods are the following:

`sendMessage`
`sendMessageTo`
`sendTextMessageTo`
`reply`
`sendAttachmentTo`
`sendAttachmentFromURLTo`
`sendDefaultButtonMessageTo`
`sendIsTypingMessageTo`

All these methods will convert a developer specified input into a Facebook Messenger compatible message that will be called as a parameter to `__sendMessage`. That is, they all eventually will call your `__sendMessage` method. You can however overwrite them if need be.

### `#__formatOutgoingMessage(message)`

Your `sendMessage` method is expected to call a `__formatOutgoingMessage(message)` method that will format the Messenger style message into one that is compatible with the platform you are coding your bot class for.

You can have a look at the ones defined in the `TelegramBot` and the `TwitterBot` classes for inspiration.

## Is this really all there is to it?

Yes it is! These few basic steps are the steps that should be followed in order to build your own bot classes. Nothing more is required. Of course, formatting the incoming updates and the outgoing messages won't always be as trivial as we'd wish, but this guide should help you into doing this.
