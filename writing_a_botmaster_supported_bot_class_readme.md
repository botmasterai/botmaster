# Bot classes

This Readme assumes that you have read the main Readme.md and generally understands how chatbots and more generally how Botmasrer works.

Because of that, we will pick up right from there and start looking into the bot classes Botmaster comes bundled with.

Botmaster makes three usable bot classes available to developers. `MessengerBot`, `TelegramBot` and `TwitterBot`.

For example, you can instantiate a new `MessengerBot` object as such:

```js
const Botmaster = require('./lib');
const MessengerBot = Botmaster.botTypes.MessengerBot;

const messengerSettings = {
  credentials: config.messengerCredentials,
  webhookEndpoint: '/webhook',
};

const messengerBot = new
