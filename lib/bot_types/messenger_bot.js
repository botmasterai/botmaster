'use strict';

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const request = require('request-promise');
const BaseBot = require('./base_bot.js');

const baseURL = 'https://graph.facebook.com/v2.6';
const baseMessageURL = 'https://graph.facebook.com/v2.6/me/messages';

class MessengerBot extends BaseBot {

  constructor(settings) {
    super(settings);
    if (!settings.credentials ||
        !settings.credentials.verifyToken ||
        !settings.credentials.pageToken ||
        !settings.credentials.fbAppSecret) {
      this.emit('error', new ReferenceError('Credentials must be properly specified'));
    }
    this.type = 'messenger';
  }

  /**
   * sets up the app.
   * Adds an express Router to "/telegram".
   * sub Router contains code for posting to wehook.
   */
  __createMountPoints() {
    this.app = express();

    // doing this, because otherwise __verifyRe... doesn't have access
    // to the fbAppSecret
    this.app.use((req, res, next) => {
      req.fbAppSecret = this.credentials.fbAppSecret;
      next();
    });
    this.app.use(bodyParser.json({ verify: this.__verifyRequestSignature }));
    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.get(this.webhookEndpoint, (req, res) => {
      if (req.query['hub.verify_token'] === this.credentials.verifyToken) {
        res.send(req.query['hub.challenge']);
        console.log('token verified with:');
        console.log(req.query['hub.verify_token']);
      } else {
        res.send('Error, wrong validation token');
      }
    });

    this.app.post(this.webhookEndpoint, (req, res) => {
      // only do this if verifyRequestSignarure didn't return false
      if (req[req.fbAppSecret] !== false) {
        const entries = req.body.entry;
        this.__emitUpdatesFromEntries(entries);
        res.sendStatus(200);
      } else {
        // these are actual errors. But returning a 200 nontheless
        // just in case errors come from messenger somehow
        res.status(200).json(res.body);
      }
    });
  }

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 * This code is mostly taken from wit.ai's facebook bot example.
 *
 */
  __verifyRequestSignature(req, res, buf) {
    const signature = req.headers['x-hub-signature'];
    if (!signature) {
      req[req.fbAppSecret] = false;
      res.body = {
        error: 'Error, wrong signature',
      };
    } else {
      const signatureHash = signature.split('=')[1];

      const expectedHash = crypto.createHmac('sha1', req.fbAppSecret)
                          .update(buf)
                          .digest('hex');

      if (signatureHash !== expectedHash) {
        req[req.fbAppSecret] = false;
        res.body = {
          error: 'Error, wrong signature',
        };
      }
    }
  }

  __emitUpdatesFromEntries(entries) {
    for (const entry of entries) {
      const updates = entry.messaging;
      entry.messaging = null;

      for (const update of updates) {
        if (update.read || update.delivery ||
            update.sender.id === entry.id) {
          continue;
        }
        update.raw = entry;
        this.__emitUpdate(update);
      }
    }
  }

  sendMessage(message, session) {
    // TODO add request spliting when text is over 320 characters long.
    // log warning too.
    if (session) {
      message.recipient = {
        id: session.id,
      };
    }
    const options = {
      uri: baseMessageURL,
      qs: { access_token: this.credentials.pageToken },
      method: 'POST',
      json: message,
    };

    request(options)

    .then((body) => {
      if (body.error) {
        this.emit('error', body.error);
      }
    })
    .catch((err) => {
      this.emit('error', err);
    });
  }
}


// facebookBot.formatButtonsParams = function(buttonNames) {

//   // buttonNames are in the row format for telegram, so,
//   // deal with them as follows

//   let buttons = [];
//   let buttonsParams = null;

//   for (let buttonName of buttonNames) {
//     buttons.push({
//       type: "postback",
//       title: buttonName[0],
//       payload: buttonName[0]
//     })
//   }

//   buttonsParams = {
//     "type": "template",
//       "payload": {
//         "template_type": "generic",
//         "elements": [{
//           "buttons": buttons
//         }]
//       }
//   }

//   return buttonsParams;
// }

// facebookBot.sendMessage = function(senderId, text, attachment) {

//   let messageData = {};
//   messageData.text = text;
//   sendRequest(messageData);

//   // send the attachment separately
//   if (attachment) {
//     messageData = {};
//     attachment.payload.elements[0].title = "select one of:";
//     messageData.attachment = attachment;
//     sendRequest(messageData);
//   }

//   function sendRequest(messageData) {
//     request({
//       url: 'https://graph.facebook.com/v2.6/me/messages',
//       qs: { access_token: pageToken},
//       method: 'POST',
//       json: {
//         recipient: { id: senderId },
//         message: messageData
//       }
//     }, function(error, response) {
//       if (error) {
//         facebookBot.emit('error', error);
//       } else if (response.body.error) {
//         facebookBot.emit('error', response.body.error);
//       }
//     });
//   }

// }


module.exports = MessengerBot;
