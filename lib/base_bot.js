'use strict';

const EventEmitter = require('events');
const OutgoingMessage = require('./outgoing_message');
const get = require('lodash').get;
const TwoDotXError = require('./errors').TwoDotXError;
const SendMessageTypeError = require('./errors').SendMessageTypeError;

/**
 * The class from which all Bot classes mus inherit. It contains all the base
 * methods that are accessible via all bot classes. Classes that inherit from
 * BaseBot and want to make implementation specific methods available have to
 * prepend the method name with an underscore; e.g. in botmaster-messenger:
 * _getGetStartedButton
 */

class BaseBot extends EventEmitter {
  /**
   * Constructor to the BaseBot class from which all the bot classes inherit.
   * A set a basic functionalities are defined here that have to be implemented
   * in the subclasses in order for them to work.
   *
   * @param {object} settings - inheritors of BaseBot take a settings
   * object as first param.
   * @example
   * // In general however, one can instantiate a bot object like this:
   * const bot = new BaseBotSubClass({ // e.g. MessengerBot
   *   credentials: <my_base_bot_sub_class_credentials>,
   *   webhookEnpoint: 'someEndpoint' // only if class requires them
   * })
   */
  constructor() {
    super();
    this.type = 'baseBot';

    // just being explicit about what subclasses can send and receive.
    // anything else they want to implement has to be done in raw mode.
    // I.e. using bot class events and upon receiving and sendRawMessage for sending.

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
      delivery: false,
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

    this.retrievesUserInfo = false;

    this.requiresWebhook = false;
    this.requiredCredentials = [];
  }

  /**
  * Just validating the settings and throwing errors or warnings
  * where appropriate.
  * @ignore
  * @param {object} settings
  */
  __applySettings(settings) {
    if (typeof settings !== 'object') {
      throw new TypeError(`settings must be object, got ${typeof settings}`);
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
   * see code in bot classes packages to see examples of this in action
   * Should not return anything
   *
   * __createMountPoints() {}
   */

  /**
   * Format the update gotten from the bot source (telegram, messenger etc..).
   * Returns an update in a standard format
   *
   * @param {object} rawUpdate
   * @return {object} update
   *
   * __formatUpdate(rawUpdate) {}
   */

  /**
   * #createOutgoingMessage exposes the OutgoingMessage constructor
   * via BaseBot. This simply means one can create their own
   * OutgoingMessage object using any bot object. They can then compose
   * it with all its helper functions
   *
   * @param {object} message base object that the outgoing Message should be based on
   *
   * @return {OutgoingMessage} outgoingMessage. The same object passed in with
   * all the helper functions from OutgoingMessage
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
   *
   * @return {Promise}
   *
   * @example
   * // The returned promise for all sendMessage type events resolves with
   * // a body that looks something like this:
   *  {
   *   raw: rawBody, // can be undefined (e.g. if rawBody is directly returned)
   *   recipient_id: <id_of_user>,
   *   message_id: <message_id_of_what_was_just_sent>
   *   sentMessage: <sent_message_object>
   *  }
   *
   * // Some platforms may not have either of these parameters. If that's the case,
   * // the value assigned will be null or some other suitable value as the
   * // equivalent to Messenger's seq in Telegram.
   *
   */
  sendMessage(message, sendOptions) {
    sendOptions = sendOptions || {}; // empty object if undefined

    const outgoingMessage = !(message instanceof OutgoingMessage)
      ? new OutgoingMessage(message)
      : message;

    const responseBody = {};
    return this.__validateSendOptions(sendOptions)

    .then(() => {
      let outgoingMiddlewarePromise;
      if (this.master && !sendOptions.ignoreMiddleware) {
        outgoingMiddlewarePromise = this.master.middleware.__runOutgoingMiddleware(
          this, sendOptions.__update, outgoingMessage);
      } else {
        // don't actually go through middleware
        outgoingMiddlewarePromise = Promise.resolve(outgoingMessage);
      }
      return outgoingMiddlewarePromise;
    })
    .then(() => {
      responseBody.sentOutgoingMessage = outgoingMessage;
      return this.__formatOutgoingMessage(outgoingMessage, sendOptions);
    })
    .then((rawMessage) => {
      responseBody.sentRawMessage = rawMessage;
      return this.__sendMessage(rawMessage, sendOptions);
    })
    .then((rawBody) => {
      responseBody.raw = rawBody;
      return this.__createStandardBodyResponseComponents(
        responseBody.sentOutgoingMessage,
        responseBody.sentRawMessage,
        responseBody.raw);
    })
    .then((StandardBodyResponseComponents) => {
      responseBody.recipient_id = StandardBodyResponseComponents.recipient_id;
      responseBody.message_id = StandardBodyResponseComponents.message_id;
      return responseBody;
    })
    .catch((err) => {
      if (err === 'cancel') {
        return 'cancelled';
      }

      throw err;
    });
  }

  /**
   * Bot class implementation of the __formatOutgoingMessage function. Each Bot class
   * has to implement this in order to be able to send outgoing messages that start
   * off as valid Messenger message objects (i.e. OutgoingMessage objects).
   *
   * @param {OutgoingMessage} outgoingMessage The outgoingMessage object that
   * needs to be formatted to the platform standard (formatted out).
   * @return {Promise} promise that resolves in the body of the response from the platform
   *
   * __formatOutgoingMessage(outgoingMessage) {}
   */

  /**
   * Bot class implementation of the __sendMessage function. Each Bot class
   * has to implement this in order to be able to send outgoing messages.
   *
   * @param {object} message
   * @return {Promise} promise that resolves in the body of the response from the platform
   *
   * __sendMessage(rawUpdate) {}
   */

  /**
   * Bot class implementation of the __createStandardBodyResponseComponents
   * function. Each Bot class has to implement this in order to be able to
   * send outgoing messages using sendMessage. This function returns the standard
   * recipient_id and message_id we can expect from using sendMessage
   *
   * @param {OutgoingMessage} sentOutgoingMessage The OutgoingMessage object
   * before formatting
   * @param {object} sentRawMessage The raw message that was actually sent to
   * the platform after __formatOutgoingMessage was called
   * @param {object} rawPlatformBody the raw body response from the platform
   *
   * @return {Promise} promise that resolves in an object that contains
   * both the recipient_id and message_id fields
   *
   * __createStandardBodyResponseComponents(
   *   sentOutgoingMessage, sentRawMessage, rawPlatformBody) {}
   */

  /**
   * sendMessageTo() Just makes it easier to send a message without as much
   * structure.
   * @param {object} message NOT an instance of OutgoingMessage. Use
   * #sendMessage if you want to send instances of OutgoingMessage
   * @param {string} recipientId
   * @param {object} [sendOptions] just options for sending.
   *
   * @example
   *
   * // message object can look something like this:
   *
   * message: {
   *  text: 'Some random text'
   * }
   *
   * @return {Promise} promise
   */
  sendMessageTo(message, recipientId, sendOptions) {
    const outgoingMessage = this.createOutgoingMessage({
      message,
    });
    outgoingMessage.addRecipientById(recipientId);

    return this.sendMessage(outgoingMessage, sendOptions);
  }

  /**
   * sendTextMessageTo() Just makes it easier to send a text message with
   * minimal structure.
   * @param {string} text
   * @param {string} recipientId
   * @param {object} [sendOptions] just options for sending.
   *
   * @return {Promise} promise
   */
  sendTextMessageTo(text, recipientId, sendOptions) {
    if (!get(this, 'sends.text')) {
      return Promise.reject(new SendMessageTypeError(this.type, 'text'));
    }
    const outgoingMessage = this.createOutgoingMessage()
      .addRecipientById(recipientId)
      .addText(text);

    return this.sendMessage(outgoingMessage, sendOptions);
  }

  /**
   * reply() Another way to easily send a text message. In this case,
   * we just send the update that came in as is and then the text we
   * want to send as a reply.
   * @param {object} incomingUpdate
   * @param {string} text
   * @param {object} [sendOptions] just options for sending.
   *
   * @return {Promise} promise
   */
  reply(incomingUpdate, text, sendOptions) {
    return this.sendTextMessageTo(text, incomingUpdate.sender.id, sendOptions);
  }

  /**
   * sendAttachmentTo() makes it easier to send an attachment message with
   * less structure.
   * @param {object} attachment
   * @example
   * // attachment object typically looks something like this:
   *
   * const attachment = {
   *   type: 'image',
   *   payload: {
   *     url: "some_valid_url_of_some_image"
   *   },
   * };
   *
   * @param {string} recipientId
   * @param {object} [sendOptions] just options for sending.
   *
   * @return {Promise} promise
   */
  sendAttachmentTo(attachment, recipientId, sendOptions) {
    if (!get(this, 'sends.attachment')) {
      return Promise.reject(new SendMessageTypeError(this.type, 'attachment'));
    }
    const outgoingMessage = this.createOutgoingMessage()
      .addRecipientById(recipientId)
      .addAttachment(attachment);

    return this.sendMessage(outgoingMessage, sendOptions);
  }

  /**
   * sendAttachmentFromUrlTo() makes it easier to send an attachment message with
   * minimal structure.
   * @param {string} type
   * @param {string} url
   * @param {string} recipientId
   * @param {object} [sendOptions] just options for sending.
   *
   * @return {Promise} promise
   */
  sendAttachmentFromUrlTo(type, url, recipientId, sendOptions) {
    if (!get(this, `sends.attachment.${type}`)) {
      let cantThrowErrorMessageType = `${type} attachment`;
      if (!get(this, 'sends.attachment')) {
        cantThrowErrorMessageType = 'attachment';
      }
      return Promise.reject(new SendMessageTypeError(this.type,
        cantThrowErrorMessageType));
    }
    const attachment = {
      type,
      payload: {
        url,
      },
    };

    return this.sendAttachmentTo(attachment, recipientId, sendOptions);
  }

  /**
   * sendDefaultButtonMessageTo() makes it easier to send a default set of
   * buttons. The default button type is the Messenger quick_replies, where
   * the payload is the same as the button title and the content_type is text.
   *
   * @param {Array} buttonTitles
   * @param {string|object} textOrAttachment, if falsy, will be set to a
   * default text of "Please select one of:"
   * @param {string} recipientId
   * @param {object} [sendOptions]
   *
   * @return {Promise} promise
   */
  sendDefaultButtonMessageTo(buttonTitles, textOrAttachment, recipientId) {
    const validateSendDefaultButtonMessageToArguments = () => {
      let err = null;
      if (!this.sends.quickReply) {
        err = new SendMessageTypeError(this.type, 'quick replies');
      } else if (buttonTitles.length > 10) {
        err = new RangeError('buttonTitles must be of length 10 or less');
      }

      if (textOrAttachment) {
        if (textOrAttachment.constructor === String) {
          if (!this.sends.text) {
            err = new SendMessageTypeError(this.type, 'text');
          }
        } else if (textOrAttachment.constructor === Object && textOrAttachment.type) {
          if (!this.sends.attachment) {
            err = new SendMessageTypeError(this.type, 'attachment');
          } else if (!this.sends.attachment[textOrAttachment.type]) {
            err = new SendMessageTypeError(this.type,
              `${textOrAttachment.type} attachment`);
          }
        } else {
          err = new TypeError('third argument must be a "String", an ' +
                              'attachment "Object" or absent');
        }
      }

      return err;
    };

    const potentialError = validateSendDefaultButtonMessageToArguments();
    if (potentialError) {
      return Promise.reject(potentialError);
    }

    // //////////////////////////////////////////////////////
    // actual code after validating with
    // validateSendDefaultButtonMessageToArguments function
    // //////////////////////////////////////////////////////

    const outgoingMessage = this.createOutgoingMessage();
    outgoingMessage.addRecipientById(recipientId);
    // deal with textOrAttachment
    if (!textOrAttachment && this.sends.text) {
      outgoingMessage.addText('Please select one of:');
    } else if (textOrAttachment.constructor === String) {
      outgoingMessage.addText(textOrAttachment);
    } else {
      // it must be an attachment or an error would have been thrown
      outgoingMessage.addAttachment(textOrAttachment);
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
    return this.sendMessage(outgoingMessage, arguments[3]);
  }

  /**
   * sendIsTypingMessageTo() just sets the is typing status to the platform
   * if available.
   * based on the passed in update
   *
   *
   * i.e. it has no message_id (or it is null/undefined)
   *
   * @param {string} recipientId
   * @param {object} [sendOptions]
   *
   * @return {Promise} promise
   *
   * @example
   *
   * // the returned value is different from the standard one. It looks something
   * //like this in this case:
   *
   * {
   *   recipient_id: <id_of_user>
   * }
   *
   *
   */
  sendIsTypingMessageTo(recipientId, sendOptions) {
    if (!get(this, 'sends.senderAction.typingOn')) {
      return Promise.reject(new SendMessageTypeError(this.type,
        'typing_on sender action'));
    }
    const isTypingMessage = {
      recipient: {
        id: recipientId,
      },
      sender_action: 'typing_on',
    };
    return this.sendMessage(isTypingMessage, sendOptions);
  }

  /**
   * sendCascadeTo() allows developers to send a cascade of messages
   * in a sequence. All types of messages can be sent (including raw messages).
   *
   * @param {Array} messageArray of messages in a format as such:
   * [{raw: someRawObject}, {message: some valid outgoingMessage}]
   *
   * @return {Promise} promise
   * The returned value an in-place array of bodies received from the client platform
   * The objects of the array are of the same format as for standard messages
   *
   */

  sendCascade(messageArray, sendOptions) {
    const returnedBodies = [];

    let promiseCascade = Promise.resolve();

    for (const messageObject of messageArray) {
      promiseCascade = promiseCascade.then((body) => {
        if (body) {
          returnedBodies.push(body);
        }
        if (messageObject.raw) {
          return this.sendRawMessage(messageObject.raw);
        } else if (messageObject.message) {
          return this.sendMessage(messageObject.message, sendOptions);
        }
        throw new Error('No valid message options specified');
      });
    }

    return promiseCascade

    .then((body) => {
      // add last body and deal with potential callback
      returnedBodies.push(body);
      return returnedBodies;
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

  sendTextCascadeTo(textArray, recipientId, sendOptions) {
    const cascadeArray = textArray.map((text) => {
      const outgoingMessage = this.createOutgoingMessageFor(recipientId)
        .addText(text);

      return { message: outgoingMessage };
    });

    return this.sendCascade(cascadeArray, sendOptions);
  }

  /**
   * sendRawMessage() simply sends a raw platform dependent message. This method
   * calls __sendMessage in each botClass without calling formatOutgoingMessage
   * before. It's really just sugar around __sendMessage which shouldn't be used
   * directly.
   *
   * @param {Object} rawMessage
   *
   * @return {Promise} promise
   *
   */
  sendRawMessage(rawMessage) {
    return this.__sendMessage(rawMessage);
  }

  /**
   * __validateSendOptions() is simply an internal helper function to validate
   * wether sendOptions is valid
   * @ignore
   * @param {function} [sendOptions]
   *
   * @return {object} with cb and sendOptions as parameters
   *
   */

  __validateSendOptions(sendOptions) {
    return new Promise((resolve, reject) => {
      let err = null;

      if (typeof sendOptions === 'function') {
        err = new TwoDotXError('Using botmaster sendMessage type methods ' +
          'with callback functions is no longer supported in botmaster 3. ');
      } else if (typeof sendOptions !== 'object') {
        err = new TypeError('sendOptions must be of type ' +
        `object. Got ${typeof sendOptions} instead`);
      }

      if (err) {
        return reject(err);
      }

      return resolve();
    });
  }

  /**
   * __emitUpdate() emits an update after going through the
   * incoming middleware based on the passed in update. Note that we patched
   * the bot object with the update, so that it is available in the outgoing
   * middleware too.
   * @ignore
   * @param {object} update
   */
  __emitUpdate(update) {
    if (!this.master) {
      return Promise.reject(new Error('bot needs to be added to a botmaster ' +
                            'instance in order to emit received updates'));
    }

    return this.master.middleware.__runIncomingMiddleware(this, update)
    .catch((err) => {
      // doing this, to make sure all errors (even ones rejected from
      // promises within incoming middleware) can be retrieved somewhere;
      if (err === 'cancel') {
        return 'cancelled';
      }
      if (err && err.message) {
        err.message = `"${err.message}". This is most probably on your end.`;
      }

      this.emit('error', err || 'empty error object');
      return err;
    });
  }

  /**
   * Retrieves the basic user info from a user if platform supports it
   *
   * @param {string} userId
   *
   * @return {Promise} promise that resolves into the user info or an empty
   * object by default
   */
  getUserInfo(userId) {
    if (!this.retrievesUserInfo) {
      return Promise.reject(TypeError(
        `Bots of type ${this.type} don't provide access to user info.`));
    }
    return this.__getUserInfo(userId);
  }

  /**
   * __createBotPatchedWithUpdate is used to create a new bot
   * instance that on sendMessage sends the update as a sendOption.
   * This is important, because we want to have access to the update object
   * even within outgoing middleware. This allows us to always have access
   * to it.
   * @ignore
   * @param {object} update - update to be patched to sendMessage
   * @returns {object} bot
   */
  __createBotPatchedWithUpdate(update) {
    const newBot = Object.create(this);
    newBot.sendMessage = (message, sendOptions) => {
      sendOptions = sendOptions || {};

      // validating here too, as __update has to be added to a valid
      // sendOptions object
      return this.__validateSendOptions(sendOptions)

      .then(() => {
        sendOptions.__update = update;
        return this.sendMessage(message, sendOptions);
      });
    };
    return newBot;
  }
}

module.exports = BaseBot;
