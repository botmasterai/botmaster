'use strict'

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
const JsonFileStore = require('jfs');
require('chai').should();
const _ = require('lodash');
const SlackBot = require('../../lib').botTypes.SlackBot;
const config = require('../config.js')

const credentials = config.slackCredentials;
const slackTeamInfo = config.slackTeamInfo;
const slackTestInfo = config.slackTestInfo;


describe('Slack bot tests', function() {
  const slackSettings = {
    credentials,
    webhookEndpoint: '/slack/webhook'
  }

  const baseIncommingMessage = {
    token: credentials.verificationToken,
    team_id: slackTestInfo.team_id,
    api_app_id: slackTestInfo.api_app_id,
    event: {
      type: 'message',
      user: slackTestInfo.user,
      text: 'Part & Bullshit :tada',
      ts: '1474463115.000004',
      channel: slackTestInfo.channel,
      event_ts: '1474463115.000004'
    },
    type: 'event_callback',
    authed_users: [
      slackTestInfo.bot_user_id
    ]
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
      resolveWithFullResponse: true,
      simple: false // 4xx errors go through
    };

    it('should respond with 403 if verification token is invalid', function() {
      return request(requestOptions)
      .then(function(res) {
        res.statusCode.should.equal(403);
      });
    })

    it('should respond with 200 OK if verification token is valid', function() {
      const options = _.cloneDeep(requestOptions);
      options.body = {
        token: credentials.verificationToken
      }

      return request(options)
      .then(function(res) {
        res.statusCode.should.equal(200);
      });
    })

    it('should respond with challenge when sending over verification handshake', function() {
      const challenge = '3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P';
      const body = {
        token: credentials.verificationToken,
        challenge,
        type: 'url_verification'
      }
      const options = _.cloneDeep(requestOptions);
      options.body = body;

      return request(options)
      .then(function(res) {
        res.body.challenge.should.equal(challenge);
      });
    })

    // it.only('should emit an error event to the bot object when ' +
    //    'slack message is badly formatted', function(done) {
    //
    //   bot.once('error', function(err) {
    //     err.message.should.equal(`Error in __formatUpdate "Cannot read property 'type' of undefined". Please report this.`);
    //     done();
    //   })
    //
    //   const options = _.cloneDeep(requestOptions);
    //   const invalidIncomingMessage = _.cloneDeep(baseIncommingMessage);
    //   delete invalidIncomingMessage.event;
    //   options.body = invalidIncomingMessage;
    //
    //   request(options);
    // })

    it('should emit an update event to the bot object when ' +
       'slack message is well formatted', function(done) {

      bot.once('update', function(update) {
        done();
      })

      const options = _.cloneDeep(requestOptions);
      options.body = baseIncommingMessage;

      request(options);
    })

  });

  describe('slack #__storeTeamInfo', function() {
    it('should store teamInfo in json file when no sessionStore is specified',
       function() {
      const jsonFileStoreDB = new JsonFileStore('slack_teams_info');
      return bot.__storeTeamInfo(slackTeamInfo, () => {
        const readFromFileTeamInfo = jsonFileStoreDB.getSync(slackTestInfo.team_id);
        expect(readFromFileTeamInfo).to.deep.equal(slackTeamInfo);
      });
    })
  })

  describe('slack #__formatUpdate(rawUpdate)', function() {
    it('should format a text message update in the expected way', function() {
      const rawUpdate = baseIncommingMessage;
      const senderId = `${slackTestInfo.team_id}.${slackTestInfo.channel}.${slackTestInfo.user}`;

      const expectedUpdate = {
        raw: rawUpdate,
        sender: {
          id: senderId
        },
        recipient: {
          id: `${slackTestInfo.team_id}.${slackTestInfo.channel}`
        },
        timestamp: parseInt(rawUpdate.event.ts.split('.')[0]) * 1000,
        message: {
          mid: `${senderId}.${rawUpdate.event.ts}`,
          seq: rawUpdate.event.ts.split('.')[1],
          text: rawUpdate.event.text
        }
      }

      const update = bot.__formatUpdate(rawUpdate);
      expect(update).to.deep.equal(expectedUpdate);
    })
  })

  after(function(done) {
    server.close(() => done());
  })

})
