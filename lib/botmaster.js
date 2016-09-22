'use strict';

const express = require('express');
const EventEmitter = require('events');
const TelegramBot = require('./bot_types').TelegramBot;
const MessengerBot = require('./bot_types').MessengerBot;
const TwitterBot = require('./bot_types').TwitterBot;
const SlackBot = require('./bot_types').SlackBot;

class Botmaster extends EventEmitter {
  /**
   * sets up the bot master within the correct app if one is sent
   * as a parameter.
   *
   * @param {object} settings
   */

  constructor(settings) {
    super();
    if (!settings) {
      throw new Error('ERROR: Please specify settings to instantiate botmaster instance');
    }

    if (!settings.botsSettings) {
      throw new Error('ERROR: Please specifiy a botsStettings parameter to ' +
                      'instantiate see Readme.md to see how to do this');
    } else {
      this.botsSettings = settings.botsSettings;
    }

    if (!settings.app) {
      this.app = express();
      this.server = this.__createExpressServer(settings.port || 3000);
    } else {
      this.app = settings.app;
      // this.server = 'undefined' here.
    }

    if (!settings.sessionStore) {
      console.log('WARNING: starting botmaster without a sessionStore');
    } else {
      this.sessionStore = settings.sessionStore;
      if (this.sessionStore.type === 'MemoryStore') {
        console.log(`WARNING: MemoryStore is meant only for testing and
          examples. Never under any circumstance use it in production
          (don't even use it in development if possible)`)
      }
    }

    this.bots = [];

    this.__setup();
  }

  __createExpressServer(port) {
    const server = this.app.listen(port, '0.0.0.0', () => { // running it for the public
      this.emit('server running', `App parameter not specified. Running new App on port: ${port}`);
    });

    return server;
  }

  __setup() {
    for (const settings of this.botsSettings) {
      if (Object.keys(settings).length > 1) {
        throw new Error('ERROR: Botmaster constructor only takes 1 argument');
      }
      let botType = null;
      let botClass = null;

      if (settings.telegram) {
        botType = 'telegram';
        botClass = TelegramBot;
      } else if (settings.messenger) {
        botType = 'messenger';
        botClass = MessengerBot;
      } else if (settings.twitter) {
        botType = 'twitter';
        botClass = TwitterBot;
      } else if (settings.slack) {
        botType = 'slack';
        botClass = SlackBot;
      } else {
        throw new Error('ERROR: unrecognized bot type. Supported bot types are' +
                        'currently: "messenger", "telegram" and "twitter"');
      }

      const bot = this.createBot(botClass, settings[botType]);
      this.addBot(bot);
    }
  }

  /**
   * Create a bot from settings and add it to this instance of Botmaster
   *
   * @param {BaseBot} BotClass (TelegramBot, MessengerBot or TwitterBot for now)
   * @param {object} settings
   */
  createBot(BotClass, settings) {
    const bot = new BotClass(settings);

    if (!bot.sessionStore && this.sessionStore) {
      bot.sessionStore = this.sessionStore;
    }

    return bot;
  }

  /**
   * Add an existing bot to this instance of Botmaster
   *
   * @param {TelegramBot || MessengerBot || TwitterBot} bot
   */
  addBot(bot) {
    if (bot.requiresWebhook) {
      this.app.use(`/${bot.type}`, bot.app);
    }
    this.bots.push(bot);
    bot.on('update', update => this.emit('update', bot, update));
    bot.on('warning', warning => this.emit('warning', bot, warning));
    bot.on('error', err => this.emit('error', bot, err));

    // implementation specfifc events
    bot.on('slackTeamJoined', teamInfo => this.emit('slackTeamJoined', bot, teamInfo));

    return this.bots;
  }

}

module.exports = Botmaster;
