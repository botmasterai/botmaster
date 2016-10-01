'use strict';

const Botmaster = require('botmaster');
const SessionStore = Botmaster.storage.MemoryStore;
const watson = require('watson-developer-cloud');

const watsonConversation = watson.conversation({
  username: process.env.WATSON_CONVERSATION_USERNAME,
  password: process.env.WATSON_CONVERSATION_PASSWORD,
  version: 'v1',
  version_date: '2016-05-19',
});

const telegramSettings = {
  credentials: {
    authToken: process.env.TELEGRAM_TEST_TOKEN,
  },
  // !! botmaster will mount your webhooks on /<botType>/webhookEndpoint.
  // so in this case, it will mount it on: /telegram/webhook1234.
  // If using localtunnel as specified below the whole path will be:
  // https://botmastersubdomain.localtunnel.me/telegram/webhook1234/
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
/*
* Where the actual code starts. This code is actually all that is required
* to have a bot that works on the various different channels and that
* communicates with the end user using natural language (from Watson Conversation).
* If a conversation is properly trained on the system, no more code is required.
*/
const botsSettings = [{ telegram: telegramSettings },
                      { messenger: messengerSettings }];

const botmasterSettings = {
  botsSettings,
  port: 3000,
  sessionStore: new SessionStore(),
}

const botmaster = new Botmaster(botmasterSettings);

botmaster.on('update', (bot, update) => {
  const session = update.session;
  const messageForWatson = {
    workspace_id: process.env.WATSON_CONVERSATION_WORKSPACE_ID,
    context: session.context, // this will be undefined on the first run
    input: {
      text: update.message.text,
    },
  };
  watsonConversation.message(messageForWatson, (err, watsonUpdate) => {
    session.context = watsonUpdate.context;
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
