'use strict';

const ware = require('ware');
const has = require('lodash').has;
const debug = require('debug')('botmaster:middleware');

class Middleware {
  /**
   * Singleton Middleware class which is used throughout Botmaster.
   * All middleware is held within the
   * incomingMiddleware and
   * outgoingMiddleware variables;
   *
   * This class is not part of the exposed API. Use Botmaster.use instead
   */
  constructor(bot) {
    // middleware is always linked directly to one bot instance
    this.bot = bot;

    this.incomingWrappedMiddleware = ware();
    this.incomingMiddleware = ware();
    this.outgoingMiddleware = ware();
    this.outgoingWrappedMiddleware = ware();
  }

  /**
   * Add middleware.
   * See botmaster #use for more info.
   *
   * @param {string} middlewareType ('incoming' or 'outgoing')
   * @param {object} options (used to specify type of bots to add middleware to)
   * @param {function} middlewareCallback handler function
   */
  __use(params) {
    // TODO pretty sure I don't need to try and then throw.
    // it should throw on its own as it is not promise based
    try {
      this.__validateUseParams(params);
    } catch (err) {
      throw err;
    }

    if (params.incoming || params.outgoing) {
      throw new Error('use should be called with only one of incoming ' +
                      'or outgoing. Use useWrapped instead');
    }

    const middlewareType = params.incoming
      ? 'incoming'
      : 'outgoing';

    const options = params[middlewareType].options;
    const middlewareCallback = params[middlewareType].cb;

    if (this.__shouldAdd(options)) {
      this.__addCallbackToAppropriateWareStack(middlewareType, middlewareCallback);
    }

    return this;
  }

  /**
   * Add Wrapped middleware
   * See botmaster#useWrapped for more info.
   *
   * @param {object} params
   */
  __useWrapped(params) {
    if (params && (!params.incoming || !params.outgoing)) {
      throw new Error('useWrapped should be called with both an incoming ' +
                      'and an outgoing callback');
    }

    try {
      this.__validateUseParams(params);
    } catch (err) {
      throw err;
    }

    if (this.__shouldAdd(params.incoming.options) &&
        this.__shouldAdd(params.outgoing.options)) {
      this.__addCallbackToAppropriateWareStack(
        'incomingWrapped', params.incoming.cb);
      this.__addCallbackToAppropriateWareStack(
        'outgoingWrapped', params.outgoing.cb);
    }

    return this;
  }

  __validateUseParams(params) {
    if (!params) {
      throw new Error('Can\'t add middleware without params');
    }
    const middlewareTypes = Object.keys(params);

    for (const middlewareType of middlewareTypes) {
      const middlewareCallback = params[middlewareType].cb;
      const options = params[middlewareCallback].options;

      if ((typeof middlewareType !== 'string' && !(middlewareType instanceof String)) ||
          (middlewareType !== 'incoming' && middlewareType !== 'outgoing')) {
        throw new TypeError('invalid middleware type. Type should be either \'incoming\' or \'outgoing\'');
      }
      if (!middlewareCallback || typeof middlewareCallback !== 'function') {
        throw new Error('middlewareCallback can\'t be of type ' +
        `${typeof middlewareCallback}. It needs to be a function`);
      }

      if (options && typeof options !== 'object') {
        throw new TypeError('invalid options. Options should be passed as an object');
      }
    }
  }

  /**
   * Simply returns true or false based on whether this middleware function
   * should be added to the bot.
   *
   * @param {object} options
   *
   * options is an object that can contain any of:
   * {
   *   includeBotTypes,
   *   excludeBotTypes,
   *   botSends,
   *   botReceives,
   * }
   */
  __shouldAdd(options) {
    if (options.includeBotTypes && options.excludeBotTypes) {
      throw new Error('Please use only one of includeBotTypes and excludeBotTypes');
    }
    const botTypeNotIncluded = (options.includeBotTypes &&
      options.includeBotTypes.indexOf(this.bot.type) === -1);
    const botTypeExcluded = (options.excludeBotTypes &&
      options.excludeBotTypes.indexOf(this.bot.type) > -1);
    const botDoesNotReceive = (options.botReceives &&
      !has(this.bot.receives, options.botReceives));
    const botDoesNotSend = (options.botSends &&
      !has(this.bot.sends, options.botSends));

    if (botTypeNotIncluded ||
        botTypeExcluded ||
        botDoesNotReceive ||
        botDoesNotSend) {
      return false;
    }

    return true;
  }

  __addCallbackToAppropriateWareStack(middlewareType, options, middlewareCallback) {
    if (middlewareType === 'incoming') {
      this.incomingMiddleware.use(middlewareCallback);
    } else if (middlewareType === 'incomingWrapped') {
      this.incomingWrappedMiddleware.fns.unshift(middlewareCallback);
    } else {
      const patchedMiddlewareCallback = (bot, update, message, next) => {
        if (middlewareCallback.length <= 3) {
          middlewareCallback(bot, message, next);
        } else {
          middlewareCallback(bot, update, message, next);
        }
      };
      if (middlewareType === 'outgoing') {
        this.outgoingMiddleware.use(patchedMiddlewareCallback);
      } else {
        this.outgoingWrappedMiddleware.use(patchedMiddlewareCallback);
      }
    }

    debug(`Added ${middlewareType} middleware to bot: ${this.bot.id} of type: ${this.bot.type}`)
  }

  __runIncomingMiddleware(preMiddlewareUpdate) {
    return new Promise((resolve, reject) => {
      const patchedBot = this.bot.__createBotPatchedWithUpdate(preMiddlewareUpdate);

      const incomingMiddlewareCallback = (err, bot, update) => {
        if (err && err !== 'skipAllIncoming' && err !== 'skip') {
          err.message = `"${err.message}". In incoming middleware`;
          return reject(err);
        }
        return resolve(update);
      };

      const IncomingWrappedMiddlewareCallback = (err, bot, update) => {
        if (typeof err === 'string') {
          if (err === 'skipAllIncoming' || err === 'skip') {
            return resolve(update);
          }
        }
        if (err && err !== 'skipWrappedIncomingOnly') {
          err.message = `"${err.message}". In incoming wrapped  middleware`;
          return reject(err);
        }
        // otherwise, I'm either at end, or skipWrappedIncoming was passed
        return this.incomingMiddleware.run(bot, update, incomingMiddlewareCallback);
      };

      this.incomingWrappedMiddleware.run(
        patchedBot, preMiddlewareUpdate, IncomingWrappedMiddlewareCallback);
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

      const outgoingWrappedMiddlewareCallback = (err, bot, update, message) => {
        if (err && err !== 'skipAllOutgoing' && err !== 'skip') {
          err.message = `"${err.message}". In outgoing wrapped middleware`;
          return reject(err);
        }
        return resolve(message);
      };

      const outgoingMiddlewareCallback = (err, bot, update, message) => {
        if (typeof err === 'string') {
          if (err === 'skipAllOutgoing' || err === 'skip') {
            return resolve(message);
          }
        }
        if (err && err !== 'skipNonWrappedOutgoingOnly') {
          err.message = `"${err.message}". In outgoing middleware`;
          return reject(err);
        }

        return this.outgoingWrappedMiddleware(
          bot, update, message, outgoingWrappedMiddlewareCallback);
      };

      this.outgoingMiddleware.run(
        patchedBot, sendOptions.__update, preMiddlewareMessage, outgoingMiddlewareCallback);
    });
  }

}

module.exports = Middleware;
