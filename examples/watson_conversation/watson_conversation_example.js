'use strict';

const Botmaster = require('botmaster');
const WatsonConversationMiddleware = require('./middleware');

const watsonConversationParams = {
  username: process.env.WATSON_CONVERSATION_USERNAME,
  password: process.env.WATSON_CONVERSATION_PASSWORD,
  version: 'v1',
  version_date: '2016-05-19',
};

const telegramSettings = {
  credentials: {
    authToken: process.env.TELEGRAM_TEST_TOKEN,
  },
  // !! see Readme if you have any issues with understanding webhooks
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
// !! see Readme if you have any issues with understanding webhooks

const botsSettings = [{ telegram: telegramSettings },
                      { messenger: messengerSettings }];

const botmasterSettings = {
  botsSettings,
  port: 3000,
}

const botmaster = new Botmaster(botmasterSettings);
const watsonConversationMiddleware = new WatsonConversationMiddleware(watsonConversationParams);

botmaster.use('incoming', WatsonConversationMiddleware.attach)

botmaster.on('update', (bot, update) => {
  const messageForWatson = {
    context: update.context,
    workspace_id: process.env.WATSON_CONVERSATION_WORKSPACE_ID,
    input: {
      text: update.message.text,
    },
  };
  watsonConversation.message(messageForWatson, (err, watsonUpdate) => {
    inMemoryContexts[update.sender.id] = watsonUpdate.context;
    const text = watsonUpdate.output.text[0]

    bot.sendTextMessageTo(text, update.sender.id);
  });
});

botmaster.on('error', (bot, err) => {
  console.log(err.stack);
});
/*
*
* Where the actual code stops. The rest is boilerplate.
*
*/
