'use strict';

const debugBase = require('debug');

class TwoDotXError extends Error {
  constructor(message) {
    super(message);

    this.message += 'See the latest documentation ' +
      'at http://botmasterai.com to see the preferred syntax. ' +
      'Alternatively, you can downgrade botmaster to 2.x.x by doing: ' +
      '"npm install --save botmaster@2.x.x" or "yarn add botmaster@2.x.x"';
  }

}

class SendMessageTypeError extends Error {
  constructor(botType, messageType) {
    super(`Bots of type ${botType} can't send` +
          ` messages with ${messageType}`);

    const debug = debugBase(`botmaster:${botType}`);
    debug(`Tried sending message of type ${messageType} to bot of ` +
          `type ${botType} that do not support this message type`);
  }
}

module.exports = {
  TwoDotXError,
  SendMessageTypeError,
};
