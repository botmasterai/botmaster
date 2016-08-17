'use strict';

const EventEmitter = require('events');

class BaseBot extends EventEmitter {
  constructor(settings) {
    super();
    this.type = 'baseBot';
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
      throw new TypeError(`ERROR: settings must be object, got  + ${typeof settings}`);
    }

    if (!settings.credentials) {
      throw new Error(`ERROR: no credentials specified for bot of type '${this.type}'`);
    } else {
      this.credentials = settings.credentials;
    }

    if (settings.sessionStore) {
      this.sessionStore = settings.sessionStore;
    }

    for (const credentialName of this.requiredCredentials) {
      if (!this.credentials[credentialName]) {
        throw new Error(`ERROR: bots of type '${this.type}' are expected to have '${credentialName}' credentials`);
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
   * @return (Promise) promise.
   * The returned promise for all sendMessage type events returns a body that
   * looks something like this:
   *  {
   *   raw: rawBody, // only if platform is not Messenger.
   *   recipient_id: <id_of_user>,
   *   message_id: <message_id_of_what_was_just_sent>
   *  }
   *
   * Some platforms may not have either of these paramters. If that's the case,
   * the value assigned will be null or some other suitable value as the
   * equivalent to Messenger's seq in Telegram.
   *
   */
  sendMessage(message) {

  }

  /**
   * sendMessageTo() Just makes it easier to send a message without as much
   * structure. message object can look something like this:
   * message: {
   *  text: 'Some random text'
   * }
   * @param {object} message
   * @param {string} recipientId
   *
   * @return (Promise) promise
   */
  sendMessageTo(message, recipientId) {
    const fullMessageObject = {
      recipient: {
        id: recipientId,
      },
      message,
    };
    return this.sendMessage(fullMessageObject);
  }

  /**
   * sendTextMessageTo() Just makes it easier to send a text message with
   * minimal structure.
   * @param {string} text
   * @param {string} recipientId
   *
   * @return (Promise) promise
   */
  sendTextMessageTo(text, recipientId) {
    const message = {
      text,
    };
    return this.sendMessageTo(message, recipientId);
  }

  /**
   * reply() Another way to easily send a text message. In this case,
   * we just send the update that came in as is and then the text we
   * want to send as a reply.
   * @param {object} incommingUpdate
   * @param {string} text
   *
   * @return (Promise) promise
   */
  reply(incomingUpdate, text) {
    return this.sendTextMessageTo(text, incomingUpdate.sender.id);
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
   * @return (Promise) promise
   */
  sendAttachmentTo(attachment, recipientId) {
    const message = {
      attachment,
    };
    return this.sendMessageTo(message, recipientId);
  }

  /**
   * sendAttachmentFromURLTo() makes it easier to send an attachment message with
   * minimal structure.
   * @param {string} type
   * @param {string} url
   * @param {string} recipientId
   *
   * @return (Promise) promise
   */
  sendAttachmentFromURLTo(type, url, recipientId) {
    const attachment = {
      type,
      payload: {
        url,
      },
    };
    return this.sendAttachmentTo(attachment, recipientId);
  }

  /**
   * sendDefaultButtonMessageTo() makes it easier to send a default set of
   * buttons. The default button type is the Messenger quick_replies. Each
   * integration has its opinionated equivalent. Keyboard buttons for Telegram
   * and simple text with newlines for Twitter(as Twitter DM has no buttons).
   *
   * @param {Array} buttonTitles
   * @param {string} recipientId
   * @param {string} || {object} textOrAttachment (optional)
   *
   * @return (Promise) promise
   */
  sendDefaultButtonMessageTo(buttonTitles, recipientId, textOrAttachment) {
    if (buttonTitles.length > 10) {
      return new Promise(() => {
        throw new Error('ERROR: buttonTitles must be of length 10 or less');
      });
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
      return new Promise(() => {
        throw new Error('ERROR: third argument must be a "String", "Object" or absent');
      });
    }

    message.quick_replies = [];
    for (const buttonTitle of buttonTitles) {
      message.quick_replies.push({
        content_type: 'text',
        title: buttonTitle,
        payload: buttonTitle, // indeed, in default mode payload in buttonTitle
      });
    }
    return this.sendMessageTo(message, recipientId);
  }

  /**
   * sendIsTypingMessageTo() just sets the is typing status to the platform
   * if available.
   * based on the passed in update
   *
   * @param {string} recipientId
   * The returned value is different from the standard one. It looks something
   * like this in this case:
   *
   * {
   *   recipient_id: <id_of_user>
   * }
   *
   */
  sendIsTypingMessageTo(recipientId) {
    const isTypingMessage = {
      recipient: {
        id: recipientId,
      },
      sender_action: 'typing_on',
    };
    return this.sendMessage(isTypingMessage);
  }

  /**
   * __emitUpdate() emits an update with session object is sessionStore is provided
   * based on the passed in update
   *
   * @param {object} update
   */
  __emitUpdate(update) {
    if (this.sessionStore) {
      this.sessionStore.createOrUpdateSession(update)
      .then(session => {
        update.session = session;
        // TODO add other ways to listen onto updates, i.e. what if all a developer wants
        // is a way to receive text or attachments (video etc). listenerCount will help do this
        // console.log('Listener counts for "update":');
        // console.log(this.listenerCount('update'));
        this.emit('update', update);
      })
      .catch((err) => {
        err.message = `Uncaught error: "${err.message}". This is most probably on your end.`;
        this.emit('error', err);
      });
    } else {
      // doing this, because otherwise, errors done by developer aren't
      // dealt with
      try {
        this.emit('update', update);
      } catch (err) {
        err.message = `Uncaught error: "${err.message}". This is most probably on your end.`;
        this.emit('error', err);
      }
    }
  }


}

module.exports = BaseBot;
