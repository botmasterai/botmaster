---
date: 2016-11-04T00:57:53Z
next: /getting-started/telegram-setup
prev: /getting-started/socketio-setup
title: Twitter Setup
toc: true
weight: 70
---


```js

const Botmaster = require('botmaster');

const twitterSettings = {
  credentials: {
    consumerKey: 'YOUR consumerKey',
    consumerSecret: 'YOUR consumerSecret',
    accessToken: 'YOUR accessToken',
    accessTokenSecret: 'YOUR accessTokenSecret',
  }
}

const botsSettings = [{ twitter: twitterSettings }];

const botmaster = new Botmaster({ botsSettings });

botmaster.on('update', (bot, update) => {
  bot.reply(update, 'Right back at you');
});
```

## Getting your Credentials

Twitter's setup is slightly more tricky than one would wish. Because Twitter requires you to create an actual account and not a page or a bot, you'll have to do a few more steps.

#### Setting up the bot account

* Just create a standard twitter account as you would any other. Name it as you want.
* navigate to your security and privacy settings (click on your image profile > settings > privacy and security settings)
* scroll to the bottom of the page and make sure "Receive Direct Messages from anyone" is ticked. (currently this has to be done because of Twitter's rules concerning DMs, where in order to send a DM to someone, they have to be following you).

#### Setting up the app

*  Navigate to the somewhat hard to find Twitter developer app dashboard at: https://apps.twitter.com/
* Click Create New App. Enter your details (callback URL is not required if you are starting from scratch here). 'Website' can take in a placeholder like (http://www.example.com)
* Now navigate straight to the 'Permissions' tab(do this before going to the 'Keys and Access Tokens' tab). Select 'Read, Write and Access direct messages' and then click 'Update Setting'
* Navigate to the 'Keys and Access Tokens' tab. You'll find your consumerKey and consumerSecret right here
* Scroll down and click on 'Create my access token'. You now have your accessToken  and your accessTokenSecret

! Makes sure not to create your access token before having reset your permissions. If you do that, you will need to change your permissions then regenerate your access token.

That should about do it. Because twitter DM is not completely separate from the rest of Twitter, it behaves quite differently from the other platforms on many aspects. These points are covered in [working with botmaster](/working-with-botmaster).
