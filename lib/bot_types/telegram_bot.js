'use strict';

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
const BaseBot = require('./base_bot.js');


const baseURL = 'https://api.telegram.org';
const baseFileURL = 'https://api.telegram.org/file';

class TelegramBot extends BaseBot {

  constructor(settings) {
    super(settings);
    if (!settings.credentials || !settings.credentials.authToken) {
      this.emit('error', new ReferenceError('Credentials must have authToken'));
    }
    this.type = 'telegram';
    this.baseURL = `${baseURL}/bot${this.credentials.authToken}`;
    this.baseFileURL = `${baseFileURL}/bot${this.credentials.authToken}`;
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
        this.emit('update', update);
      }, (err) => {
        // TODO fix error handling as everything kind of happens to occur when
        // the event is emitted. This is probably kind of uncaught exceptions.
        err.message = `Error in __formatUpdate "${err.message}". Please report this.`;
        this.emit('error', err);
      })
      .catch((err) => {
        err.message = `Uncaught error: "${err.message}". This is most probably on your end.`;
        this.emit('error', err);
      });

      // just letting telegram know we got the update
      res.sendStatus(200);
    });
  }

  __formatUpdate(rawUpdate) {
    const promise = new Promise((resolve) => {
      let update = null;
      update = {
        raw: rawUpdate,
        sender: {
          id: rawUpdate.message.from.id,
        },
        recipient: {
          id: this.credentials.authToken,
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
        if (attachments.length) {
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
   * @return Promise wchich resolves to an array of {object} attachments
   */
  __getAttachments(rawUpdate) {
    const promise = new Promise((resolve, reject) => {
      const fileIdsInfo = this.__getAttachmentsInfo(rawUpdate);
      const attachments = [];
      let attachmentCount = 0;
      const shouldReturn = () => {
        const condition = attachmentCount === attachments.length;
        return condition;
      };

      // attachment obejct for location can be derived from current data
      if (rawUpdate.message.location !== undefined) {
        // TODO: return proper coordinates thing
        // looks like this: http://maps.google.com/?q=51.03841,-114.01679
      }

      attachmentCount = _.keys(fileIdsInfo).length + attachments.length;

      if (shouldReturn) { resolve(attachments); }

      for (const fileId of Object.keys(fileIdsInfo)) {
        this.__getAttachment(fileId, fileIdsInfo[fileId])

        .then((attachment) => {
          attachments.push(attachment);
          if (shouldReturn) { resolve(attachments); }
        });
      }
    });
    return promise;
  }

  __getAttachmentsInfo(rawUpdate) {
    const fileIdsInfo = {};

    if (rawUpdate.message.audio !== undefined) {
      fileIdsInfo[rawUpdate.message.audio.file_id] = 'audio';
    }
    if (rawUpdate.message.voice !== undefined) {
      fileIdsInfo[rawUpdate.message.voice.file_id] = 'audio'; // messenger only has audio
    }
    if (rawUpdate.message.document !== undefined) {
      fileIdsInfo[rawUpdate.message.document.file_id] = 'file';
    }
    if (rawUpdate.message.photo !== undefined) {
      // telegram returns array of PhotoSize, => we take last (largest one).
      const photoSizeArray = rawUpdate.message.photo;
      const fileId = photoSizeArray[photoSizeArray.length - 1].file_id;
      fileIdsInfo[fileId] = 'image';
    }
    if (rawUpdate.message.sticker !== undefined) {
      fileIdsInfo[rawUpdate.message.sticker.file_id] = 'image'; // messenger only has image
    }
    if (rawUpdate.message.video !== undefined) {
      fileIdsInfo[rawUpdate.message.video.file_id] = 'video';
    }

    return fileIdsInfo;
  }

  __getAttachment(fileId, type) {
    this._getFile(fileId)

    .then((body) => {
      console.log(body);
      const attachment = {
        type,
        url: body.url,
      };
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
    });
  }

  __extractSessionFromUpdate(update) {

  }

  sendMessage(message) {
    const messageData = {};

    messageData.chat_id = message.recipient.id;
    messageData.text = message.message.text;

    const options = {
      uri: `${this.baseURL}/sendMessage`,
      method: 'POST',
      json: messageData,
    };

    request(options)

    .then((body) => {
      if (body.error) {
        console.log(body.error);
        this.emit('error', body.error);
      }
    })
    .catch((err) => {
      console.log(err);
      this.emit('error', err);
    });
  }

  // telegramBot.sendMessage = function(chatId, text, optionalParams) {

  //   if (typeof optionalParams === 'undefined' || optionalParams === null) {
  //     optionalParams = {};
  //   }
  //   // first create the optional parameters string

  //   let postData = optionalParams;
  //   postData['chat_id'] = chatId;
  //   postData['text'] = text

  //   request.post("https://" + telegramApiHost + telegramKey + "/sendMessage",
  //                { json: postData }, sendMessageCallback)

  //   function sendMessageCallback(error, response, body) {
  //     if (error || response.statusCode !== 200) {
  //       telegramBot.emit('error', error || body);
  //       // try resending after error.
  //       telegramBot.sendMessage(chatId, text, optionalParams);
  //     }
  //   }

  // };

  // telegramBot.getUserInfoFromUpdate = function(update) {

  //   let user = {
  //     id: update.message.from.id,
  //     name: update.message.from.first_name + ' ' + update.message.from.last_name
  //   }

  //   return user;
  // }

  // telegramBot.formatButtonsParams = function(buttonNames) {

  //   let buttonsParams = { reply_markup: JSON.stringify(
  //     {"keyboard": buttonNames,
  //                  "one_time_keyboard": true,
  //                  "resize_keyboard": true,
  //     })
  //   };

  //   return buttonsParams;
  // }

}

module.exports = TelegramBot;
