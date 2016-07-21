'use strict';

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
const BaseBot = require('./base_bot.js');

const baseURL = 'https://graph.facebook.com/v2.6';
const baseMessageURL = 'https://graph.facebook.com/v2.6/me/messages';

class MessengerBot extends BaseBot {

  constructor(settings) {
    super(settings);
    if (!settings.credentials ||
        !settings.credentials.verifyToken ||
        !settings.credentials.pageToken) {
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
    // for parsing application/json
    this.app.use(bodyParser.json());
    // TODO, use that one instead now for parsing application/x-www-form-urlencoded
    // this.app.use(bodyParser.json({ verify: verifyRequestSignature }));
    this.app.use(bodyParser.urlencoded({ extended: true }));

    this.app.get(this.webhookEndpoint, (req, res) => {
      if (req.query['hub.verify_token'] === this.credentials.verifyToken) {
        res.send(req.query['hub.challenge']);
      } else {
        res.send('Error, wrong validation token');
      }
    });

    this.app.post(this.webhookEndpoint, (req, res) => {
      const entries = req.body.entry;
      this.__emitUpdatesFromEntries(entries);

      res.sendStatus(200);
    });
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

  sendMessage(message) {
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


// facebookApp.post('/webhook/', function (req, res) {

//   let updates = req.body.entry[0].messaging;

//   for (let update of updates) {
//     facebookBot.emit('gotUpdate', update);
//   }

//   res.sendStatus(200);
// });


// facebookBot.getUserInfoFromUpdate = function(update) {

//   let user = {
//     id: update.sender.id,
//     name: "there" // because no access to Facebook graph yet for names
//   }

//   return user;
// }

// facebookBot.getMessageInfoFromUpdate = function(update) {

//   let text = null;
//   if (update.postback) {
//     text = update.postback.payload;
//   } else {
//     text = update.message.text
//   }

//   let message = {
//     chatId: update.sender.id,
//     text: text
//   }

//   return message;
// }


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


/*
 * TODO
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
// function verifyRequestSignature(req, res, buf) {
//   var signature = req.headers["x-hub-signature"];

//   if (!signature) {
//     // For testing, let's log an error. In production, you should throw an
//     // error.
//     console.error("Couldn't validate the signature.");
//   } else {
//     var elements = signature.split('=');
//     var method = elements[0];
//     var signatureHash = elements[1];

//     var expectedHash = crypto.createHmac('sha1', FB_APP_SECRET)
//                         .update(buf)
//                         .digest('hex');

//     if (signatureHash != expectedHash) {
//       throw new Error("Couldn't validate the request signature.");
//     }
//   }
// }

module.exports = MessengerBot;
