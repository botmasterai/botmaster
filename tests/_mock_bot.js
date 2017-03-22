'use strict';

const BaseBot = require('../lib/base_bot');
const express = require('express');
const expressBodyParser = require('body-parser');
const Koa = require('koa');

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

    this.retrievableUserInfo = settings.retrievableUserInfo || false;
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
      const update = this.__formatUpdate(req.body);
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
        const update = this.__formatUpdate(body);
        this.__emitUpdate(update);
      });

      ctx.status = 200;
    });
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

  __sendMessage(message, sendOptions) {
    return this.__sendRaw(message);
  }

  // sendRaw and __sendMessage are really the same thing for this MockBot
  // they both testing purposes anyways
  __sendRaw(message) {
    const timestamp = Math.floor(Date.now());
    const responseBody = {
      recipient_id: message.recipient.id,
      message_id: `${this.id}.${message.recipient.id}.${String(timestamp)}`,
    };

    return Promise.resolve(responseBody);
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
