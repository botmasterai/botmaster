'use strict';

require('dotenv').config();
const Botmaster = require('botmaster');
const watsonConversationStorageMiddleware = require('./watson_conversation_storage_middleware');
const watson = require('watson-developer-cloud');

const watsonConversation = watson.conversation({
  username: process.env.WATSON_CONVERSATION_USERNAME,
  password: process.env.WATSON_CONVERSATION_PASSWORD,
  version: 'v1',
  version_date: '2016-05-19',
});

const telegramSettings = {
  credentials: {
    authToken: process.env.TELEGRAM_AUTH_TOKEN,
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
  // !! see Readme if you have any issues with understanding webhooks
  webhookEndpoint: '/webhook1234/',
};

const botsSettings = [{ telegram: telegramSettings },
                      { messenger: messengerSettings }];

const botmasterSettings = {
  botsSettings,
  port: 3000,
};

const botmaster = new Botmaster(botmasterSettings);

botmaster.use('incoming', watsonConversationStorageMiddleware.retrieveSession);

botmaster.on('update', (bot, update) => {
  const messageForWatson = {
    context: update.session.context,
    workspace_id: process.env.WATSON_CONVERSATION_WORKSPACE_ID,
    input: {
      text: update.message.text,
    },
  };
  watsonConversation.message(messageForWatson, (err, watsonUpdate) => {
    const text = watsonUpdate.output.text[0]
    update.session.context = watsonUpdate.context;

    bot.sendMessage({
      recipient: {
        id: update.sender.id,
      },
      message: {
        text,
      },
      session: update.session,
    });
  });
});

botmaster.use('outgoing', watsonConversationStorageMiddleware.updateSession);

botmaster.on('listening', (message) => {
  console.log(message);
});

botmaster.on('error', (bot, err) => {
  console.log(err.stack);
});
