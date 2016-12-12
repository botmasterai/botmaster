'use strict';

const EventEmitter = require('events');
const ware = require('ware');

class BaseBot extends EventEmitter {
  /**
   * Constructor to the BaseBot class from which all the bot classes inherit.
   * A set a basic functionalities are defined here that have to be implemented
   * in the subclasses in order for them to work.
   *
   * @param {object} settings - settings to be passed onto the class extending BaseBot
   */
  constructor(settings) {
    super();
    this.type = 'baseBot';
    this.requiresWebhook = false;
    this.requiredCredentials = [];
    this.incomingMiddleware = ware();
    this.outgoingMiddleware = ware();
  }

  /**
  * Just validating the settings and throwing errors or warnings
  * where appropriate.
  * @param {object} settings
  */
  __applySettings(settings) {
    if (typeof settings !== 'object') {
      throw new TypeError(`ERROR: settings must be object, got  + ${typeof settings}`);
    }

    if (this.requiredCredentials.length > 0) {
      if (!settings.credentials) {
        throw new Error(`ERROR: no credentials specified for bot of type '${this.type}'`);
      } else {
        this.credentials = settings.credentials;
      }

      for (const credentialName of this.requiredCredentials) {
        if (!this.credentials[credentialName]) {
          throw new Error(`ERROR: bots of type '${this.type}' are expected to have '${credentialName}' credentials`);
        }
      }
    }

    if (this.requiresWebhook) {
      if (!settings.webhookEndpoint) {
        throw new Error(`ERROR: bots of type '${this.type}' must be defined with webhookEndpoint in their settings`);
      } else {
        this.webhookEndpoint = settings.webhookEndpoint;
      }
    }
  }

  /**
   * sets up the app if needed.
   * As in sets up the endpoints that the bot can get called onto
   * see code in telegram_bot to see an example of this in action
   * Should not return anything
   */
  __createMountPoints() {}

  /**
   * Format the update gotten from the bot source (telegram, messenger etc..).
   * Returns an update in a standard format
   *
   * @param {object} rawUpdate
   * @return {object} update
   */
  __formatUpdate(rawUpdate) {}


  /**
   * sendMessage() falls back to the sendMessage implementation of whatever
   * subclass inherits form BaseBot. The expected format is normally any type of
   * message object that could be sent on to messenger
   * @param {object} message
   *
   * @return {Promise} promise
   * The returned promise for all sendMessage type events returns a body that
   * looks something like this:
   *  {
   *   raw: rawBody,
   *   recipient_id: <id_of_user>,
   *   message_id: <message_id_of_what_was_just_sent>
   *  }
   *
   * Some platforms may not have either of these paramters. If that's the case,
   * the value assigned will be null or some other suitable value as the
   * equivalent to Messenger's seq in Telegram.
   *
   */
  sendMessage(message, cb) {
    return this.__runOutgoingMiddleware(message)

    .then(this.__sendMessage.bind(this))

    .then((body) => {
      if (cb) {
        return cb(null, body);
      }
      return body;
    })

    .catch((err) => {
      if (cb) {
        return cb(err);
      }

      throw err;
    });
  }

  __sendMessage(message) {}

  /**
   * sendMessageTo() Just makes it easier to send a message without as much
   * structure. message object can look something like this:
   * message: {
   *  text: 'Some random text'
   * }
   * @param {object} message
   * @param {string} recipientId
   *
   * @return {Promise} promise
   */
  sendMessageTo(message, recipientId, cb) {
    const fullMessageObject = {
      recipient: {
        id: recipientId,
      },
      message,
    };
    return this.sendMessage(fullMessageObject, cb);
  }

  /**
   * sendTextMessageTo() Just makes it easier to send a text message with
   * minimal structure.
   * @param {string} text
   * @param {string} recipientId
   *
   * @return {Promise} promise
   */
  sendTextMessageTo(text, recipientId, cb) {
    const message = {
      text,
    };
    return this.sendMessageTo(message, recipientId, cb);
  }

  /**
   * reply() Another way to easily send a text message. In this case,
   * we just send the update that came in as is and then the text we
   * want to send as a reply.
   * @param {object} incommingUpdate
   * @param {string} text
   *
   * @return {Promise} promise
   */
  reply(incomingUpdate, text, cb) {
    return this.sendTextMessageTo(text, incomingUpdate.sender.id, cb);
  }

  /**
   * sendAttachmentTo() makes it easier to send an attachment message with
   * less structure. attachment typically looks something like this:
   * const attachment = {
   *   type: 'image',
   *   payload: {
   *     url: "some_valid_url_of_some_image"
   *   },
   * };
   * @param {object} attachment
   * @param {string} recipientId
   *
   * @return {Promise} promise
   */
  sendAttachmentTo(attachment, recipientId, cb) {
    const message = {
      attachment,
    };
    return this.sendMessageTo(message, recipientId, cb);
  }

  /**
   * sendAttachmentFromURLTo() makes it easier to send an attachment message with
   * minimal structure.
   * @param {string} type
   * @param {string} url
   * @param {string} recipientId
   *
   * @return {Promise} promise
   */
  sendAttachmentFromURLTo(type, url, recipientId, cb) {
    const attachment = {
      type,
      payload: {
        url,
      },
    };
    return this.sendAttachmentTo(attachment, recipientId, cb);
  }

  /**
   * sendDefaultButtonMessageTo() makes it easier to send a default set of
   * buttons. The default button type is the Messenger quick_replies. Each
   * integration has its opinionated equivalent. Keyboard buttons for Telegram
   * and simple text with newlines for Twitter(as Twitter DM has no buttons).
   *
   * @param {Array} buttonTitles
   * @param {string} recipientId
   * @param {string/object} textOrAttachment - optional
   *
   * @return {Promise} promise
   */
  sendDefaultButtonMessageTo(buttonTitles, recipientId, textOrAttachment, cb) {
    if (buttonTitles.length > 10) {
      const error = new Error('ERROR: buttonTitles must be of length 10 or less');
      if (cb) {
        return cb(error);
      }
      return new Promise((resolve, reject) => reject(error));
    }

    const message = {};
    // deal with textOrAttachment
    if (!textOrAttachment) {
      message.text = 'Please select one of:';
    } else if (textOrAttachment.constructor === String) {
      message.text = textOrAttachment;
    } else if (textOrAttachment.constructor === Object) {
      message.attachment = textOrAttachment;
    } else {
      const error = new Error('ERROR: third argument must be a "String", "Object" or absent');
      if (cb) {
        return cb(error);
      }
      return new Promise((resolve, reject) => reject(error));
    }

    message.quick_replies = [];
    for (const buttonTitle of buttonTitles) {
      message.quick_replies.push({
        content_type: 'text',
        title: buttonTitle,
        payload: buttonTitle, // indeed, in default mode payload in buttonTitle
      });
    }
    return this.sendMessageTo(message, recipientId, cb);
  }

  /**
   * sendIsTypingMessageTo() just sets the is typing status to the platform
   * if available.
   * based on the passed in update
   *
   * @param {string} recipientId
   *
   * @return {Promise} promise
   * The returned value is different from the standard one. It looks something
   * like this in this case:
   *
   * {
   *   recipient_id: <id_of_user>
   * }
   *
   */
  sendIsTypingMessageTo(recipientId, cb) {
    const isTypingMessage = {
      recipient: {
        id: recipientId,
      },
      sender_action: 'typing_on',
    };
    return this.sendMessage(isTypingMessage, cb);
  }

  /**
   * sendRaw() simply sends a raw platform dependent message
   *
   * @param {Object} rawMessage
   *
   * @return {Promise} promise
   *
   */
  sendRaw(rawMessage, cb) {
    // code to be overwritten in subclasses
    if (cb) {
      return cb(null, {});
    }

    return new Promise((resolve) => {
      resolve({});
    });
  }

  /**
   * sendCascadeTo() allows developers to send a cascade of messages
   * in a sequence. All types of messages can be sent (including raw messages).
   *
   * @param {Array} messageArray of messages in a format as such: [{text: 'something'}, {message: someMessengerValidMessage}]
   * @param {string} recipientId just the id of the recipient to send the messages to. If using full messages, the id will not be used
   *
   * @return {Promise} promise
   * The returned value an in-place array of bodies received from the client platform
   * The objects of the array are of the same format as for standard messages
   *
   */

  sendCascadeTo(messageArray, recipientId, cb) {
    let index = arguments[3] || 0;
    const returnedBodies = arguments[4] || [];

    const currMessage = messageArray[index];
    let sendMessageFunction;

    if (currMessage.raw) {
      sendMessageFunction = this.sendRaw.bind(this, currMessage.raw);
    } else if (currMessage.message) {
      sendMessageFunction = this.sendMessage.bind(this,
        currMessage.message);
    } else if (currMessage.buttons) {
      if (currMessage.attachment && currMessage.text) {
        const err = new Error('Please use either one of text or attachment with buttons');

        if (cb) return cb(err);
        return new Promise((__, reject) => {
          reject(err);
        });
      }
      const textOrAttachment = currMessage.attachment || currMessage.text || undefined;
      sendMessageFunction = this.sendDefaultButtonMessageTo.bind(this,
        currMessage.buttons, recipientId, textOrAttachment);
    } else if (currMessage.attachment) {
      sendMessageFunction = this.sendAttachmentTo.bind(this,
        currMessage.attachment, recipientId);
    } else if (currMessage.text) {
      sendMessageFunction = this.sendTextMessageTo.bind(this,
        currMessage.text, recipientId);
    } else if (currMessage.isTyping) {
      sendMessageFunction = this.sendIsTypingMessageTo.bind(this, recipientId);
    } else {
      const err = new Error('No valid message options specified');

      if (cb) return cb(err);
      return new Promise((__, reject) => {
        reject(err);
      });
    }

    return sendMessageFunction()

    .then((body) => {
      returnedBodies.push(body);
      index += 1;
      if (index >= messageArray.length) {
        if (cb) {
          return cb(null, returnedBodies);
        }
        return returnedBodies;
      }

      return this.sendCascadeTo(messageArray,
        recipientId, cb, index, returnedBodies);
    })

    .catch((err) => {
      if (cb) return cb(err);
      throw err;
    });
  }

  /**
   * sendTextCascadeTo() is simply a helper function around sendCascadeTo.
   * It allows developers to send a cascade of text messages more easily.
   *
   * @param {Array} textArray of messages in a format as such: ['message1', 'message2']
   * @param {string} recipientId just the id of the recipient to send the messages to.
   *
   * @return {Promise} promise
   * The returned value an in-place array of bodies received from the client platform
   * The objects of the array are of the same format as for standard messages
   *
   */

  sendTextCascadeTo(textArray, recipientId, cb) {
    const messageArray = textArray.map((text) => {
      const textObject = {
        text,
      };

      return textObject;
    });

    return this.sendCascadeTo(messageArray, recipientId, cb);
  }

  /**
   * __emitUpdate() emits an update after going through the middleware
   * based on the passed in update
   *
   * @param {object} update
   */
  __emitUpdate(update) {

    return this.__runIncomingMiddleware(update)

    .then(middlewaredUpdate => this.emit('update', middlewaredUpdate))
    .catch((err) => {
      // doing this, because otherwise, errors done by developer aren't
      // dealt with
      if (err.message.indexOf('incoming middleware') < 0) {
        // don't update the message is it is the incoming middleware message
        err.message = `"${err.message}". This is most probably on your end.`;
      }
      this.emit('error', err);
    });
  }

  /**
   * Retrieves the basic user info from a user if platform supports it
   *
   * @param {string} userId
   *
   * @return {Promise} promise that resolves into the user info or an empty object by default
   */
  getUserInfo(userId) {
    return new Promise(resolve => resolve());
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
      this.outgoingMiddleware.use(middlewareCallback);
    }
    // otherwise just don't do anything
  }

  __runIncomingMiddleware(preMiddlewareUpdate) {
    return new Promise((resolve, reject) => {
      this.incomingMiddleware.run(this, preMiddlewareUpdate, (err, bot, udpate) => {
        if (err) {
          err.message = `"${err.message}". In incoming middleware`;
          return reject(err);
        }
        return resolve(udpate);
      });
    });
  }

  __runOutgoingMiddleware(preMiddlewareMessage) {
    return new Promise((resolve, reject) => {
      this.outgoingMiddleware.run(this, preMiddlewareMessage, (err, bot, message) => {
        if (err) {
          err.message = `"${err.message}". In outgoing middleware`;
          return reject(err);
        }
        return resolve(message);
      });
    });
  }

}

module.exports = BaseBot;
