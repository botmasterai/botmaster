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
  */
  __validateSettings(settings) {
    if (typeof settings !== 'object') {
      throw new TypeError(`ERROR: settings must be object, got  + ${typeof settings}`);
    }

    if (!settings.credentials) {
      throw new Error(`ERROR: no credentials specified for bot of type '${this.type}'`);
    } else {
      this.credentials = settings.credentials;
    }

    if (!settings.sessionStore) {
      console.log(`WARNING: starting bot of type '${this.type}' without sessionStore`);
    } else {
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


  __getAttachments(rawUpdate) {}

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

  /**
  *
  *
  */
  sendMessage(message) {

  }

  sendMessageTo(message, recipientId) {
    const fullMessageObject = {
      recipient: {
        id: recipientId,
      },
      message,
    };
    return this.sendMessage(fullMessageObject);
  }

  // just calls sendMessage after formatting the message
  // to a proper messenger one
  sendTextMessageTo(text, recipientId) {
    const message = {
      text,
    };
    return this.sendMessageTo(message, recipientId);
  }

  reply(incommingUpdate, text) {
    return this.sendTextMessageTo(text, incommingUpdate.sender.id);
  }

  sendAttachmentTo(attachment, recipientId) {
    const message = {
      attachment,
    };
    return this.sendMessageTo(message, recipientId);
  }

  sendAttachmentFromURLTo(type, url, recipientId) {
    const attachment = {
      type,
      payload: {
        url,
      },
    };
    return this.sendAttachmentTo(attachment, recipientId);
  }

  // textOrAttachment is optional
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
      // TODO: implement test for this when doing attachments
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

  sendIsTypingMessageTo(recipientId) {
    const isTypingMessage = {
      recipient: {
        id: recipientId,
      },
      sender_action: 'typing_on',
    };
    return this.sendMessage(isTypingMessage);
  }

}

module.exports = BaseBot;
