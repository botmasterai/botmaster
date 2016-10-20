'use strict';

const _unescape = require('lodash').unescape;
const _partition = require('lodash').partition;
const BaseBot = require('./base_bot');
const Twit = require('twit');

class TwitterBot extends BaseBot {

  constructor(settings) {
    super(settings);
    this.type = 'twitter';
    this.requiresWebhook = false;
    this.requiredCredentials = ['consumerKey', 'consumerSecret',
                                'accessToken', 'accessTokenSecret'];

    this.__applySettings(settings);
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
    this.id = this.idStr;
    this.twit = twit;

    const userStream = twit.stream('user');

    this.userStream = userStream;

    userStream.on('direct_message', (rawUpdate) => {
      // otherwise, Bot will receive what it just sent
      if (rawUpdate.direct_message.sender.id_str !== this.id) {
        const update = this.__formatUpdate(rawUpdate);
        this.__emitUpdate(update);
      }
    });
  }

  __formatUpdate(rawUpdate) {
    const dateSentAt = new Date(rawUpdate.direct_message.created_at);
    const formattedUpdate = {
      raw: rawUpdate,
      sender: {
        id: rawUpdate.direct_message.sender.id_str,
      },
      recipient: {
        id: this.id,
      },
      timestamp: dateSentAt.getTime(),
      message: {
        mid: rawUpdate.direct_message.id_str,
        seq: null, // twitter doesn't have such a concept. Can be emulated with proper storage
      },
    };

    const attachments = this.__formatIncomingAttachments(rawUpdate);

    if (attachments) {
      formattedUpdate.message.attachments = attachments;
    }

    const text = this.__formatIncomingText(rawUpdate);

    if (text) {
      formattedUpdate.message.text = text;
    }

    return formattedUpdate;
  }

  __formatIncomingAttachments(rawUpdate) {
    const media = rawUpdate.direct_message.entities.media;
    if (!media) {
      return null;
    }

    const attachments = media.map((entry) => {
      let type;
      let url;
      if (entry.type === 'photo') {
        type = 'image';
        url = entry.media_url_https;
      } else if (entry.type === 'video') {
        type = 'video';
        url = this.__extractBestVideoURL(entry.video_info.variants);
      } else if (entry.type === 'animated_gif') {
        // weirdly enough twitter's gifs are videos rather than actual
        // .gif files... so I return a video and not an image...
        // Could potentially also return the jpg returned from it. but it's
        // there in raw anyway for the ones who want to go there
        type = 'video';
        url = this.__extractBestVideoURL(entry.video_info.variants);
      }

      const attachment = {
        type,
        payload: {
          url,
        },
      };

      return attachment;
    });

    if (attachments.length > 0) {
      return attachments;
    }

    return null;
  }

  __formatIncomingText(rawUpdate) {
    if (rawUpdate.direct_message.text !== undefined) {
      let text = _unescape(rawUpdate.direct_message.text);
      const media = rawUpdate.direct_message.entities.media;
      if (media && media.length > 0) {
        for (const entry of media) {
          text = text.replace(` ${entry.url}`, '');
        }
      }
      return text;
    }
    return null;
  }

  __extractBestVideoURL(variants) {
    // It is assumed that Messenger quality url is expected
    // to be good but the not necessarily best.

    // get variants that have a bitrate associated to them
    const eligibleVariants = _partition(variants,
      v => v.bitrate !== undefined)[0];

    if (eligibleVariants.length === 0) {
      return null;
    }

    const upperBitrateLimit = 832001;
    // remember, this will start
    const selectedVariant = eligibleVariants.reduce((prevVar, currVar) => {
      if (prevVar.bitrate > upperBitrateLimit &&
          currVar.bitrate < prevVar.bitrate) {
        return currVar;
      }

      if (currVar.bitrate > prevVar.bitrate &&
          currVar.bitrate < upperBitrateLimit) {
        return currVar;
      }

      return prevVar;
    });

    return selectedVariant.url;
  }

  __sendMessage(message) {
    if (message.sender_action) {
      // Twitter does not support sender actions
      return new Promise((resolve) => {
        const dummyResponse = {
          recipient_id: message.recipient.id,
          delivered: false,
        };
        resolve(dummyResponse);
      });
    }

    const formattedMessage = this.__formatOutgoingMessage(message);

    const promise = new Promise((resolve, reject) => {
      this.twit.post('direct_messages/new', formattedMessage, (err, data) => {
        if (err) {
          reject(err);
        }
        const standardizedBody = {
          raw: data,
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

    if (message.message.attachment) {
      if (!formattedMessage.text) {
        formattedMessage.text = '';
      }
      formattedMessage.text += ` ${message.message.attachment.payload.url}`;
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
