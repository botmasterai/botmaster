'use strict'

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
require('chai').should();
const _ = require('lodash');
const TelegramBot = require('../../lib').botTypes.TelegramBot;
const config = require('../config.js')

const credentials = config.telegramCredentials;
const userId = config.telegramUserId;


describe('Telegram Bot tests', function() {
  const telegramSettings = {
    credentials,
    webhookEndpoint: '/telegram/webhook'
  };

  const baseIncommingMessage = { 
    message_id: 1,
    from: { id: userId, first_name: 'Biggie', last_name: 'Smalls' },
    chat: { 
      id: userId,
      first_name: 'Biggie',
      last_name: 'Smalls',
      type: 'private' 
    },
    date: 1468325836
  }

  const incomingTextMessage = _.cloneDeep(baseIncommingMessage);
  incomingTextMessage.text = "Party & Bullshit";

  const baseUpdateData = { 
    update_id: '466607164'
  };

  /*
  * Before all tests, create an instance of the bot which is
  * accessible in the following tests.
  * And also set up the mountpoint to make the calls.
  */
  let bot= null;

  before(function(){
    bot = new TelegramBot(telegramSettings);
    app.use('/', bot.app);
  });

  describe('#constructor()', function() {
    it('should throw an error when webhookEndPoint is missing', function(done) {
      const badSettings = _.cloneDeep(telegramSettings);
      badSettings.webhookEndpoint = undefined;
      expect(() => new TelegramBot(badSettings)).to.throw(
        'ERROR: bots of type \'telegram\' must be defined with webhookEndpoint in their settings');
      done();
    });

    it('should throw an error when authToken credential is missing', function(done) {
      const badSettings = _.cloneDeep(telegramSettings);
      badSettings.credentials.authToken = undefined;
      expect(() => new TelegramBot(badSettings)).to.throw(
        'ERROR: bots of type \'telegram\' are expected to have \'authToken\' credentials');
      done();
    });
  });

  describe('/webhook endpoint works', function() {
    const requestOptions = {
      method: 'POST',
      uri: 'http://localhost:3000/telegram/webhook',
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

      // an error will occur here as request is badly formatted. but we don't
      // care. So I eat the error up here.
      bot.once('error', () => {});

      return request(requestOptions)
      .then(function(res) {
        assert.equal(200, res.statusCode);
      });
    })

    it('should emit an error event to the bot object when ' +
       'update is badly formatted', function(done) {

      bot.once('error', function(err) {
        err.message.should.equal(`Error in __formatUpdate "Cannot read property 'from' of undefined". Please report this.`);
        done();
      })

      const options = _.cloneDeep(requestOptions);
      options.body = baseUpdateData;

      request(options);
    })

    it('should emit an update event to the bot object when ' +
       'update is well formatted', function(done) {

      bot.once('update', function(update) {
        done();
      })

      const updateData = _.cloneDeep(baseUpdateData);
      updateData.message = incomingTextMessage;

      const options = _.cloneDeep(requestOptions);
      options.body = updateData;

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

      const updateData = _.cloneDeep(baseUpdateData);
      updateData.message = incomingTextMessage;

      const options = _.cloneDeep(requestOptions);
      options.body = updateData;

      request(options);
    })

  })

  describe('telegram #__formatUpdate(rawUpdate)', function() {
    it('should format a text message update in the expected way', function() {
      const rawUpdate = _.cloneDeep(baseUpdateData);
      rawUpdate.message = incomingTextMessage;

      return bot.__formatUpdate(rawUpdate)
      .then(function(update) {
        const expectedUpdate = {
          raw: rawUpdate,
          sender: {
            id: rawUpdate.message.from.id
          },
          recipient: {
            id: config.telegramBotId
          },
          timestamp: rawUpdate.message.date * 1000,
          message: {
            mid: rawUpdate.update_id,
            seq: rawUpdate.message.message_id,
            text: rawUpdate.message.text
          }
        };
        expect(update).to.deep.equal(expectedUpdate);
      });

    })

    it('should format an audio message update in the expected way', function() {
      this.skip();
    })

    it('should format a voice message update in the expected way', function() {
      this.skip();
    })

    it('should format a document message update in the expected way', function() {
      this.skip();
    })

    it('should format a photo message update in the expected way', function() {
      this.skip();
    })

    it('should format a sticker message update in the expected way', function() {
      this.skip();
    })

    it('should format a video message update in the expected way', function() {
      this.skip();
    })

    it('should format a location message update in the expected way', function() {
      this.skip();
    })

    it('should format a photo with text message update in the expected way', function() {
      this.skip();
    })
  })

});