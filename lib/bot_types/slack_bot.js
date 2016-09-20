'use strict';

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
const BaseBot = require('./base_bot.js');


const webAPIURL = 'https://api.telegram.org';

class SlackBot extends BaseBot {

  constructor(settings) {
    super(settings);
    this.type = 'slack';
    this.requiresWebhook = true;
    this.requiredCredentials = ['clientId', 'clientSecret'];

    this.__applySettings(settings);
    this.baseURL = `${webAPIURL}/bot${this.credentials.authToken}`;
    this.baseFileURL = `${webAPIURL}/bot${this.credentials.authToken}`;

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

    this.app.post(this.webhookEndpoint, this.__respondToVerificationHandshake);
    this.app.post(this.webhookEndpoint, this.__respondToEvent);
  }

  __respondToVerificationHandshake(req, res, next) {
    if (req.body.type === 'url_verification') {
      const challenge = req.body.challenge;
      return res.send({ challenge });
    }

    next();
  }

  __respondToEvent(req, res) {
    this.__formatUpdate(req.body)

    .then((update) => {
      this.__emitUpdate(update);
    }, (err) => {
      err.message = `Error in __formatUpdate "${err.message}". Please report this.`;
      this.emit('error', err);
    });

    // just letting Slack know we got the update
    res.sendStatus(200);

  }

  __formatUpdate(rawUpdate) {
    const promise = new Promise((resolve) => {

    });

    return promise;
  }

  sendMessage(message) {
  }

  __formatOutgoingMessage(message) {

  }

}

module.exports = SlackBot;
