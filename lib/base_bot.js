'use strict';

const EventEmitter = require('events');
const middleware = require('./middleware');
const OutgoingMessage = require('./outgoing_message');
const debug = require('debug')('botmaster:BaseBot');

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

    // just being explicit about what subclasses can send and receive.
    // anything else they want to implement has to be done in raw mode.
    // I.e. using bot class events and oupon receiving and sendRaw for sending.

    this.receives = {
      text: false,
      attachment: {
        audio: false,
        file: false,
        image: false,
        video: false,
        location: false,
        // can occur in FB messenger when user sends a message which only contains a URL
        // most platforms won't support that
        fallback: false,
      },
      echo: false,
      read: false,
      postback: false,
      // in FB Messenger, this will exist whenever a user clicks on
      // a quick_reply button. It will contain the payload set by the developer
      // when sending the outgoing message. Bot classes should only set this
      // value to true if the platform they are building for has an equivalent
      // to this.
      quickReply: false,
    };

    this.sends = {
      text: false,
      quickReply: false,
      locationQuickReply: false,
      senderAction: {
        typingOn: false,
        typingOff: false,
        markSeen: false,
      },
      attachment: {
        audio: false,
        file: false,
        image: false,
        video: false,
      },
    };

    this.requiresWebhook = false;
    this.requiredCredentials = [];
  }

  /**
  * Just validating the settings and throwing errors or warnings
  * where appropriate.
  * @param {object} settings
  */
  __applySettings(settings) {
    if (typeof settings !== 'object') {
      throw new TypeError(`settings must be object, got  + ${typeof settings}`);
    }

    if (this.requiredCredentials.length > 0) {
      if (!settings.credentials) {
        throw new Error(`no credentials specified for bot of type '${this.type}'`);
      } else {
        this.credentials = settings.credentials;
      }

      for (const credentialName of this.requiredCredentials) {
        if (!this.credentials[credentialName]) {
          throw new Error(`bots of type '${this.type}' are expected to have '${credentialName}' credentials`);
        }
      }
    }

    if (this.requiresWebhook) {
      if (!settings.webhookEndpoint) {
        throw new Error(`bots of type '${this.type}' must be defined with webhookEndpoint in their settings`);
      } else {
        this.webhookEndpoint = settings.webhookEndpoint;
      }
    } else if (settings.webhookEndpoint) {
      throw new Error(`bots of type '${this.type}' do not require webhookEndpoint in their settings`);
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
   * #createOutgoingMessage exposes the OutgoingMessage constructor
   * via BaseBot. This simply means one can create their own
   * OutgoingMessage object using any bot object. They can then compose
   * it with all its helper functions
   *
   * @param {object} message base object that the outgoing Message should be based on
   *
   * @return {OutgoingMessage} outgoingMessage. The same object passed in with all the helper functions from OutgoingMessage
   */
  static createOutgoingMessage(message) {
    return new OutgoingMessage(message);
  }

  createOutgoingMessage(message) {
    return BaseBot.createOutgoingMessage(message);
  }

  /**
   * same as #createOutgoingMessage, creates empty outgoingMessage with
   * id of the recipient set. Again, this is jut sugar syntax for creating a
   * new outgoingMessage object
   *
   * @param {string} recipientId id of the recipient the message is for
   *
   * @return {OutgoingMessage} outgoingMessage. A valid OutgoingMessage object with recipient set.
   */

  static createOutgoingMessageFor(recipientId) {
    return new OutgoingMessage().addRecipientById(recipientId);
  }

  createOutgoingMessageFor(recipientId) {
    return BaseBot.createOutgoingMessageFor(recipientId);
  }

  /**
   * sendMessage() falls back to the sendMessage implementation of whatever
   * subclass inherits form BaseBot. The expected format is normally any type of
   * message object that could be sent on to messenger
   * @param {object} message
   * @param {boolean} [sendOptions] options used for sending the message. e.g. ignoreMiddleware
   * @param {function} [cb] optional callback function
   *
   * @return {Promise} promise
   * The returned promise for all sendMessage type events returns a body that
   * looks something like this:
   *  {
   *   raw: rawBody,
   *   recipient_id: <id_of_user>,
   *   message_id: <message_id_of_what_was_just_sent>
   *   sentMessage: <sent_message_object>
   *  }
   *
   * Some platforms may not have either of these parameters. If that's the case,
   * the value assigned will be null or some other suitable value as the
   * equivalent to Messenger's seq in Telegram.
   *
   */
  sendMessage(message) {
    const extraArgs = this.__getSendExtraArgs(arguments[1], arguments[2]);
    const cb = extraArgs.cb; // could be undefined
    const sendOptions = extraArgs.sendOptions; // could be undefined

    const outgoingMessage = !(message instanceof OutgoingMessage)
      ? new OutgoingMessage(message)
      : message;

    return middleware.__runOutgoingMiddleware(this, outgoingMessage, sendOptions)

    .then((middlewaredMessage) => {
      return this.__sendMessage(middlewaredMessage, sendOptions)

      .then((body) => {
        body.sentMessage = middlewaredMessage;
        if (cb) {
          return cb(null, body);
        }
        return body;
      });
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
   * @param {object} [sendOptions] just options for sending.
   * @param {function} [cb] optional callback function if not using promises
   *
   * @return {Promise} promise
   */
  sendMessageTo(message, recipientId, sendOptions, cb) {
    const outgoingMessage = this.createOutgoingMessage({
      message,
    });
    outgoingMessage.addRecipientById(recipientId);

    return this.sendMessage(outgoingMessage, sendOptions, cb);
  }

  /**
   * sendTextMessageTo() Just makes it easier to send a text message with
   * minimal structure.
   * @param {string} text
   * @param {string} recipientId
   *
   * @return {Promise} promise
   */
  sendTextMessageTo(text, recipientId, sendOptions, cb) {
    if (!this.sends.text) {
      return this.__throwCantSendError('text', sendOptions, cb);
    }
    const outgoingMessage = this.createOutgoingMessage()
      .addRecipientById(recipientId)
      .addText(text);

    return this.sendMessage(outgoingMessage, sendOptions, cb);
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
  reply(incomingUpdate, text, sendOptions, cb) {
    return this.sendTextMessageTo(text, incomingUpdate.sender.id, sendOptions, cb);
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
  sendAttachmentTo(attachment, recipientId, sendOptions, cb) {
    if (!this.sends.attachment) {
      return this.__throwCantSendError('attachment', sendOptions, cb);
    }
    const outgoingMessage = this.createOutgoingMessage()
      .addRecipientById(recipientId)
      .addAttachment(attachment);

    return this.sendMessage(outgoingMessage, sendOptions, cb);
  }

  /**
   * sendAttachmentFromUrlTo() makes it easier to send an attachment message with
   * minimal structure.
   * @param {string} type
   * @param {string} url
   * @param {string} recipientId
   *
   * @return {Promise} promise
   */
  sendAttachmentFromUrlTo(type, url, recipientId, sendOptions, cb) {
    const attachment = {
      type,
      payload: {
        url,
      },
    };

    return this.sendAttachmentTo(attachment, recipientId, sendOptions, cb);
  }

  /**
   * sendDefaultButtonMessageTo() makes it easier to send a default set of
   * buttons. The default button type is the Messenger quick_replies, where
   * the payload is the same as the button title and the content_type is text.
   *
   * @param {Array} buttonTitles
   * @param {string|object} textOrAttachment, if falsy, will be set to a default text of "Please select one of:"
   * @param {string} recipientId
   * @param {object} [sendOptions]
   * @param {function} [cb]
   *
   * @return {Promise} promise
   */
  sendDefaultButtonMessageTo(buttonTitles, textOrAttachment, recipientId) {
    if (!this.sends.quickReply) {
      return this.__throwCantSendError('quick replies', arguments[3], arguments[4]);
    }
    const extraArgs = this.__getSendExtraArgs(arguments[3], arguments[4]);
    const cb = extraArgs.cb; // could be undefined

    if (buttonTitles.length > 10) {
      const error = new Error('buttonTitles must be of length 10 or less');
      if (cb) {
        return cb(error);
      }
      return Promise.reject(error);
    }

    const outgoingMessage = this.createOutgoingMessage();
    outgoingMessage.addRecipientById(recipientId);
    // deal with textOrAttachment
    if (!textOrAttachment && this.sends.text) {
      outgoingMessage.addText('Please select one of:');
    } else if (textOrAttachment.constructor === String) {
      if (!this.sends.text) {
        return this.__throwCantSendError('text', arguments[3], arguments[4]);
      }
      outgoingMessage.addText(textOrAttachment);
    } else if (textOrAttachment.constructor === Object && textOrAttachment.type) {
      if (!this.sends.attachment) {
        return this.__throwCantSendError('attachment', arguments[3], arguments[4]);
      }
      outgoingMessage.addAttachment(textOrAttachment);
    } else {
      const error = new Error('third argument must be a "String", an attachment "Object" or absent');
      if (cb) {
        return cb(error);
      }
      return Promise.reject(error);
    }

    const quickReplies = [];
    for (const buttonTitle of buttonTitles) {
      quickReplies.push({
        content_type: 'text',
        title: buttonTitle,
        payload: buttonTitle, // indeed, in default mode payload is buttonTitle
      });
    }
    outgoingMessage.addQuickReplies(quickReplies);
    return this.sendMessage(outgoingMessage, arguments[3], arguments[4]);
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
  sendIsTypingMessageTo(recipientId, sendOptions, cb) {
    if (!this.sends.senderAction || !this.sends.senderAction.typingOn) {
      return this.__throwCantSendError('typing_on sender action', sendOptions, cb);
    }
    const isTypingMessage = {
      recipient: {
        id: recipientId,
      },
      sender_action: 'typing_on',
    };
    return this.sendMessage(isTypingMessage, sendOptions, cb);
  }

  /**
   * sendCascadeTo() allows developers to send a cascade of messages
   * in a sequence. All types of messages can be sent (including raw messages).
   *
   * @param {Array} messageArray of messages in a format as such: [{raw: someRawObject}, {message: some valid outgoingMessage}]
   *
   * @return {Promise} promise
   * The returned value an in-place array of bodies received from the client platform
   * The objects of the array are of the same format as for standard messages
   *
   */

  sendCascade(messageArray) {
    const extraArgs = this.__getSendExtraArgs(arguments[1], arguments[2]);
    const cb = extraArgs.cb; // could be undefined
    const sendOptions = extraArgs.sendOptions; // could be undefined

    let index = arguments[3] || 0;
    const returnedBodies = arguments[4] || [];

    const currMessage = messageArray[index];
    let sendMessageFunction;

    if (currMessage.raw) {
      sendMessageFunction = this.sendRaw.bind(this, currMessage.raw);
    } else if (currMessage.message) {
      sendMessageFunction = this.sendMessage.bind(this,
        currMessage.message, sendOptions);
    } else {
      const err = new Error('No valid message options specified');

      if (cb) {
        return cb(err);
      }

      return Promise.reject(err);
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

      return this.sendCascade(messageArray,
        sendOptions, cb, index, returnedBodies);
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

  sendTextCascadeTo(textArray, recipientId) {
    const cascadeArray = textArray.map((text) => {
      const outgoingMessage = this.createOutgoingMessageFor(recipientId)
        .addText(text);

      return { message: outgoingMessage };
    });

    return this.sendCascade(cascadeArray, arguments[2], arguments[3]);
  }

  /**
   * sendRaw() simply sends a raw platform dependent message. This method
   * calls __sendRaw in each botClass that does the actual work.
   *
   * @param {Object} rawMessage
   *
   * @return {Promise} promise
   *
   */
  sendRaw(rawMessage, cb) {
    return this.__sendRaw(rawMessage)

    .then((body) => {
      body.sentMessage = rawMessage;

      if (cb) {
        return cb(null, {});
      }

      return body;
    });
  }

  /**
   * __getSendExtraArgs() is simply an internal helper function to allow to
   * extract a potential callback set by the user as well as potential sendOptions
   * those are expected as follows
   *
   * @param {object || function} sendOptions or cb function
   * @param {function} cb function just the id of the recipient to send the messages to.
   *
   * @return {object} with cb and sendOptions as parameters
   *
   */

  __getSendExtraArgs() {
    let cb;
    let sendOptions;

    if (arguments[0]) {
      if (typeof arguments[0] === 'function') {
        cb = arguments[0];
      } else if (typeof arguments[0] === 'object') {
        sendOptions = arguments[0];
      }
    }

    if (arguments[1] && typeof arguments[1] === 'function') {
      cb = arguments[1];
    }

    return {
      cb,
      sendOptions,
    };
  }

  /**
   * This method is used in all helper functions to return a promise or callback
   * the callback expected whenever a developer tries to send a message for
   * which the BotClass (and possibly the platform) has no support.
   * E.g. trying to use sendDefaultButtonMessageTo, but platform has no
   * support for quick replies. This makes it fail "silently". I.e. it won't
   */
  __throwCantSendError(messageType) {
    debug(`Tried sending message of type ${messageType} to bot of ` +
          `type ${this.type} that do not support this message type`);

    const extraArgs = this.__getSendExtraArgs(arguments[1], arguments[2]);
    const cb = extraArgs.cb;

    const err = new TypeError(`Bots of type ${this.type} can't send messages with ${messageType}`);

    if (cb) {
      return cb(err);
    }

    return Promise.reject(err);
  }

  /**
   * __emitUpdate() emits an update after going through the
   * incoming middleware based on the passed in update. Note that we patched
   * the bot object with the update, so that it is available in the outgoing
   * middleware too.
   *
   * @param {object} update
   */
  __emitUpdate(update) {
    const patchedBot = this.__createBotPatchedWithUpdate(update);

    return middleware.__runIncomingMiddleware(patchedBot, update)
    .then(middlewaredUpdate => this.emit('update', middlewaredUpdate))
    .catch((err) => {
      // doing this, because otherwise, errors done by developer aren't
      // dealt with
      if (err.message.indexOf('incoming middleware') < 0) {
        // don't update the message if it is the incoming middleware message
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
   * __createBotPatchedWithUpdate is used to create a new bot
   * instance that on sendMessage sends the update as an sendOption.
   * This is important, because we want to have access to the update object
   * even within outgoing middleware. This allows us to always have access
   * to it.
   *
   * @param {object} update - update to be patched to sendMessage
   * @returns {object} bot
   */
  __createBotPatchedWithUpdate(update) {
    const newBot = Object.create(this);
    newBot.sendMessage = (message, sendOptions, cb) => {
      if (!sendOptions) {
        sendOptions = {};
      } else if (typeof sendOptions === 'function') {
        cb = sendOptions;
        sendOptions = {};
      }
      sendOptions.__update = update;
      return this.sendMessage(message, sendOptions, cb);
    };
    return newBot;
  }
}

module.exports = BaseBot;
