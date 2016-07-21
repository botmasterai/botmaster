'use strict'

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
const crypto = require('crypto');
const req = require('request');
require('chai').should();
const _ = require('lodash');
const Botmaster = require('../../lib');
const SessionStore = Botmaster.storage.MemoryStore;

const bodyParser = require('body-parser');

    // app.use(bodyParser.json({ verify: verifyRequestSignature }));
/*
* just start a server listening on port 3000 locally
* then close connection and create the botmaster object
*/
let server = null
before(function(done) {
  server = app.listen(3001, function() { done(); });
})

after(function(done) {
  server.close(function() { done(); });
})


describe('MemoryStore for Telegram Bots', function() {

  const TOKEN = process.env.TELEGRAM_TEST_TOKEN;
  if (TOKEN === undefined) {
    throw new Error('Telegram Bot token must be defined. See Readme.md in ./tests');
  }
  const USERID = process.env.TELEGRAM_TEST_USER_ID;
  if (USERID == undefined) {
    throw new Error('Telegram test user must be defined. See Readme.md in ./tests');
  }

  const updateData = { 
    update_id: 100,
    message: { 
      message_id: 1,
      from: {id: USERID, first_name: 'Biggie', last_name: 'Smalls'},
      chat: { 
        id: USERID,
        first_name: 'Biggie',
        last_name: 'Smalls',
        type: 'private' 
      },
      date: 1468325836,
      text: 'Party & Bullshit'
    }
  };

  const requestOptions = {
    method: 'POST',
    uri: 'http://localhost:3001/telegram/webhook',
    body: updateData,
    json: true
  };

  let botmaster = null;
  before(function() {
    const telegramSettings = {
      credentials: {
        authToken: TOKEN
      },
      webhookEndpoint: '/webhook',
      sessionStore: new SessionStore()
    };
    const botsSettings = [{ telegram: telegramSettings }];
    botmaster = new Botmaster(botsSettings, app);
  })

  describe('when receiving an update from telegram', function() {
    it('should result in the update object having the right session on first message', function(done) {
      const expectedSession = {
        id: USERID,
        botId: TOKEN,
        latestMid: 100,
        latestSeq: 1,
        lastActive: 1468325836000
      };

      botmaster.once('update', function(bot, update) {
        expect(update.session).to.deep.equal(expectedSession);
        done();
      })

      request(requestOptions);
    });

    it('should result in the update object having the right session', function(done) {
      const expectedSession = {
        id: USERID,
        botId: TOKEN,
        latestMid: 101,
        latestSeq: 2,
        lastActive: 1468325836000
      };

      botmaster.once('update', function(bot, update) {
        expect(update.session).to.deep.equal(expectedSession);
        done();
      })

      const options = _.cloneDeep(requestOptions);
      options.body.update_id = 101;
      options.body.message.message_id = 2;

      request(options);
    });

  });
})

function getMessengerSignatureHeader(updateData, fbAppSecret) {
  const hash = crypto.createHmac('sha1', fbAppSecret)
    .update(JSON.stringify(updateData))
    .digest('hex');

  return `sha1=${hash}`;
}

describe('MemoryStore for Messenger Bots', function() {

  const MESSENGER_VERIFY_TOKEN = process.env.MESSENGER_VERIFY_TOKEN;
  if (MESSENGER_VERIFY_TOKEN === undefined) {
    throw new Error('MESSENGER_VERIFY_TOKEN must be defined. See Readme.md in ./tests');
  }
  const MESSENGER_PAGE_TOKEN = process.env.MESSENGER_PAGE_TOKEN;
  if (MESSENGER_PAGE_TOKEN == undefined) {
    throw new Error('MESSENGER_PAGE_TOKEN must be defined. See Readme.md in ./tests');
  }
  const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
  if (FACEBOOK_APP_SECRET == undefined) {
    throw new Error('FACEBOOK_APP_SECRET must be defined. See Readme.md in ./tests');
  }

  const userId = '134449875';
  const botId = '123124412'
  const updateData = {
    entry: [{
      messaging: [{
        sender: {
          id: userId // randoms for now...
        },
        recipient: {
          id: botId // randoms for now...
        },
        timestamp: 1468325836000,
        message: {
          mid: 100,
          seq: 1,
          text: 'Party & Bullshit'
        }
      }]
    }]
  }

  const requestOptions = {
    method: 'POST',
    uri: 'http://localhost:3001/messenger/webhook',
    body: updateData,
    json: true,
    headers: {
        'x-hub-signature': getMessengerSignatureHeader(updateData, FACEBOOK_APP_SECRET)
    }
  };

  let botmaster = null;
  before(function() {
    const messengerSettings = {
      credentials: {
        verifyToken: MESSENGER_VERIFY_TOKEN,
        pageToken: MESSENGER_PAGE_TOKEN,
        fbAppSecret: FACEBOOK_APP_SECRET
      },
      webhookEndpoint: '/webhook'
    };
    const botsSettings = [{ messenger: messengerSettings }];
    botmaster = new Botmaster(botsSettings, app, new SessionStore());
  })

  describe('when receiving an update from telegram', function() {
    it('should result in the update object having the right session on first message', function(done) {
      const expectedSession = {
        id: userId,
        botId: botId,
        latestMid: 100,
        latestSeq: 1,
        lastActive: 1468325836000
      };

      botmaster.once('update', function(bot, update) {
        expect(update.session).to.deep.equal(expectedSession);
        done();
      })

      request(requestOptions);
    });

    it('should result in the update object having the right session', function(done) {
      const expectedSession = {
        id: userId,
        botId: botId,
        latestMid: 101,
        latestSeq: 2,
        lastActive: 1468325836000
      };

      botmaster.once('update', function(bot, update) {
        expect(update.session).to.deep.equal(expectedSession);
        done();
      })

      const options = _.cloneDeep(requestOptions);
      options.body.entry[0].messaging[0].message.mid = 101;
      options.body.entry[0].messaging[0].message.seq = 2;
      options.headers['x-hub-signature'] = getMessengerSignatureHeader(
        options.body, FACEBOOK_APP_SECRET)

      request(options);
    });

  });
})
