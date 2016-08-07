'use strict';

const _ = require('lodash');
const BaseBot = require('./base_bot.js');
const Twit = require('twit');

class TwitterBot extends BaseBot {

  constructor(settings) {
    super(settings);
    this.type = 'twitter';
    this.requiresWebhook = false;
    this.requiredCredentials = ['consumerKey', 'consumerSecret',
                                'accessToken', 'accessTokenSecret'];

    this.__validateSettings(settings);
    this.__setupTwit();
  }

  __setupTwit() {
    // translate to camelCase
    const twitCredentials = {
      consumer_key: this.credentials.consumerKey,
      consumer_secret: this.credentials.consumerSecret,
      access_token: this.credentials.accessToken,
      access_token_secret: this.credentials.accessTokenSecret,
    };
    const twit = new Twit(twitCredentials);
    this.idStr = this.credentials.accessToken.split('-')[0];
    this.twit = twit;

    const userStream = twit.stream('user');

    this.userStream = userStream;

    userStream.on('direct_message', (rawUpdate) => {
      // otherwise, Bot will receive what it just sent
      if (rawUpdate.direct_message.sender.id_str !== this.idStr) {
        const update = this.__formatUpdate(rawUpdate);
        this.__emitUpdate(update);
      }
    });
  }

  __formatUpdate(rawUpdate) {
    const dateSentAt = new Date(rawUpdate.direct_message.created_at);
    const update = {
      raw: rawUpdate,
      sender: {
        id: rawUpdate.direct_message.sender.id_str,
      },
      recipient: {
        id: this.idStr,
      },
      timestamp: dateSentAt.getTime(),
      message: {
        mid: rawUpdate.direct_message.id_str,
        seq: null, // twitter doesn't have such a concept. Can be copied with proper storage
      },
    };

    if (rawUpdate.direct_message.text !== undefined) {
      update.message.text = _.unescape(rawUpdate.direct_message.text);
    }

    return update;
  }

  sendMessage(message) {
    const formattedMessage = this.__formatOutgoingMessage(message);

    const promise = new Promise((resolve, reject) => {
      this.twit.post('direct_messages/new', formattedMessage, (err, data) => {
        if (err) {
          reject(err);
        }
        const standardizedBody = {
          rawBody: data,
          recipient_id: data.recipient.id_str,
          message_id: data.id_str,
        };
        resolve(standardizedBody);
      });
    });

    return promise;
  }

  __formatOutgoingMessage(message) {
    const formattedMessage = {
      user_id: message.recipient.id,
    };

    if (message.message.text) {
      formattedMessage.text = message.message.text;
    }

    if (message.message.quick_replies) {
      // Twitter DMs don't support buttons, so we'll just append the text with the buttons
      // written in plain text and new lines.
      const buttonsText = message.message.quick_replies.reduce((text, quickReply) => {
        return `${text}\n${quickReply.title}`;
      }, '');

      formattedMessage.text += `\n(Please type in your choice)${buttonsText}`;
    }

    return formattedMessage;
  }

}

module.exports = TwitterBot;
