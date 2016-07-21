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
    this.bots = [];

    this.__setup();
  }

  __setup() {
    if (this.app === undefined || this.app === null) {
      this.emit('error', new Error('app parameter should be defined'));
    }

    for (const settings of this.botsSettings) {
      // first add the sessionStore to the settings
      if (this.sessionStore) {
        settings.sessionStore = this.sessionStore;
      }
      if (settings.telegram !== undefined) {
        this.createBot('telegram', TelegramBot, settings.telegram);
      } else if (settings.messenger !== undefined) {
        this.createBot('messenger', MessengerBot, settings.messenger);
      }
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
