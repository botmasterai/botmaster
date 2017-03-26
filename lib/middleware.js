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
      debug('added incoming middleware');
    } else {
      this.outgoingMiddlewareStack.push(middleware);
      debug('added outgoing middleware');
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
    debug('added wrapped middleware');

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
      middlewareStack: this.incomingMiddlewareStack,
    });
  }

  __runOutgoingMiddleware(bot, associatedUpdate, message) {
    return this.__runMiddlewareStack({
      bot,
      update: associatedUpdate,
      message,
      middlewareStack: this.outgoingMiddlewareStack,
    });
  }

  __runMiddlewareStack(context) {
    const bot = context.bot;
    const update = context.update;
    const patchedBot = bot.__createBotPatchedWithUpdate(update);
    const message = context.message;
    const middlewareStack = context.middlewareStack;

    let middlewarePromiseStack = Promise.resolve();

    for (const middleware of middlewareStack) {
      middlewarePromiseStack = middlewarePromiseStack

      .then((err) => {
        if (err) throw err;
        if (this.__shouldRun(middleware, context)) {
          return new Promise((next) => {
            if (middlewareStack === this.incomingMiddlewareStack) {
              middleware.controller(patchedBot, update, next);
            } else {
              middleware.controller(patchedBot, update, message, next);
            }
          });
        }

        //  otherwise, return nothing
        return Promise.resolve();
      });
    }

    return middlewarePromiseStack

    .then((err) => {
      throw err || 'skip';
    })
    .catch((err) => {
      if (err === 'skip') {
        return Promise.resolve();
      }

      throw err;
    });
  }

  /**
   * Simply returns true or false based on whether this middleware function
   * should be run for this object.
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
  __shouldRun(middleware, context) {
    if (middleware.type === 'outgoing') {
      // for now, no condition to not run outgoing middleware
      return true;
    }
    // we are de facto dealing with incoming middleware
    const ignoreReceivedEchoUpdate = !middleware.includeEcho &&
      get(context.update, 'message.is_echo');
    const ignoreReceivedDeliveryUpdate = !middleware.includeDelivery &&
      get(context.update, 'read');
    const ignoreReceivedReadUpdate = !middleware.includeRead &&
      get(context.update, 'read');

    if (ignoreReceivedEchoUpdate ||
        ignoreReceivedDeliveryUpdate ||
        ignoreReceivedReadUpdate) {
      return false;
    }

    return true;
  }
}

module.exports = Middleware;
