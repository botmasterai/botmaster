'use strict'

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
require('chai').should();
const _ = require('lodash');
const TwitterBot = require('../../lib').botTypes.TwitterBot;
const Twit = require('twit');
const config = require('../config.js')

const botCredentials = config.twitterCredentials1;
const senderCredentials = config.twitterCredentials2;

describe('Twitter Bot', function() {
  const settings = {
    credentials: botCredentials
  };

  const baseIncommingMessage = { 
    // message_id: 1,
    // from: {id: USERID, first_name: 'Biggie', last_name: 'Smalls'},
    // chat: { 
    //   id: USERID,
    //   first_name: 'Biggie',
    //   last_name: 'Smalls',
    //   type: 'private' 
    // },
    // date: 1468325836
  }

  const incommingTextMessage = _.cloneDeep(baseIncommingMessage);
  incommingTextMessage.text = "Party & Bullshit";

  const baseUpdateData = { 
    update_id: '466607164'
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
    let senderScreenName;
    let receiverScreenName;
    let twitSender;

    // before we send direct messages the user receiving the DM
    // has to follow the sender. Make this so.
    before(function (done) {
      twitSender = new Twit(senderCredentials);

      // get sender/receiver names in parallel, then make the receiver follow the sender
      async.parallel({
        // get sender screen name and set it for tests to use
        getSenderScreenName: function (parNext) {
          console.log('getting sender user screen_name')

          twitSender.get('account/verify_credentials', { twit_options: { retry: true } }, function (err, reply) {
            assert(!err, err)

            assert(reply)
            assert(reply.screen_name)

            senderScreenName = reply.screen_name

            return parNext()
          })
        },
        // get receiver screen name and set it for tests to use
        getReceiverScreenName: function (parNext) {
          console.log('getting receiver user screen_name')
          twitReceiver.get('account/verify_credentials', { twit_options: { retry: true } }, function (err, reply) {
            assert(!err, err)

            assert(reply)
            assert(reply.screen_name)

            receiverScreenName = reply.screen_name

            return parNext()
          })
        }
      }, function (err) {
        assert(!err, err)

        var followParams = { screen_name: senderScreenName }
        console.log('making receiver user follow the sender user')
        // make receiver follow sender
        twitReceiver.post('friendships/create', followParams, function (err, reply) {
          assert(!err, err)
          assert(reply.following)

          done()
        })
      })
    })

    it('should work when ', function (done) {
      // User A follows User B
      // User A connects to their user stream
      // User B posts a DM to User A
      // User A receives it in their user stream
      this.timeout(0);

      // build out DM params
      function makeDmParams () {
        return {
          screen_name: receiverScreenName,
          text: helpers.generateRandomString(10) + ' direct message streaming event test! :-) ' + helpers.generateRandomString(20),
          twit_options: {
            retry: true
          }
        }
      }

      var dmIdsReceived = []
      var dmIdsSent = []
      var sentDmFound = false

      // start listening for user stream events
      var receiverStream = twitReceiver.stream('user')

      console.log('\nlistening for DMs')
      // listen for direct_message event and check DM once it's received
      receiverStream.on('direct_message', function (directMsg) {
        if (sentDmFound) {
          // don't call `done` more than once
          return
        }

        console.log('got DM event. id:', directMsg.direct_message.id_str)
        restTest.checkDm(directMsg.direct_message)
        dmIdsReceived.push(directMsg.direct_message.id_str)

        // make sure one of the DMs sent was found
        // (we can send multiple DMs if our stream has to reconnect)
        sentDmFound = dmIdsSent.some(function (dmId) {
          return dmId == directMsg.direct_message.id_str
        })

        if (!sentDmFound) {
          console.log('this DM doesnt match our test DMs - still waiting for a matching one.')
          console.log('dmIdsSent', dmIdsSent)
          return
        }

        receiverStream.stop()
        return done()
      })

      var lastTimeSent = 0
      var msToWait = 0
      var postDmInterval = null

      receiverStream.on('connected', function () {
        var dmParams = makeDmParams()

        console.log('sending a new DM:', dmParams.text)
        twitSender.post('direct_messages/new', dmParams, function (err, reply) {
          assert(!err, err)
          assert(reply)
          restTest.checkDm(reply)
          assert(reply.id_str)
          // we will check this dm against the reply recieved in the message event
          dmIdsSent.push(reply.id_str)

          console.log('successfully posted DM:', reply.text, reply.id_str)
          if (dmIdsReceived.indexOf(reply.id_str) !== -1) {
            // our response to the DM posting lost the race against the direct_message
            // listener (we already got the event). So we can finish the test.
            done()
          }
        })
      })

      after(function (done) {
        console.log('cleaning up DMs:', dmIdsSent)
        // delete the DMs we posted
        var deleteDms = dmIdsSent.map(function (dmId) {
          return function (next) {
            assert.equal(typeof dmId, 'string')
            console.log('\ndeleting DM', dmId)
            var params = { id: dmId, twit_options: { retry: true } }
            twitSender.post('direct_messages/destroy', params, function (err, reply) {
              assert(!err, err)
              restTest.checkDm(reply)
              assert.equal(reply.id, dmId)
              return next()
            })
          }
        })
        async.parallel(deleteDms, done)
      })
    })
  })


  describe('Direct Messages work', function() {


    it('should emit an error event to the bot object when ' +
       'update is badly formatted', function(done) {

      telegramBot.once('error', function(err) {
        err.message.should.equal(`Error in __formatUpdate "Cannot read property 'from' of undefined". Please report this.`);
        done();
      })

      const options = _.cloneDeep(requestOptions);
      options.body = baseUpdateData;

      request(options);
    })

    it('should emit an update event to the bot object when ' +
       'update is well formatted', function(done) {

      telegramBot.once('update', function(update) {
        done();
      })

      const updateData = _.cloneDeep(baseUpdateData);
      updateData.message = incommingTextMessage;

      const options = _.cloneDeep(requestOptions);
      options.body = updateData;

      request(options);
    })

    it('should emit a standard error event to the bot object when ' +
       'developer codes error in on("update") block', function(done) {

      telegramBot.once('update', function(update) {
        telegramBot.blob(); // this is not an actual funcion => error expected
      })

      telegramBot.once('error', function(err) {
        err.message.should.equal(`Uncaught error: "telegramBot.blob is not a function". This is most probably on your end.`);
        done();
      })

      const updateData = _.cloneDeep(baseUpdateData);
      updateData.message = incommingTextMessage;

      const options = _.cloneDeep(requestOptions);
      options.body = updateData;

      request(options);
    })

  })

  describe('#__formatUpdate(rawUpdate)', function() {
    it('should format a text message update in the expected way', function() {
      const rawUpdate = _.cloneDeep(baseUpdateData);
      rawUpdate.message = incommingTextMessage;

      return telegramBot.__formatUpdate(rawUpdate)
      .then(function(update) {
        const expectedUpdate = {
          'raw': rawUpdate,
          'sender': {
            'id': rawUpdate.message.from.id
          },
          'recipient': {
            'id': TOKEN
          },
          'timestamp': rawUpdate.message.date * 1000,
          'message': {
            'mid': rawUpdate.update_id,
            'seq': rawUpdate.message.message_id,
            'text': rawUpdate.message.text
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

  // TODO: probably better off doing the messenger one tests before so I know
  // what the function looks like already and what to convert it to
  describe('#sendMessage(message)', function() {
    it('should succeed in sending a standard text message', function() {
      this.skip();
    })
  })
});