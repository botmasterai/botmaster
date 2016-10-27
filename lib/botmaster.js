'use strict';

const express = require('express');
const EventEmitter = require('events');
const find = require('lodash').find;
const TelegramBot = require('./bot_types').TelegramBot;
const MessengerBot = require('./bot_types').MessengerBot;
const TwitterBot = require('./bot_types').TwitterBot;
const SlackBot = require('./bot_types').SlackBot;
const SocketioBot = require('./bot_types').SocketioBot;

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
      } else if (settings.socketio) {
        botType = 'socketio';
        botClass = SocketioBot;
        if (!settings.socketio.server) {
          settings.socketio.server = this.server;
        }
      } else {
        throw new Error('ERROR: unrecognized bot type. Supported bot types are ' +
                        'currently: "messenger", "slack", "twitter", "telegram" and "socketio"');
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
   *
   * @return {Object} bot
   */
  createBot(BotClass, settings) {
    const bot = new BotClass(settings);

    return bot;
  }

  /**
   * Add an existing bot to this instance of Botmaster
   *
   * @param {Object} bot
   *
   * @return {Array} bots
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

  /**
   * Extract First bot of given type or provided id.
   *
   * @param {object} botType or BotId
   *
   * @return {Object} bot
   */
  getBot(options) {
    if (!options ||
       (!options.type && !options.id) ||
       (options.type && options.id)) {
      throw new Error('ERROR: \'getBot\' needs exactly one of type or id');
    }

    if (options.id) {
      return find(this.bots, { id: options.id });
    }

    return find(this.bots, { type: options.type });
  }

   /**
    * Extract all bots of given type.
    *
    * @param {object} botType (there can be multiple bots of a same type)
    *
    * @return {Object} foundBots
    */
  getBots(botType) {
    if (typeof botType !== 'string' && !(botType instanceof String)) {
      throw new Error('ERROR: \'getBots\' takes in a string as only parameter');
    }

    const foundBots = [];
    for (const bot of this.bots) {
      if (bot.type === botType) {
        foundBots.push(bot);
      }
    }

    return foundBots;
  }

  /**
   * Extract all bots of given type.
   *
   * @param {string} middleware type ('incoming' or 'outgoing')
   * @param {object} optional (used to specify type of bots to add middleware to)
   * @param {function} middleware handler function
   */
  use(middlewareType, options, middlewareCallback) {
    if (!middlewareCallback && options) {
      middlewareCallback = options;
      options = undefined;
    }
    if (!middlewareCallback) {
      throw new Error('ERROR: invalid middleware type. Type should be either \'incoming\' or \'outgoing\'');
    } else if (arguments[3] !== undefined) {
      throw new Error('ERROR: too many arguments. 2-3 expected');
    }

    let botType;
    if (options && typeof options !== 'object') {
      throw new Error('ERROR: invalid options. Options should be passed as an object');
    } else if (typeof options === 'object') {
      botType = options.type;
    }

    if ((typeof middlewareType !== 'string' && !(middlewareType instanceof String)) ||
        (middlewareType !== 'incoming' && middlewareType !== 'outgoing')) {
      throw new Error('ERROR: invalid middleware type. Type should be either \'incoming\' or \'outgoing\'');
    }

    if (typeof middlewareCallback !== 'function') {
      throw new Error('ERROR: invalid callback. Callback should be a function');
    }

    for (const bot of this.bots) {
      if (!botType || botType.indexOf(bot.type) > -1) {
        bot.use(middlewareType, middlewareCallback);
      }
    }
  }

}

module.exports = Botmaster;
