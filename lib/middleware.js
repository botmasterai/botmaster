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
      debug('added2  incoming middleware');
    } else {
      this.outgoingMiddlewareStack.push(middleware);
      debug('added2  outgoing middleware');
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

    // used for next
    let doneWithMiddlewarePromiseStack = false;
    const nextPromiseStack = Promise.resolve();
    const next = this.__createNext(doneWithMiddlewarePromiseStack,
                                   nextPromiseStack);
    // ////////////////

    const throwThrowableResolvedValue = (resolvedValue) => {
      if (resolvedValue === 'runNextNow' || resolvedValue === 'cancel' ||
          resolvedValue === 'skip') {
        throw resolvedValue;
      }
    };

    for (const middleware of middlewareStack) {
      middlewarePromiseStack = middlewarePromiseStack

      .then((resolvedValue) => {
        throwThrowableResolvedValue(resolvedValue);
        if (this.__shouldRun(middleware, context)) {
          if (middlewareStack === this.incomingMiddlewareStack) {
            return middleware.controller(patchedBot, update, next);
          }

          return middleware.controller(patchedBot, update, message, next);
        }

        //  otherwise, return nothing
        return Promise.resolve();
      });
    }

    return middlewarePromiseStack.then((resolvedValue) => {
      throwThrowableResolvedValue(resolvedValue);
      // otherwise, start running next
      throw String('runNextNow');
    })

    .catch((err) => {
      if (err === 'runNextNow') {
        doneWithMiddlewarePromiseStack = true;
        return nextPromiseStack;
      } else if (err === 'skip') {
        return Promise.resolve();
      }

      // this includes 'cancel'
      throw err;
    });

    // return middlewarePromiseStack;
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
    const ignoreReceivedDeliveryUpdate = !middleware.includeRead &&
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
