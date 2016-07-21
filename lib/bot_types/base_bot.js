'use strict';

const EventEmitter = require('events');

class BaseBot extends EventEmitter {
  constructor(settings) {
    super();
    this.credentials = settings.credentials;
    if (settings.sessionStore) {
      this.sessionStore = settings.sessionStore;
    }
    // for the channels implemented with webhooks
    if (settings.webhookEndpoint) {
      this.webhookEndpoint = settings.webhookEndpoint;
    }

    this.__createMountPoints();
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
