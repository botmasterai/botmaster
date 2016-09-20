'use strict'

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
require('chai').should();
const _ = require('lodash');
const SlackBot = require('../../lib').botTypes.SlackBot;
const config = require('../config.js')

const credentials = config.slackCredentials;


describe('Slack bot tests', function() {
  const slackSettings = {
    credentials,
    webhookEndpoint: '/slack/webhook'
  }

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

  // const requestOptions = {
  //   method: 'POST',
  //   uri: 'http://localhost:3000/slack/webhook',
  //   body: {},
  //   json: true,
  //   resolveWithFullResponse: true
  // };

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
    bot = new SlackBot(slackSettings);
    app.use('/', bot.app);
    server = app.listen(3000, function() { done(); });
  });

  describe('/webhook endpoint works', function() {
    const requestOptions = {
      method: 'POST',
      uri: 'http://localhost:3000/slack/webhook',
      body: {},
      json: true,
      resolveWithFullResponse: true
    };


    it.only('should return the challenge when sending over verification handshake', function() {
      const challenge = '3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P';
      const body = {
        token: 'some_random_string',
        challenge,
        type: 'url_verification'
      }
      const options = _.cloneDeep(requestOptions);
      options.body = body;

      return request(options)
      .then(function(res) {
        assert.equal(res.body.challenge, challenge);
        assert.equal(200, res.statusCode);
      });
    })
  });

  after(function(done) {
    server.close(() => done());
  })

})
