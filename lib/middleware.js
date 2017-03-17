'use strict';

const ware = require('ware');
const get = require('lodash').get;
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
    this.__validateUseParams(params);

    if (params.incoming && params.outgoing) {
      throw new Error('"use" should be called with only one of incoming ' +
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

    this.__validateUseParams(params);

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
      const options = params[middlewareType].options;

      if (middlewareType !== 'incoming' && middlewareType !== 'outgoing') {
        throw new TypeError('invalid middleware type. Type should be either \'incoming\' or \'outgoing\'');
      }
      if (!middlewareCallback || typeof middlewareCallback !== 'function') {
        throw new TypeError('middlewareCallback can\'t be of type ' +
        `${typeof middlewareCallback}. It needs to be a function`);
      }

      if (options && typeof options !== 'object') {
        throw new TypeError('options can\'t be of type ' +
        `${typeof options}. It needs to be an object`);
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
   *   botTypesToInclude,
   *   botTypesToExclude,
   *   botSends,
   *   botReceives,
   * }
   */
  __shouldAdd(options) {
    if (!options) {
      return true;
    }
    if (options.botTypesToInclude && options.botTypesToExclude) {
      throw new Error('Please use only one of botTypesToInclude and botTypesToExclude');
    }
    const botTypeNotIncluded = (options.botTypesToInclude &&
      options.botTypesToInclude.indexOf(this.bot.type) === -1);
    const botTypeExcluded = (options.botTypesToExclude &&
      options.botTypesToExclude.indexOf(this.bot.type) > -1);
    const botDoesNotReceive = (options.botReceives &&
      !get(this.bot.receives, options.botReceives, false));
    const botDoesNotSend = (options.botSends &&
      !get(this.bot.sends, options.botSends, false));

    if (botTypeNotIncluded ||
        botTypeExcluded ||
        botDoesNotReceive ||
        botDoesNotSend) {
      return false;
    }

    return true;
  }

  __addCallbackToAppropriateWareStack(middlewareType, middlewareCallback) {
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

  __runIncomingMiddleware(update) {
    return new Promise((resolve, reject) => {
      const patchedBot = this.bot.__createBotPatchedWithUpdate(update);

      const incomingMiddlewareCallback = (err) => {
        if (err && err !== 'skipAllIncoming' && err !== 'skip') {
          err.message = `"${err.message}". In incoming middleware`;
          return reject(err);
        }
        return resolve(update);
      };

      const IncomingWrappedMiddlewareCallback = (err) => {
        if (typeof err === 'string') {
          if (err === 'skipAllIncoming' || err === 'skip') {
            return resolve(update);
          }
        }
        if (err && err !== 'skipWrappedIncomingOnly') {
          err.message = `"${err.message}". In incoming wrapped middleware`;
          return reject(err);
        }
        // otherwise, I'm either at end, or skipWrappedIncoming was passed
        return this.incomingMiddleware.run(patchedBot, update, incomingMiddlewareCallback);
      };

      this.incomingWrappedMiddleware.run(
        patchedBot, update, IncomingWrappedMiddlewareCallback);
    });
  }

  __runOutgoingMiddleware(message, sendOptions) {
    if (!sendOptions) {
      sendOptions = {};
    }
    return new Promise((resolve, reject) => {
      if (sendOptions.ignoreMiddleware) {
        return resolve(message);
      }
      const patchedBot = this.bot.__createBotPatchedWithUpdate(sendOptions.__update);

      const outgoingWrappedMiddlewareCallback = (err) => {
        if (err && err !== 'skipAllOutgoing' && err !== 'skip') {
          err.message = `"${err.message}". In outgoing wrapped middleware`;
          return reject(err);
        }
        return resolve(message);
      };

      const outgoingMiddlewareCallback = (err) => {
        if (typeof err === 'string') {
          if (err === 'skipAllOutgoing' || err === 'skip') {
            return resolve(message);
          }
        }
        if (err && err !== 'skipNonWrappedOutgoingOnly') {
          err.message = `"${err.message}". In outgoing middleware`;
          return reject(err);
        }

        return this.outgoingWrappedMiddleware.run(
          patchedBot, sendOptions.__update, message, outgoingWrappedMiddlewareCallback);
      };

      this.outgoingMiddleware.run(
        patchedBot, sendOptions.__update, message, outgoingMiddlewareCallback);
    });
  }

}

module.exports = Middleware;
