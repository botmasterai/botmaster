'use strict'

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
require('chai').should();
const _ = require('lodash');
const TwitterBot = require('../../lib').botTypes.TwitterBot;
const Twit = require('twit');
const config = require('../config.js');

const botCredentials = config.twitterCredentials1;
const senderCredentials = config.twitterCredentials2;

describe('Twitter Bot', function() {
  const settings = {
    credentials: botCredentials
  };

  /*
  * Before all tests, create an instance of the bot which is
  * accessible in the following tests.
  * And also set up the mountpoint to make the calls.
  */
  let bot;

  before(function(){
    bot = new TwitterBot(settings);
  });

  describe('#constructor()', function() {
    it('should throw an error when authToken credential is missing', function(done) {
      const badSettings = _.cloneDeep(settings);
      badSettings.credentials.consumer_key = undefined;
      expect(() => new TwitterBot(badSettings)).to.throw(
        'Credentials must have consumer Key');
      done();
    });
  });


  describe('receiving updates', function () {

    // TwitterBot is linked to an account that can 
    // receive updates from anyone.
    // In this instance, "anyone" is the sender.
    let twitSender;
    before(function () {
      twitSender = new Twit(senderCredentials);
    })

    it.only('should emit an update event to the bot object when ' +
            'receiving a text update', function (done) {

      this.timeout(5000);
      let sentDmId;
      let receivedDmIds = [];

      // this can actually happen multiple times if the stream
      // ever has to reconnect because the connection is lost somehow
      bot.userStream.on('connected', function() {
        // this is the text message that twitSender sends to our bot
        const textMessageToSend = {
          user_id: bot.idStr,
          text: 'Party & Bullshit',
          twit_options: {
            retry: true
          }
        }

        twitSender.post('direct_messages/new', textMessageToSend, function (err, reply) {
          assert(!err, err);
          assert(reply.id_str);
          // we will check this dm against the reply recieved in the message event
          sentDmId = reply.id_str;

          console.log('successfully posted DM:', reply.text, reply.id_str)
          if (receivedDmIds.indexOf(sentDmId) !== -1) {
            done();
          }
        })
      })

      bot.on('update', function (update) {
        receivedDmIds.push(update.message.mid);
        console.log('got DM event. id:', update.message.mid);

        if (receivedDmIds.indexOf(sentDmId) === -1) {
          console.log('this DM doesnt match our test DM - race was probably won by listener');
          return;
        }

        const expectedUpdate = {
          'raw': update.raw,
          'sender': {
            'id': senderCredentials.access_token.split('-')[0]
          },
          'recipient': {
            'id': bot.idStr
          },
          'timestamp': (new Date(update.raw.direct_message.created_at)).getTime(),
          'message': {
            'mid': sentDmId,
            'seq': null,
            'text': 'Party & Bullshit'
          }
        };
        expect(update).to.deep.equal(expectedUpdate);

        done();
      })

      after(function (done) {
        console.log('removing DM:', sentDmId);

        var params = { id: sentDmId, twit_options: { retry: true } }
        twitSender.post('direct_messages/destroy', params, function (err, reply) {
          assert(!err, err);
          assert.equal(reply.id, sentDmId);
          done();
        })
        // bot.twit.post('direct_messages/destroy', params);
      })
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

  // TODO: probably better off doing the messenger one tests before so I know
  // what the function looks like already and what to convert it to
  describe('#sendMessage(message)', function() {
    it('should succeed in sending a standard text message', function() {
      this.skip();
    })
  })
});