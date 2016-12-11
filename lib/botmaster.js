'use strict';

const express = require('express');
const EventEmitter = require('events');
const find = require('lodash').find;
const TelegramBot = require('./bot_types').TelegramBot;
const MessengerBot = require('./bot_types').MessengerBot;
const TwitterBot = require('./bot_types').TwitterBot;
const SlackBot = require('./bot_types').SlackBot;
const SocketioBot = require('./bot_types').SocketioBot;
const cloneDeep = require('lodash').cloneDeep;

class Botmaster extends EventEmitter {
  /**
   * sets up the bot master within the correct app if one is sent
   * as a parameter.
   *
   * @param {object} settings
   */

  constructor(inputSettings) {
    // doing this because constructor should have no side effects
    // on the input settings object
    const settings = cloneDeep(inputSettings);
    super();

    if (settings && settings.botsSettings) {
      this.botsSettings = settings.botsSettings;
    } else {
      this.botsSettings = [];
    }

    if (settings && settings.server) {
      if (!settings.app) {
        throw new Error('ERROR: if specifying a server paramter, you also need ' +
                        'to specify an app parameter when instantiating the botmaster object ');
      }
      this.server = settings.server;
    }
    // otherwise this.server is undefined (assumed the dev is dealing)
    // with it on their end.

    if (!settings || !settings.app) {
      this.app = express();
      this.server = this.__createExpressServer(settings ? settings.port || 3000 : 3000);
    } else {
      this.app = settings.app;
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
        throw new Error('ERROR: Botmaster bot settings takes 1 argument. It looks something like: { slack: slackSettings }');
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
        if (!settings.server && !settings.socketio.server) {
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
    // TODO, add implementation specific events

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
   * @param {string} middlewareType ('incoming' or 'outgoing')
   * @param {object} options (used to specify type of bots to add middleware to)
   * @param {function} middlewareCallback handler function
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
