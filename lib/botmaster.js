'use strict';

const _ = require('lodash');
const EventEmitter = require('events');
const TelegramBot = require('./bot_types').TelegramBot;
const MessengerBot = require('./bot_types').MessengerBot;

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
  constructor(botsSettings, app, sessionStore) {
    super();
    this.botsSettings = botsSettings;
    this.app = app;
    this.sessionStore = sessionStore;
    this.bots = [];

    this.__setup();
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
        settings.messenger.sessionStore = this.sessionStore;
      }

      if (!settings[botType].sessionStore) {
        // this will set the store to undefined or the specified sessionStore
        settings.telegram.sessionStore = this.sessionStore;
      }
      this.createBot(botType, botClass, settings[botType]);
    }
  }

  createBot(botType, BotClass, settings) {
    const bot = new BotClass(settings);
    this.bots.push(bot);
    this.app.use(`/${botType}`, bot.app);
    bot.on('update', (update) => {
      this.emit('update', bot, update);
    });
    bot.on('error', (err) => {
      this.emit('error', bot, err);
    });
  }

}

module.exports = Botmaster;
