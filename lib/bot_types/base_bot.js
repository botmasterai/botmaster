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
   * extractSessionFromUpdate() returns a new or found session object
   * based on the passed in update
   *
   * @param {object} update
   * @return {object} session
   */
  __extractSessionFromUpdate(update) {}

}

module.exports = BaseBot;
