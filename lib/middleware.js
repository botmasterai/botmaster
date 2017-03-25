'use strict';

const get = require('lodash').get;
const debug = require('debug')('botmaster:middleware');

class Middleware {
  /**
   * Singleton Middleware class every botmaster instance should own one of
   * incomingMiddleware and
   * outgoingMiddleware variables;
   *
   * This class is not part of the exposed API. Use botmaster.use instead
   * @ignore
   */
  constructor() {
    this.incomingMiddlewareStack = [];
    this.outgoingMiddlewareStack = [];
  }

  /**
   * Add middleware.
   * See botmaster #use for more info.
   */
  __use(middleware) {
    this.__validateMiddleware(middleware);

    if (middleware.type === 'incoming') {
      this.incomingMiddlewareStack.push(middleware);
    } else {
      this.outgoingMiddlewareStack.push(middleware);
    }

    return this;
  }

  /**
   * Add Wrapped middleware
   * See botmaster #useWrapped for more info.
   *
   * @param {object} params
   */
  __useWrapped(incomingMiddleware, outgoingMiddleware) {
    this.__validateMiddleware(incomingMiddleware);
    this.__validateMiddleware(outgoingMiddleware);

    if (incomingMiddleware.type === 'outgoing') {
      throw new TypeError('first argument of "useWrapped" should be an' +
      'incoming middleware');
    } else if (outgoingMiddleware.type === 'incoming') {
      throw new TypeError('second argument of "useWrapped" should be an' +
      'outgoing middleware');
    }

    this.incomingMiddlewareStack.unshift(incomingMiddleware);
    this.outgoingMiddlewareStack.push(outgoingMiddleware);

    return this;
  }

  __validateMiddleware(middleware) {
    if (typeof middleware !== 'object') {
      throw new Error(`Can't add middleware of type ${typeof middleware}`);
    }

    const middlewareController = middleware.controller;

    if (middleware.type !== 'incoming' && middleware.type !== 'outgoing') {
      throw new TypeError('invalid middleware type. Type should be either ' +
      '\'incoming\' or \'outgoing\'');
    }
    if (typeof middlewareController !== 'function') {
      throw new TypeError('middleware controller can\'t be of type ' +
      `${typeof middlewareController}. It needs to be a function`);
    }
  }

  __runIncomingMiddleware(bot, update) {
    return this.__runMiddlewareStack({
      bot,
      update,
      midd
    })
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

  __runOutgoingMiddleware(message, associatedUpdate) {
    return new Promise((resolve, reject) => {
      const patchedBot = this.bot.__createBotPatchedWithUpdate(associatedUpdate);

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
          patchedBot, associatedUpdate, message, outgoingWrappedMiddlewareCallback);
      };

      this.outgoingMiddleware.run(
        patchedBot, associatedUpdate, message, outgoingMiddlewareCallback);
    });
  }

  __runMiddlewareStack(params) {
    const bot = params.bot;
    const update = params.update;
    const patchedBot = bot.__createBotPatchedWithUpdate(update);
    const message = params.message;
    const middlewareStack = params.middlewareStack;

    let middlewarePromiseStack = Promise.resolve();

    // used for next
    let doneWithMiddlewarePromiseStack = false;
    const nextPromiseStack = Promise.resolve();
    const next = this.__createNext(doneWithMiddlewarePromiseStack,
                                   nextPromiseStack);
    // ////////////////

    for (const middleware of middlewareStack) {
      middlewarePromiseStack = middlewarePromiseStack

      .then(() => {
        return middleware.controller(patchedBot, update, message, next);
      });
    }

    middlewarePromiseStack.then(() => {
      throw 'skip';
    })

    .catch((err) => {
      if (typeof err === 'string' && err === 'skip') {
        doneWithMiddlewarePromiseStack = true;
        return nextPromiseStack;
      }

      throw err;
    });

    return middlewarePromiseStack;
  }

  __createNext(doneWithMiddlewarePromiseStack, nextPromiseStack) {
    const next = () => {
      if (doneWithMiddlewarePromiseStack) {
        return Promise.reject(
          new Error('Can\'t call next twice in same middleware'));
      }
      return nextPromiseStack; // test that it can be nexted twice (in different functions)
    };

    return next;
  }

  /**
   * Simply returns true or false based on whether this middleware function
   * should be added to the bot.
   * @ignore
   * @param {object} options
   *
   * options is an object that can contain any of:
   * {
   *   includeEcho, // opt-in to get echo updates
   *   includeDelivery, // opt-in to get delivery updates
   *   includeRead, // opt-in to get read updates
   * }
   */
  __shouldRun(options) {
    if (!options) {
      return true;
    }
    const botTypeNotIncluded = (options.botTypesToInclude &&
      options.botTypesToInclude.indexOf(this.bot.type) === -1);
    const botTypeExcluded = (options.botTypesToExclude &&
      options.botTypesToExclude.indexOf(this.bot.type) > -1);
    const botDoesNotReceive = (options.botReceives &&
      !get(this.bot.receives, options.botReceives, false));
    const botDoesNotSend = (options.botSends &&
      !get(this.bot.sends, options.botSends, false));
    const botDoesNotRetrieveUserInfo = (options.botRetrievesUserInfo &&
      !this.bot.retrievesUserInfo);

    if (botTypeNotIncluded ||
        botTypeExcluded ||
        botDoesNotReceive ||
        botDoesNotSend ||
        botDoesNotRetrieveUserInfo
        ) {
      return false;
    }

    return true;
  }
}

module.exports = Middleware;
