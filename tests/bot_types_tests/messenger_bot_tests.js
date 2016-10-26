'use strict';

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
require('chai').should();
const _ = require('lodash');
const MessengerBot = require('../../lib').botTypes.MessengerBot;
const config = require('../config.js');
const getMessengerSignatureHeader = require('../tests_utils').getMessengerSignatureHeader;

const credentials = config.messengerCredentials;

describe('Messenger Bot tests', function() {
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
  };

  const baseIncommingUpdate = {
    entry: [{
      messaging: [baseIncommingMessage]
    }]
  };

  const requestOptions = {
    method: 'POST',
    uri: 'http://localhost:3001/messenger/webhook',
    body: {},
    json: true,
    resolveWithFullResponse: true
  };

  /*
  * Before all tests, create an instance of the bot which is
  * accessible in the following tests.
  * And also set up the mountpoint to make the calls.
  * Also start a server listening on port 3001 locally
  * then close connection
  */
  let bot= null;
  let server = null;

  before(function(done){
    bot = new MessengerBot(settings);
    app.use('/', bot.app);
    server = app.listen(3001, function() { done(); });
  });

  describe('#constructor()', function() {
    it('should throw an error when webhookEndPoint is missing', function(done) {
      const badSettings = _.cloneDeep(settings);
      badSettings.webhookEndpoint = undefined;
      expect(() => new MessengerBot(badSettings)).to.throw(
        'ERROR: bots of type \'messenger\' must be defined with webhookEndpoint in their settings');
      done();
    });

    it('should throw an error when verifyToken credential is missing', function(done) {
      const badSettings = _.cloneDeep(settings);
      badSettings.credentials.verifyToken = undefined;
      expect(() => new MessengerBot(badSettings)).to.throw(
        'ERROR: bots of type \'messenger\' are expected to have \'verifyToken\' credentials');
      done();
    });
  });

  describe('/webhook endpoint works', function() {
    it('should return a 200 statusCode when doing a standard request', function() {
      return request(requestOptions)
      .then(function(res) {
        assert.equal(200, res.statusCode);
      });
    });

    it('should return an error in the response body if signature is absent', function() {
      return request(requestOptions)
      .then(function(res) {
        res.body.error.should.equal('Error, wrong signature');
      });
    });

    it('should return an error in the response body if signature is wrong', function() {
      const options = _.cloneDeep(requestOptions);
      options.body = baseIncommingUpdate;
      options.headers = {
        'x-hub-signature': getMessengerSignatureHeader(
        baseIncommingUpdate, 'someWrongAppSecret')
      };

      return request(options)
      .then(function(res) {
        res.body.error.should.equal('Error, wrong signature');
      });
    });

    it('should emit an update event to the bot object when ' +
       'update is well formatted. Also, bot.id should be set', function(done) {

      expect(bot.id).to.equal(undefined); // before the first request is done

      bot.once('update', function() {
        expect(bot.id).to.not.equal(undefined); // after the first request is done
        done();
      });

      const options = _.cloneDeep(requestOptions);
      options.body = baseIncommingUpdate;
      options.headers = {
        'x-hub-signature': getMessengerSignatureHeader(
        baseIncommingUpdate, credentials.fbAppSecret)
      };

      return request(options)
      .then(function(res) {
        assert.equal(undefined, res.body.error); // no error returned
      });
    });

    it('should emit a standard error event to the bot object when ' +
       'developer codes error in .on("update") block', function(done) {

      bot.once('update', function() {
        bot.blob(); // this is not an actual funcion => error expected
      });

      bot.once('error', function(err) {
        err.message.should.equal(`"bot.blob is not a function". This is most probably on your end.`);
        done();
      });

      const options = _.cloneDeep(requestOptions);
      options.body = baseIncommingUpdate;
      options.headers = {
        'x-hub-signature': getMessengerSignatureHeader(
        baseIncommingUpdate, credentials.fbAppSecret)
      };

      request(options);
    });
  });

  describe('#getUserInfo()', function() {
    it('should return the userInfo for the passed in userId', function() {
      return bot.getUserInfo(config.messengerUserId)

      .then((userInfo) => {
        expect(userInfo.last_name).to.equal('Wuarin');
        expect(userInfo.gender).to.equal('male');
      });
    });
  });

  after(function(done) {
    this.retries(4);
    server.close(() => done());
  });
});
