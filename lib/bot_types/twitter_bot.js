'use strict';

const _ = require('lodash');
const BaseBot = require('./base_bot.js');
const Twit = require('twit');

class TwitterBot extends BaseBot {

  constructor(settings) {
    // do proper credentials test here
    super(settings);
    const twit = new Twit(this.credentials);
    this.idStr = this.credentials.access_token.split('-')[0];
    this.twit = twit;

    const twitterStream = twit.stream('user');

    twitterStream.on('direct_message', (rawUpdate) => {
      // otherwise, Bot will try to answer self
      if (rawUpdate.direct_message.sender.id_str !== this.idStr) {
        const update = this.__formatUpdate(rawUpdate);
        this.__emitUpdate(update);
      }
    });
  }

  __formatUpdate(rawUpdate) {
    const update = {
      raw: rawUpdate,
      sender: {
        id: rawUpdate.direct_message.sender.id_str,
      },
      recipient: {
        id: this.idStr,
      },
      timestamp: rawUpdate.created_at,
      message: {
        mid: rawUpdate.direct_message.id_str,
        seq: null, // twitter doesn't have such a concept. Can be copied with proper storage
      },
    };

    if (rawUpdate.direct_message.text !== undefined) {
      update.message.text = rawUpdate.direct_message.text;
    }

    return update;
  }

  sendMessage(message, session) {
    if (session) {
      message.recipient = {
        id: session.id,
      };
    }

    // // optionalParams for twitter will basically be buttons params, which is
    // // text to append.
    // if (optionalParams) {
    //   text = `${text}\n\n${optionalParams}`
    // }

    const messageData = {};

    messageData.user_id = message.recipient.id;
    messageData.text = message.message.text;

    const params = { user_id: messageData.user_id,
                     text: messageData.text,
                   }

    this.twit.post('direct_messages/new', params, (err, data) => {
      if (err) {
        this.emit('error', err);
      }
    });
  }

}

// twitterBot.formatButtonsParams = function(buttonNames) {

//   // buttonNames are in the row format for telegram, and twitter
//   // DMs don't support buttons, so we'll just append the text with the options
//   // written in plain text and new lines.

//   const buttonsParams = buttonNames.reduce((text, buttonName) => {
//     return `${text}\n${buttonName[0]}`;
//   })

//   return buttonsParams;
// }

module.exports = TwitterBot;
