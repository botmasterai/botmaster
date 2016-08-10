## Should I use botmaster or botkit?

### tl;dr

Use Botmaster If you are want to build platform agnostic conversational bots using a system like Wit. ai or Watson conversation [or your own system] to manage 1 on 1 conversations (On Messenger, Twitter, Telegram for now). e.g. a personal assistant, customer support etc.

Use Botkit if you want to build platform dependant bots on either Slack or Twilio IPM while managing simple conversations based on regex or also more complex ones using again Watson Conversation or wit etc.

### Main article
Although it might seem at first glance like the two frameworks (and other similar ones out there) were created with the same goal in mind, things are quite far from that. Let's have a look at how one of these frameworks compare, namely Botkit.

Botkit was initially created to allow developers to easily build bots of all types that would be available on Slack. Although it now allows developers to build bots for twilio IP messaging and Facebook Messenger too. It was first published in December 2015

Botmaster, on the other hand, is an opinionated lightweight framework created after answering the following question: How can I minimise the amount of code a developer has to write in order to create a 1-on-1 conversational chatbot that works on multiple different platforms. It was first published to Github on August 2016.

Due to the differences in application intents between both frameworks, the design differs in many ways.


Message format
---

Botkit's messages are only standardized to some extent. Because Botkit it not opinionated, it doesn't make any assumption on what a message attachments or message quick_replies should look like and what they would map to on different platform.

This means that a Facebook messenger message with an image attachments will look something like this:

```js
{
  user: <id_of_sender>,
  channel: <id_of_sender>, // also
  timestamp: <unix miliseconds timestamp>,
  seq: <message_sequence_id>,
  mid: <message_id>,
  attachments: [
    {
      type: 'image',
      payload: {
        url: 'https://scontent.xx.fbcdn.net/v/.....'
      }
    }
  ]
}
```

While a Twilio IPM message (Twilio IPM only supports text) will look like this:

```js
{ ChannelSid: <some_id>,
  EventType: 'onMessageSent',
  InstanceSid: <some_id>,
  Attributes: '{}',
  DateCreated: '2016-07-29T18:42:35.686Z',
  Index: '1',
  From: 'SneakyQuincyEssex',
  MessageSid: <some_id>,
  Identity: 'SneakyQuincyEssex',
  Body: 'yo',
  AccountSid: <some_id>,
  text: 'yo',
  from: 'SneakyQuincyEssex',
  to: undefined,
  user: 'SneakyQuincyEssex',
  channel: <some_id> }
```

Because of the nature of Twilio and the nature of channels and how they are dealt with, this only makes sense. We'll look at what other differences this brings in the next section.


Standardization is at the heart of Botmaster. The framework was really created for that purpose. In order to do that, the Facebook Messenger message format was chosen and adopted. This means that when your botmaster object receives an 'update' event from anywhere (twitter, telegram as of this writing), you can be sure that it will be of the same format as a similar message that would come from Messenger. 
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


The bot object
---

Confusion may [and most likely will] arise when trying to understand how the bot objects returned with each message differ between both frameworks.

Botkit has a concept of a controller. Controllers are not platform agnostic according to their definition. So for example a Twilio IPM controller will look like this:

```js
var controller = Botkit.twilioipmbot({
    debug: false,
});
```
This controller could then spawn new Twilio IMP bots. Bots all have a fixed endpoint with a port that can be defined if you need multiple bots of the same type. The bot object is returned with every event and you can then do things like send a message or reply etc with it.

For messenger, it would look something like this:

```js
const controller = Botkit.facebookbot({
  access_token: messengerCredentials.pageToken,
  verify_token: messengerCredentials.verifyToken,
});
```

Because of the fixed endpoint and the fact that Botkit does not (according to their code as of today) verify the integrity of the requests using the Facebook App Secret, I would advise against using it as this means that anyone can make a request to https://YOUR_SERVER:PORT_CHOSEN/facebook/receive and fake requests from Facebook.

Botmaster does not have this concept of a controller. In fact, if you are coming from Botkit, you can think of Botmaster as a sort of supercontroller from which you can create a bot of any type as in this example:

```js

// just an example to show what types of settings are expected
const otherMessengerSettings = {
  credentials: {
    verifyToken: messengerCredentials.verifyToken,
    pageToken: messengerCredentials.pageToken, // access_token in Botkit
    fbAppSecret: messengerCredentials.fbAppSecret,
  },
  webhookEndpoint: '/webhook_some_random_string',
}

const botsSettings = [{ telegram: telegramSettings }, // settings found elsewhere
                      { messenger: messengerSettings }, // settings found elsewhere
                      { messenger: otherMessengerSettings },
                      { twitter: twitterSettings},]; // settings found elsewhere

const botmaster = new Botmaster({settings: botsSettings});
```

Bot objects are created under the hood and events received by each of them will be relayed to the Botmaster in the standardized Messenger format mentioned in the Message format part. Events are called updates and receiving them looks like this:

```js
botmaster.on('update', (bot, update) => {
});
```

Where the bot object would have been created with any of the 4 settings mentioned. Note the fact that there are 2 messenger settings. Because Botmaster requires an endpoint to be specified in the settings, nothing more than specifying it has to be done there. We recommend people to include some sort of a key in their endpoint as added security for Messenger (on top of the integrity verification from the Facebook app secret) and as basic security for Telegram.

express app object
---

Both frameworks either expect an express() app object to be passed as argument either after controller creation in Botkit as such:

```js
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
...

controller.createWebhookEndpoints(app, bot, () => {
    console.log('This bot is online!!!');
});
```

Or during botmaster object instantiation in Botmaster as such:

```js
const express = require('express');
const app = express();
...

const botmaster = new Botmaster({settings: botsSettings,
                                 app: app});
```

Both then expect the server to be started by you in this case. So you would have something like this in your code:

```js
app.listen(3000, function() {
  console.log('Server up');
});
```

If this isn't done in Botkit, they expect you to manually start it using their builtin methods:

```js
Controller.setupWebserver(3000,function(err,webserver) {
  Controller.createWebhookEndpoints(bController.webserver, bBot, function() {
      console.log('This bot is online!!!');
  });
});
```

If unspecified in Botmaster, it will just start an express server under the hood for you and make it listen onto port 3000. If you want it to listen onto another port, you can just do something like this when instantiating botmaster:

```
const port = 3001;
const botmaster = new Botmaster({settings: botsSettings,
                                 port: port});
```

Supported Platforms
---
|   | Botmaster| Botkit |
|---|---|---|
|Facebook Messenger| x | x |
|Slack|| x |
|Twilio IPM| | x |
|Twitter DM| x |  |
|Telegram| x |  |
|Line| coming soon |  |

conversations
---

Botkit allows developers to specify a deterministic conversation flow within the code to simplify such flows. This is definitely handy and something that can help when creting Slack and Twilio bots

Because Botmaster was initialy built mainly as a standardization agnostic layer that assumes your messages will be sent to some sort of AI service like Watson conversation and others, this hasn't been builtin to the first version. This is however something that will come soon (in a different form from the ones in Botkit). Depending on requests however, it could come sooner or later.

Conclusion
---
I hope this all made some sort of sense to you and that you are now able to make a sensible decision with respect to which framework to use.

I realize there are other frameworks out there too that I haven't mentioned. If anyone would like to look into them and tell me what the differences are, I'd be happy to add them to another file.

