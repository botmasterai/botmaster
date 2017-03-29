'use strict';

const BaseBot = require('../lib/base_bot');
const express = require('express');
const expressBodyParser = require('body-parser');
const Koa = require('koa');
const assign = require('lodash').assign;
const get = require('lodash').get;
const merge = require('lodash').merge;

class MockBot extends BaseBot {

  /**
   * Bot class that allows testers to create instances of a large number
   * of different bot instances with various different settings.
   *
   * @param {object} settings
   */
  constructor(settings) {
    super(settings);
    if (!settings) {
      settings = {};
    }
    this.type = settings.type || 'mock';
    // the following settings would be hard coded in a standard
    // bot class implementation.
    this.requiresWebhook = settings.requiresWebhook || false;
    this.requiredCredentials = settings.requiredCredentials || [];

    this.receives = settings.receives || {
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
      delivery: true,
      postback: true,
      quickReply: true,
    };

    this.sends = settings.sends || {
      text: true,
      quickReply: true,
      locationQuickReply: true,
      senderAction: {
        typingOn: true,
        typingOff: true,
        markSeen: true,
      },
      attachment: {
        audio: true,
        file: true,
        image: true,
        video: true,
      },
    };

    this.retrievesUserInfo = settings.retrievesUserInfo || false;
    this.id = settings.id || 'mockId';

    this.__applySettings(settings);
    if (this.webhookEndpoint) {
      if (this.webhookEndpoint.indexOf('koa') > -1) {
        this.__createKoaMountPoints();
      } else {
        // default to express
        this.__createExpressMountPoints();
      }
    }
  }

  // Note how neither of those classes uses webhookEndpoint.
  // This is because I can now count on botmaster to make sure that requests
  // meant to go to this bot are indeed routed to this bot.
  __createExpressMountPoints() {
    const app = express();
    this.requestListener = app;

    // for parsing application/json
    app.use(expressBodyParser.json());

    app.post('*', (req, res) => {
      const update = this.__formatRawUpdate(req.body);
      this.__emitUpdate(update);

      res.sendStatus(200);
    });
  }

  __createKoaMountPoints() {
    const app = new Koa();
    this.requestListener = app.callback();

    app.use((ctx) => {
      let bodyString = '';
      ctx.req.on('data', (chunk) => {
        bodyString += chunk;
      });

      ctx.req.on('end', () => {
        const body = JSON.parse(bodyString);
        const update = this.__formatRawUpdate(body);
        this.__emitUpdate(update);
      });

      ctx.status = 200;
    });
  }


  __formatRawUpdate(rawUpdate) {
    const timestamp = Math.floor(Date.now());
    const recipientId = get('recipient.id', rawUpdate, 'update_id');

    const update = {
      raw: rawUpdate,
      sender: {
        id: recipientId,
      },
      recipient: {
        id: this.id,
      },
      timestamp,
      message: {
        mid: `${this.id}.${recipientId}.${String(timestamp)}.`,
        seq: null,
      },
    };

    merge(update, rawUpdate);

    return update;
  }

  // doesn't actually do anything in mock_bot
  __formatOutgoingMessage(outgoingMessage) {
    const rawMessage = assign({}, outgoingMessage);
    return Promise.resolve(rawMessage);
  }

  __sendMessage(rawMessage) {
    const responseBody = {
      nonStandard: 'responseBody',
    };

    return Promise.resolve(responseBody);
  }

  __createStandardBodyResponseComponents(sentOutgoingMessage, sentRawMessage, raw) {
    const timestamp = Math.floor(Date.now());

    return Promise.resolve({
      recipient_id: sentRawMessage.recipient.id,
      message_id: `${this.id}.${sentRawMessage.recipient.id}.${String(timestamp)}`,
    });
  }

  __getUserInfo(userId) {
    return Promise.resolve({
      first_name: 'Peter',
      last_name: 'Chang',
      profile_pic: 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpf1/v/t1.0-1/p200x200/13055603_10105219398495383_8237637584159975445_n.jpg?oh=1d241d4b6d4dac50eaf9bb73288ea192&oe=57AF5C03&__gda__=1470213755_ab17c8c8e3a0a447fed3f272fa2179ce',
      locale: 'en_US',
      timezone: -7,
      gender: 'male',
    });
  }

}

module.exports = MockBot;
