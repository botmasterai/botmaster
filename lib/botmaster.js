'use strict';

const express = require('express');
const _ = require('lodash');
const EventEmitter = require('events');
const TelegramBot = require('./bot_types').TelegramBot;
const MessengerBot = require('./bot_types').MessengerBot;
const TwitterBot = require('./bot_types').TwitterBot;

  /**
   * The bot master will instantiate bots of the
   * various requested types specified in the
   */
class Botmaster extends EventEmitter {
  /**
   * sets up the bot master within the correct app if one is sent
   * as a parameter.
   *
   * @param {array} botSettings, list of objects specifying how and which
   * bot to instantiate
   * @param {express router} app, just where to mounts webhooks onto
   * @param {SessionStore} sessionStore, optional param if you will be using
   * one of the provided (or your own) SessionStore
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
      this.app = this.__createExpressApp(settings.port || 3000);
    } else {
      this.app = settings.app;
    }

    if (!settings.sessionStore) {
      console.log('WARNING: starting botmaster without a sessionStore');
    } else {
      this.sessionStore = settings.sessionStore;
    }

    this.bots = [];

    this.__setup();
  }

  __createExpressApp(port) {
    const app = express();

    app.listen(port, '0.0.0.0', () => { // running it for the public
      this.emit('server running', `App parameter undefined. Running new App on port: ${port}`);
    });

    return app;
  }

  __setup() {
    if (this.app === undefined || this.app === null) {
      this.emit('error', new Error('app parameter should be defined'));
    }

    for (const settings of this.botsSettings) {
      let botType = null;
      let botClass = null;

      if (settings.telegram !== undefined) {
        botType = 'telegram';
        botClass = TelegramBot;
      } else if (settings.messenger !== undefined) {
        botType = 'messenger';
        botClass = MessengerBot;
      } else if (settings.twitter !== undefined) {
        botType = 'twitter';
        botClass = TwitterBot;
      } else {
        throw new Error('ERROR: unrecognized bot type. Supported bot types are' +
                        'currently: "messenger", "telegram" and "twitter"');
      }

      if (!settings[botType].sessionStore) {
        // this will set the store to undefined or the specified sessionStore
        settings[botType].sessionStore = this.sessionStore;
      }
      this.createBot(botType, botClass, settings[botType]);
    }
  }

  createBot(botType, BotClass, settings) {
    const bot = new BotClass(settings);
    this.bots.push(bot);
    if (botType === 'telegram' || botType === 'messenger') {
      this.app.use(`/${botType}`, bot.app);
    }
    bot.on('update', (update) => {
      this.emit('update', bot, update);
    });
    bot.on('error', (err) => {
      this.emit('error', bot, err);
    });
  }

}

module.exports = Botmaster;
