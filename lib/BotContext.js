'use strict';

const sendMethods = [
  'sendMessage',
  'sendMessageTo',
  'sendTextMessageTo',
  'reply',
  'sendAttachmentTo',
  'sendAttachmentFromURLTo',
  'sendDefaultButtonMessageTo',
  'sendIsTypingMessageTo',
  'sendRaw',
  'sendCascadeTo',
  'sendTextCascadeTo',
];
class BotContext {
  constructor(bot, update) {
    this.bot = bot;
    this.update = update;
    sendMethods.forEach((method) => {
      this[method] = function () {
        return this.send(method, Array.from(arguments));
      };
    });
  }

  send(method, args) {
      console.log('hi')
      console.log(method)
     console.log(args)
    const regularArgsNum = this.bot[method].length;
    const regularArgs = args.slice(0, regularArgsNum);
    const extraArgs = this.__getSendExtraArgs(args.slice(regularArgsNum));
    const newArgs = regularArgs.concat([extraArgs.sendOptions, extraArgs.cb]);
    return this.bot[method].apply(this.bot, newArgs);
  }

  __getSendExtraArgs() {
    let cb;
    let sendOptions;

    if (arguments[0]) {
      if (typeof arguments[0] === 'function') {
        cb = arguments[0];
      } else if (typeof arguments[0] === 'object') {
        sendOptions = arguments[0];
      }
    } else {
      sendOptions = {};
    }
    sendOptions.update = this.update;

    if (arguments[1] && typeof arguments[1] === 'function') {
      cb = arguments[1];
    }

    return {
      cb,
      sendOptions,
    };
  }

}

module.exports = BotContext;
