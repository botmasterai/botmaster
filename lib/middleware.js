'use strict';

const ware = require('ware');

class Middleware {
  /**
   * Singleton Middleware class which is used throughout Botmaster.
   * All middleware is held within the
   * incomingMiddleware and
   * outgoingMiddleware variables;
   * 
   * This class is not part of the exposed API. Use botmaster.use instead
   */
  constructor(bot) {
    // middleware is always linked directly to one bot instance
    this.bot = bot;

    this.wrappedIncomingMiddleware = ware();
    this.incomingMiddleware = ware();
    this.outgoingMiddleware = ware();
    this.wrappedOutgoingMiddleware = ware();
  }

  /**
   * Subscribe middleware to stuff
   *
   * @param {string} middlewareType ('incoming' or 'outgoing')
   * @param {object} options (used to specify type of bots to add middleware to)
   * @param {function} middlewareCallback handler function
   */
  __use(middlewareType, options, middlewareCallback) {
    if (!middlewareCallback && options) {
      middlewareCallback = options;
      options = {};
    }

    try {
      this.__validateUseParams(middlewareType, options, middlewareCallback);
    } catch (err) {
      throw err;
    }

    for (const bot of this.bots) {
      if (!botType || botType.indexOf(bot.type) > -1) {
        bot.use(middlewareType, middlewareCallback);
      }
    }
  }

  __validateUseParams(middlewareType, options, middlewareCallback) {
    if (!middlewareCallback && (typeof middlewareType === 'string' || middlewareType instanceof String)) {
      throw new Error('middlewareCallback needs to be defined');
    } else if (arguments[3] !== undefined) {
      throw new Error('too many arguments. 2-3 expected');
    }

    if (typeof options !== 'object') {
      throw new TypeError('invalid options. Options should be passed as an object');
    }

    if ((typeof middlewareType !== 'string' && !(middlewareType instanceof String)) ||
        (middlewareType !== 'incoming' && middlewareType !== 'outgoing')) {
      throw new TypeError('invalid middleware type. Type should be either \'incoming\' or \'outgoing\'');
    }

    if (typeof middlewareCallback !== 'function') {
      throw new TypeError('invalid callback. Callback should be a function');
    }
  }

  /**
   * Add middleware to this bot
   *
   * @param {string} middleware type ('incoming' vs 'outgoing')
   * @param {function} middleware handler function
   */
  use(middlewareType, middlewareCallback) {
    if (middlewareType === 'incoming') {
      this.incomingMiddleware.use(middlewareCallback);
    } else if (middlewareType === 'outgoing') {
      this.outgoingMiddleware.use((bot, update, message, next) => {
        if (middlewareCallback.length <= 3) {
          middlewareCallback(bot, message, next);
        } else {
          middlewareCallback(bot, update, message, next);
        }
      });
    }
    // otherwise just don't do anything
  }

  wrapUse(middlewareType, options, middlewareCallback) {

  }

  __runIncomingMiddleware(preMiddlewareUpdate) {
    return new Promise((resolve, reject) => {
      const patchedBot = this.bot.__createBotPatchedWithUpdate(preMiddlewareUpdate);
      const cb = (err, bot, update) => { // the callback
        if (err) {
          err.message = `"${err.message}". In incoming middleware`;
          return reject(err);
        }
        return resolve(update);
      };

      this.incomingMiddleware.run(patchedBot, preMiddlewareUpdate, cb);
    });
  }

  __runOutgoingMiddleware(preMiddlewareMessage, sendOptions) {
    if (!sendOptions) {
      sendOptions = {};
    }
    return new Promise((resolve, reject) => {
      if (sendOptions.ignoreMiddleware) {
        return resolve(preMiddlewareMessage);
      }

      const patchedBot = this.bot.__createBotPatchedWithUpdate(sendOptions.__update);

      const cb = (err, bot, update, message) => { // the callback
        if (err) {
          err.message = `"${err.message}". In outgoing middleware`;
          return reject(err);
        }
        return resolve(message);
      };

      this.outgoingMiddleware.run(
        patchedBot, sendOptions.__update, preMiddlewareMessage, cb);
    });
  }

}

module.exports = Middleware;
