'use strict'

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
const crypto = require('crypto');
require('chai').should();
const _ = require('lodash');
const MessengerBot = require('../../lib').botTypes.MessengerBot;
const config = require('../config.js')

const credentials = config.messengerCredentials;

function getMessengerSignatureHeader(updateData, fbAppSecret) {
  const hash = crypto.createHmac('sha1', fbAppSecret)
    .update(JSON.stringify(updateData))
    .digest('hex');

  return `sha1=${hash}`;
}

describe('Messenger Bot', function() {
  const settings = {
    credentials,
    webhookEndpoint: '/messenger/webhook'
  };

  const baseIncommingMessage = {
    sender: {
      id: config.messengerUserId
    },
    recipient: {
      id: config.messengerBotId // will typically be the bot's id
    },
    timestamp: 1468325836000,
    message: {
      mid: '1234567890.sadfcersc34c',
      seq: 1,
      text: 'Party & Bullshit'
    }
  }

  const baseIncommingUpdate = {
    entry: [{
      messaging: [baseIncommingMessage]
    }]
  }

  /*
  * Before all tests, create an instance of the bot which is
  * accessible in the following tests.
  * And also set up the mountpoint to make the calls.
  */
  let bot= null;

  before(function(){
    bot = new MessengerBot(settings);
    app.use('/', bot.app);
  });

  describe('#constructor()', function() {
    it('should throw an error when webhookEndPoint is missing', function(done) {
      const badSettings = _.cloneDeep(settings);
      badSettings.webhookEndpoint = undefined;
      expect(() => new MessengerBot(badSettings)).to.throw(
        'ERROR: bots of type messenger must be defined with webhookEndpoint in their settings');
      done();
    });

    it('should throw an error when verifyToken credential is missing', function(done) {
      const badSettings = _.cloneDeep(settings);
      badSettings.credentials.verifyToken = undefined;
      expect(() => new MessengerBot(badSettings)).to.throw(
        'ERROR: bots of type messenger are expected to have verifyToken credentials');
      done();
    });
  });

  describe('/webhook endpoint works', function() {
    const requestOptions = {
      method: 'POST',
      uri: 'http://localhost:3000/messenger/webhook',
      body: {},
      json: true,
      resolveWithFullResponse: true
    };

    /*
    * just start a server listening on port 3000 locally
    * then close connection
    */
    let server = null
    before(function(done) {
      server = app.listen(3000, function() { done(); });
    })

    after(function(done) {
      server.close(function() { done(); });
    })

    it('should return a 200 statusCode when doing a standard request', function() {
      return request(requestOptions)
      .then(function(res) {
        assert.equal(200, res.statusCode);
      });
    })

    it('should return an error in the response body if signature is absent', function() {
      return request(requestOptions)
      .then(function(res) {
        res.body.error.should.equal('Error, wrong signature');
      });
    })

    it('should return an error in the response body if signature is wrong', function() {
      const options = _.cloneDeep(requestOptions);
      options.body = baseIncommingUpdate;
      options.headers = {
        'x-hub-signature': getMessengerSignatureHeader(
        baseIncommingUpdate, 'someWrongAppSecret')
      }

      return request(options)
      .then(function(res) {
        res.body.error.should.equal('Error, wrong signature');
      });
    })

    it('should not return an error in the response body if signature is right', function() {
      const options = _.cloneDeep(requestOptions);
      options.body = baseIncommingUpdate;
      options.headers = {
        'x-hub-signature': getMessengerSignatureHeader(
        baseIncommingUpdate, credentials.fbAppSecret)
      }

      return request(options)
      .then(function(res) {
        assert.equal(undefined, res.body.error);
      });
    })

    it('should emit an update event to the bot object when ' +
       'update is well formatted', function(done) {

      bot.once('update', function(update) {
        done();
      })

      const options = _.cloneDeep(requestOptions);
      options.body = baseIncommingUpdate;
      options.headers = {
        'x-hub-signature': getMessengerSignatureHeader(
        baseIncommingUpdate, credentials.fbAppSecret)
      }

      request(options);
    })

    it('should emit a standard error event to the bot object when ' +
       'developer codes error in on("update") block', function(done) {

      bot.once('update', function(update) {
        bot.blob(); // this is not an actual funcion => error expected
      })

      bot.once('error', function(err) {
        err.message.should.equal(`Uncaught error: "bot.blob is not a function". This is most probably on your end.`);
        done();
      })

      const options = _.cloneDeep(requestOptions);
      options.body = baseIncommingUpdate;
      options.headers = {
        'x-hub-signature': getMessengerSignatureHeader(
        baseIncommingUpdate, credentials.fbAppSecret)
      }

      request(options);
    })

  })

  // TODO: probably better off doing the messenger one tests before so I know
  // what the function looks like already and what to convert it to
  describe('#sendMessage(message)', function() {
    it('should succeed in sending a standard text message', function() {
      this.skip();
    })
  })
});