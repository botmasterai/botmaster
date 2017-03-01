'use strict';

const _cloneDeep = require('lodash').cloneDeep;
const BaseBot = require('../lib/base_bot');

class MockBot extends BaseBot {

  constructor(settings) {
    super(settings);
    this.type = 'mock';

    this.receives = {
      text: true,
      attachment: {
        audio: true,
        file: true,
        image: true,
        video: true,
        location: true,
        // can occur in FB messenger when user sends a message which only contains a URL
        // most platforms won't support that
        fallback: true,
      },
      echo: true,
      read: true,
    };

    this.sends = {
      text: true,
      quickReply: true,
      locationQuickReply: true,
      typing: true,
      attachment: {
        audio: true,
        file: true,
        image: true,
        video: true,
      },
    };

    this.id = 'mockId';

    this.__applySettings(settings);
  }

  mockIncomingUpdate(update) {
    
  }


  __formatUpdate(rawUpdate, botmasterUserId) {
    const timestamp = Math.floor(Date.now());

    const update = {
      raw: rawUpdate,
      sender: {
        id: botmasterUserId,
      },
      recipient: {
        id: this.id,
      },
      timestamp,
      message: {
        mid: `${this.id}.${botmasterUserId}.${String(timestamp)}.`,
        seq: null,
      },
    };

    if (rawUpdate.text) {
      update.message.text = rawUpdate.text;
    }

    if (rawUpdate.attachments) {
      update.message.attachments = rawUpdate.attachments;
    }

    return update;
  }

  __sendMessage(message) {
    return this.sendRaw(message);
  }

  // sendRaw and __sendMessage are really the same thing for basic socketio
  // they both exist for compatibility reasons
  sendRaw(message, cb) {
    const timestamp = Math.floor(Date.now());
    const responseBody = {
      recipient_id: message.recipient.id,
      message_id: `${this.id}.${message.recipient.id}.${String(timestamp)}`,
    };

    if (cb) {
      return cb(null, responseBody);
    }

    return new Promise((resolve) => {
      resolve(responseBody);
    });
  }

}

module.exports = SocketioBot;
