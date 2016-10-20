'use strict';

const _map = require('lodash').map;
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
const BaseBot = require('./base_bot');


const baseURL = 'https://api.telegram.org';
const baseFileURL = 'https://api.telegram.org/file';

class TelegramBot extends BaseBot {

  constructor(settings) {
    super(settings);
    this.type = 'telegram';
    this.requiresWebhook = true;
    this.requiredCredentials = ['authToken'];

    this.__applySettings(settings);
    this.baseURL = `${baseURL}/bot${this.credentials.authToken}`;
    this.baseFileURL = `${baseFileURL}/bot${this.credentials.authToken}`;
    this.id = this.credentials.authToken.split(':')[0];

    this.__createMountPoints();
  }
  /**
   * sets up the app.
   * Adds an express Router to the mount point "/telegram".
   * sub Router contains code for posting to wehook.
   */
  __createMountPoints() {
    this.app = express();
    // for parsing application/json
    this.app.use(bodyParser.json());
    // for parsing application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.post(this.webhookEndpoint, (req, res) => {
      this.__formatUpdate(req.body)

      .then((update) => {
        this.__emitUpdate(update);
      }, (err) => {
        err.message = `Error in __formatUpdate "${err.message}". Please report this.`;
        this.emit('error', err);
      });

      // just letting telegram know we got the update
      res.sendStatus(200);
    });
  }

  __formatUpdate(rawUpdate) {
    const promise = new Promise((resolve) => {
      const update = {
        raw: rawUpdate,
        sender: {
          id: rawUpdate.message.from.id,
        },
        recipient: {
          id: this.id,
        },
        timestamp: rawUpdate.message.date * 1000,
        message: {
          mid: rawUpdate.update_id,
          seq: rawUpdate.message.message_id,
        },
      };

      if (rawUpdate.message.text !== undefined) {
        update.message.text = rawUpdate.message.text;
      }

      this.__getAttachments(rawUpdate)

      .then((attachments) => {
        if (attachments.length > 0) {
          update.message.attachments = attachments;
        }
        resolve(update);
      });
    });

    return promise;
  }

  /**
   * __getAttachments() returns an array of attachments in the expected format
   * that is, the messenger format. The method supports returning multiple
   * attachments if required. Not sure telegram supports sending multiple ones,
   * but the method supports it if telegram does.
   *
   * @param {object} rawUpdate
   * @return Promise which resolves to an array of {object} attachments
   */
  __getAttachments(rawUpdate) {
    const fileIdsInfo = this.__getAttachmentsInfo(rawUpdate);

    // attachment object for location can be derived from current data
    const locationAttachment = this.__getLocationAttachment(rawUpdate) || [];

    if (fileIdsInfo.length === 0) {
      return new Promise(resolve => resolve(locationAttachment));
    }

    return Promise.all(fileIdsInfo.map(
      fileIdInfo => this.__getAttachment(fileIdInfo.id, fileIdInfo.type))
    )
    .then(attachments => attachments.concat(locationAttachment));
  }

  __getAttachmentsInfo(rawUpdate) {
    const fileIdsInfo = [];

    if (rawUpdate.message.audio !== undefined) {
      fileIdsInfo.push({
        id: rawUpdate.message.audio.file_id,
        type: 'audio',
      });
    }
    if (rawUpdate.message.voice !== undefined) {
      // messenger only has audio
      fileIdsInfo.push({
        id: rawUpdate.message.voice.file_id,
        type: 'audio',
      });
    }
    if (rawUpdate.message.document !== undefined) {
      fileIdsInfo.push({
        id: rawUpdate.message.document.file_id,
        type: 'file',
      });
    }
    if (rawUpdate.message.photo !== undefined) {
      // telegram returns array of PhotoSize, => we take last (largest one).
      const photoSizeArray = rawUpdate.message.photo;
      const fileId = photoSizeArray[photoSizeArray.length - 1].file_id;
      fileIdsInfo.push({
        id: fileId,
        type: 'image',
      });
    }
    if (rawUpdate.message.sticker !== undefined) {
      // messenger only has image
      fileIdsInfo.push({
        id: rawUpdate.message.sticker.file_id,
        type: 'image',
      });
    }
    if (rawUpdate.message.video !== undefined) {
      fileIdsInfo.push({
        id: rawUpdate.message.video.file_id,
        type: 'video',
      });
    }

    return fileIdsInfo;
  }

  __getLocationAttachment(rawUpdate) {
    const location = rawUpdate.message.location;
    const venue = rawUpdate.message.venue;
    if (location) {
      const lat = location.latitude;
      const long = location.longitude;
      const locationAttachment = {};
      locationAttachment.type = 'location';
      locationAttachment.title = 'Pinned Location';
      locationAttachment.url = `https://maps.google.com/?q=${lat},${long}`;
      locationAttachment.payload = {
        coordinates: {
          lat,
          long,
        },
      };
      if (venue) {
        locationAttachment.title = venue.title;
      }
      return [locationAttachment];
    }

    return null;
  }

  __getAttachment(fileId, type) {
    return this._getFile(fileId)

    .then((result) => {
      const attachment = {
        type,
        payload: {
          url: `${this.baseFileURL}/${result.file_path}`,
        },
      };

      return attachment;
    });
  }

  _getFile(fileId) {
    const data = {
      file_id: fileId,
    };

    return request({
      method: 'POST',
      uri: `${this.baseURL}/getFile`,
      body: data,
      json: true,
    })
    .then(body => body.result);
  }

  __sendMessage(message) {
    const options = this.__makeRequestOptions(message);
    options.json = this.__formatOutgoingMessage(message);

    return request(options)

    .then((body) => {
      if (body.error) {
        throw new Error(JSON.stringify(body.error));
      }
      if (!body.result.chat) {
        return {
          recipient_id: message.recipient.id,
        };
      }
      const standardizedBody = {
        raw: body,
        recipient_id: body.result.chat.id,
        // this is really the equivalent to a Messenger seq.
        // But it's either that or null for telegram
        message_id: body.result.message_id,
      };
      return standardizedBody;
    });
  }

  __makeRequestOptions(message) {
    const url = this.__makeURL(message);

    const options = {
      url,
      method: 'POST',
    };

    return options;
  }

  __makeURL(message) {
    let method;
    if (message.sender_action) {
      method = 'sendChatAction';
    } else {
      method = 'sendMessage';
    }
    return `${this.baseURL}/${method}`;
  }

  __formatOutgoingMessage(message) {
    const formattedMessage = {
      chat_id: message.recipient.id,
    };

    if (message.sender_action && message.sender_action === 'typing_on') {
      formattedMessage.action = 'typing';
      return formattedMessage;
    }

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
      const buttonNames = _map(message.message.quick_replies, (quickReply) => {
        // in array, because that means all buttons will be on new line
        // in telegram
        const buttonName = [quickReply.title];
        return buttonName;
      });
      formattedMessage.reply_markup = JSON.stringify({
        keyboard: buttonNames,
        one_time_keyboard: true,
        resize_keyboard: true,
      });
    }

    return formattedMessage;
  }

}

module.exports = TelegramBot;
