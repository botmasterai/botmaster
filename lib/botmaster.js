'use strict';

const http = require('http');
const EventEmitter = require('events');
const find = require('lodash').find;
const remove = require('lodash').remove;
const debug = require('debug')('botmaster:botmaster');
const TwoDotXError = require('./errors').TwoDotXError;
const Middleware = require('./middleware');

/**
 * The Botmaster class to rule them all
 */

class Botmaster extends EventEmitter {
  /**
   * sets up a botmaster object attached to the correct server if one is set
   * as a parameter. If not, it creates its own http server
   *
   * @param {object} settings
   */

  constructor(settings) {
    super();
    this.settings = settings;
    this.__throwPotentialUnsupportedSettingsErrors();
    this.__setupServer();
    this.middleware = new Middleware(this);

    // this is used for mounting routes onto bot classes "mini-apps""
    this.__serverRequestListeners = {};
    this.bots = [];
  }

  __throwPotentialUnsupportedSettingsErrors() {
    const unsupportedSettings = ['botsSettings', 'app'];

    for (const settingName of unsupportedSettings) {
      if (this.settings && this.settings[settingName]) {
        throw new TwoDotXError(
          `Starting botmaster with ${settingName} ` +
          'is no longer supported.');
      }
    }
  }

  __setupServer() {
    if (this.settings && this.settings.server && this.settings.port) {
      throw new Error(
        'IncompatibleArgumentsError: Please specify only ' +
        'one of port and server');
    } else if (this.settings && !this.settings.server && !this.settings.port) {
      throw new Error(
        'If passing through settings, please specify exactly one of port or server' +
        'If you want botmaster to use its defaults, just use the constructor with no params');
    }
    if (this.settings && this.settings.server) {
      this.server = this.settings.server;
    } else {
      const port = this.settings
        ? this.settings.port
        : 3000;
      this.server = this.__listen(port);
    }
    this.__setupServersRequestListeners();
  }

  __setupServersRequestListeners() {
    const nonBotmasterListeners = this.server.listeners('request').slice(0);
    this.server.removeAllListeners('request');

    this.server.on('request', (req, res) => {
      // run botmaster requestListeners first
      // console.log(this.__serverRequestListeners);
      for (const path in this.__serverRequestListeners) {
        if (req.url.indexOf(path) === 0) {
          const requestListener = this.__serverRequestListeners[path];
          return requestListener.call(this.server, req, res);
        }
      }
      // then run the non-botmaster ones
      if (nonBotmasterListeners.length > 0) {
        for (const requestListener of nonBotmasterListeners) {
          requestListener.call(this.server, req, res);
        }
      } else {
        // just return a 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `Couldn't ${req.method} ${req.url}` }));
      }
    });
  }

  __listen(port) {
    const server = http.createServer();
    server.listen(port, '0.0.0.0', () => { // running it for the public
      const serverMsg = `server parameter not specified. Running new server on port: ${port}`;
      debug(serverMsg);
      this.emit('listening', serverMsg);
    });

    return server;
  }

  /**
   * Add an existing bot to this instance of Botmaster
   *
   * @param {BaseBot} bot the bot object to add to botmaster. Must be from
   * a subclass of BaseBot
   *
   * @return {Botmaster} returns the botmaster object for chaining
   */
  addBot(bot) {
    if (bot.requiresWebhook) {
      const path = `/${bot.type}/${bot.webhookEndpoint}`;
      this.__serverRequestListeners[path] = bot.requestListener;
    }
    bot.master = this;
    this.bots.push(bot);
    bot.on('error', (err) => {
      debug(err.message);
      this.emit('error', bot, err);
    });

    debug(`added bot of type: ${bot.type} with id: ${bot.id}`);

    return this;
  }

  /**
   * Extract First bot of given type or provided id.
   *
   * @param {object} options must be { type: 'someBotType} or { id: someBotId }.
   *
   * @return {BaseBot} The bot found of a class that inherits of BaseBot
   */
  getBot(options) {
    if (!options ||
       (!options.type && !options.id) ||
       (options.type && options.id)) {
      throw new Error('\'getBot\' needs exactly one of type or id');
    }

    if (options.id) {
      return find(this.bots, { id: options.id });
    }

    return find(this.bots, { type: options.type });
  }

   /**
    * Extract all bots of given type.
    *
    * @param {string} botType (there can be multiple bots of a same type)
    *
    * @return {Array} Array of bots found
    */
  getBots(botType) {
    if (typeof botType !== 'string' && !(botType instanceof String)) {
      throw new Error('\'getBots\' takes in a string as only parameter');
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
   * Remove an existing bot from this instance of Botmaster
   *
   * @param {Object} bot
   *
   * @return {Botmaster} returns the botmaster object for chaining
   */
  removeBot(bot) {
    if (bot.requiresWebhook) {
      const path = `/${bot.type}/${bot.webhookEndpoint}`;
      delete this.__serverRequestListeners[path];
    }
    remove(this.bots, bot);
    bot.removeAllListeners();

    debug(`removed bot of type: ${bot.type} with id: ${bot.id}`);

    return this;
  }

  /**
   * Add middleware to this botmaster object
   * This function is just sugar for `middleware.__use` in them
   *
   * @param {object} middleware
   *
   * @example
   *
   * // The middleware param object is something that looks like this for incoming:
   * {
   *  type: 'incoming',
   *  controller: (bot, update, next) => {
   *    // do stuff with update,
   *    // call next (or return a promise)
   *  }
   * }
   *
   * // and like this for outgoing middleware
   *
   * {
   *  type: 'outgoing',
   *  controller: (bot, update, message, next) => {
   *    // do stuff with message,
   *    // call next (or return a promise)
   *  }
   * }
   *
   * @return {Botmaster} returns the botmaster object so you can chain middleware
   *
   */
  use(middleware) {
    this.middleware.__use(middleware);

    return this;
  }

  /**
   * Add wrapped middleware to this botmaster instance. Wrapped middleware
   * places the incoming middleware at beginning of incoming stack and
   * the outgoing middleware at end of outgoing stack.
   * This function is just sugar `middleware.useWrapped`.
   *
   * @param {object} incomingMiddleware
   * @param {object} outgoingMiddleware
   *
   * The middleware objects are as you'd expect them to be (see use)
   *
   * @return {Botmaster} returns the botmaster object so you can chain middleware
   */
  useWrapped(incomingMiddleware, outgoingMiddleware) {
    this.middleware.__useWrapped(incomingMiddleware, outgoingMiddleware);

    return this;
  }
}

module.exports = Botmaster;
