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

  const requestOptions = {
    method: 'POST',
    uri: 'http://localhost:3000/messenger/webhook',
    body: {},
    json: true,
    resolveWithFullResponse: true
  };

  /*
  * Before all tests, create an instance of the bot which is
  * accessible in the following tests.
  * And also set up the mountpoint to make the calls.
  * Also start a server listening on port 3000 locally
  * then close connection
  */
  let bot= null;
  let server = null

  before(function(done){
    bot = new MessengerBot(settings);
    app.use('/', bot.app);
    server = app.listen(3000, function() { done(); });
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

    it('should emit an update event to the bot object when ' +
            'update is well formatted. Also, bot.id should be set', function(done) {

      expect(bot.id).to.equal(undefined); // before the first request is done

      bot.once('update', function(update) {
        expect(bot.id).to.not.equal(undefined); // after the first request is done
        done();
      })

      const options = _.cloneDeep(requestOptions);
      options.body = baseIncommingUpdate;
      options.headers = {
        'x-hub-signature': getMessengerSignatureHeader(
        baseIncommingUpdate, credentials.fbAppSecret)
      }

      return request(options)
      .then(function(res) {
        assert.equal(undefined, res.body.error); // no error returned
      });
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

  describe('sending messages work', function() {
    it('should succeed in sending a standard message #sendMessage', function(done) {
      const message = { 
        recipient: {
          id: config.messengerUserId
        },
        message: {
          text: 'Party & bullshit'
        }
      }

      bot.sendMessage(message)

      .then(function(body) {
        expect(body.message_id).to.not.equal(undefined);
        expect(body.recipient_id).to.not.equal(undefined);
        done();
      })
    })

    it('should succeed in sending message to #sendMessageTo', function(done) {
      const message = { 
        text: 'Party & bullshit'
      }

      bot.sendMessageTo(message, config.messengerUserId)

      .then(function(body) {
        expect(body.message_id).to.not.equal(undefined);
        expect(body.recipient_id).to.not.equal(undefined);
        done();
      })
    })

    it('should succeed in sending a standard text message #sendTextMessageTo', function(done) {
      bot.sendTextMessageTo('Party & bullshit', config.messengerUserId)

      .then(function(body) {
        expect(body.message_id).to.not.equal(undefined);
        expect(body.recipient_id).to.not.equal(undefined);
        done();
      })
    })

    it('should succeed in replying to any message #reply', function(done) {
      bot.once('update', function(update) {
        bot.reply(update, 'replying to update')

        .then(function(body) {
          expect(body.message_id).to.not.equal(undefined);
          expect(body.recipient_id).to.not.equal(undefined);
          done();
        });
      })

      const options = _.cloneDeep(requestOptions);
      options.body = baseIncommingUpdate;
      options.headers = {
        'x-hub-signature': getMessengerSignatureHeader(
        baseIncommingUpdate, credentials.fbAppSecret)
      }

      return request(options)
      .then(function(res) {
        assert.equal(undefined, res.body.error); // no error returned
      });
    })

    it.only('should succeed in sending a message with default buttons #sendDefaultButtonMessageTo', function(done) {
      const buttons = ['option One', 'Option Two', 'Option Three'];

      Promise.all([
        bot.sendDefaultButtonMessageTo(buttons, config.messengerUserId),
        bot.sendDefaultButtonMessageTo(buttons, config.messengerUserId, 'Don\'t select any of:')
      ])
      .then(function(responses) {
        expect(responses[0].message_id).to.not.equal(undefined);
        expect(responses[0].recipient_id).to.not.equal(undefined);
        expect(responses[1].message_id).to.not.equal(undefined);
        expect(responses[1].recipient_id).to.not.equal(undefined);
        done()
      });
    })

  })

  after(function(done) {
    server.close(function() { done(); });
  })

});