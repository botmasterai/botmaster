'use strict';

const assert = require('chai').assert;
const expect = require('chai').expect;
require('chai').should();
const _ = require('lodash');
const TwitterBot = require('../../lib').botTypes.TwitterBot;
const Twit = require('twit');
const config = require('../config.js');
const twitterIncomingDms = require('./twitter_incoming_dms');

const botCredentials = config.twitterCredentials1;
const senderCredentials = config.twitterCredentials2;

describe('Twitter Bot tests', function() {
  const settings = {
    credentials: botCredentials
  };

  describe('#constructor()', function() {
    it('should throw an error when authToken credential is missing', function(done) {
      const badSettings = _.cloneDeep(settings);
      badSettings.credentials.consumerKey = undefined;
      expect(() => new TwitterBot(badSettings)).to.throw(
        'ERROR: bots of type \'twitter\' are expected to have \'consumerKey\' credentials');
      done();
    });
  });


  describe('receiving updates', function () {

    const processVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
    if (processVersion < 6) {
      // only run tests if version is below 6 (so that travis runs this test on only one version)
      return;
    }
    this.retries(2);
    // TwitterBot is linked to an account that can
    // receive updates from anyone.
    // In this instance, "anyone" is the sender.
    let twitSender;
    let bot;
    before(function () {
      twitSender = new Twit(senderCredentials);
      bot = new TwitterBot(settings);
    });

    it('should emit an update event to the bot object when ' +
       'receiving a text update', function (done) {
      this.timeout(6000);
      let sentDmId;
      let receivedDmIds = [];

      // this can actually happen multiple times if the stream
      // ever has to reconnect because the connection is lost somehow
      bot.userStream.on('connected', function() {
        // this is the text message that twitSender sends to our bot
        const textMessageToSend = {
          user_id: bot.idStr,
          text: 'Tweetity tweet tweet',
          twit_options: {
            retry: true
          }
        };

        twitSender.post('direct_messages/new', textMessageToSend, function (err, reply) {
          assert(!err, err);
          assert(reply.id_str);
          // we will check this dm against the reply received in the message event
          sentDmId = reply.id_str;

          console.log('successfully posted DM:', reply.text, reply.id_str);
          // Lost the race to 'update' listener which was able to push
          // the DmId into receivedDmIds. Finish test now as a consequence.
          if (receivedDmIds.indexOf(sentDmId) !== -1) {
            done();
          }
        });
      });

      bot.once('update', function (update) {
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
            'text': 'Tweetity tweet tweet'
          }
        };
        expect(update).to.deep.equal(expectedUpdate);

        done();
      });

      after(function (done) {
        console.log('removing DM:', sentDmId);

        const params = { id: sentDmId, twit_options: { retry: true } };
        twitSender.post('direct_messages/destroy', params, function (err, reply) {
          assert(!err, err);
          assert.equal(reply.id, sentDmId);
          done();
        });
      });
    });
  });

  describe('twitter #__formatUpdate(rawUpdate)', function () {

    let bot;
    before(function () {
      bot = new TwitterBot(settings);
    });

    it('should format a twitter text only message in the expected way', function() {
      const rawUpdate = twitterIncomingDms.textOnly;
      const expectedUpdate = {
        raw: rawUpdate,
        sender: {
          id: rawUpdate.direct_message.sender_id_str
        },
        recipient: {
          id: rawUpdate.direct_message.recipient_id_str
        },
        timestamp: (new Date(rawUpdate.direct_message.created_at)).getTime(),
        message: {
          mid: rawUpdate.direct_message.id_str,
          seq: null,
          text: "Party & Bullshit"
        }
      };

      const formattedUpdate = bot.__formatUpdate(rawUpdate);

      expect(formattedUpdate).to.deep.equal(expectedUpdate);
    });

    it('should format a twitter photo message update in the expected way', function() {
      const rawUpdate = twitterIncomingDms.imageOnly;
      const expectedUpdate = {
        raw: rawUpdate,
        sender: {
          id: rawUpdate.direct_message.sender_id_str
        },
        recipient: {
          id: rawUpdate.direct_message.recipient_id_str
        },
        timestamp: (new Date(rawUpdate.direct_message.created_at)).getTime(),
        message: {
          mid: rawUpdate.direct_message.id_str,
          seq: null,
          attachments: [
            {
              type: 'image',
              payload: {
                url: rawUpdate.direct_message.entities.media[0].media_url_https
              }
            }
          ]
        }
      };

      const formattedUpdate = bot.__formatUpdate(rawUpdate);

      expect(formattedUpdate).to.deep.equal(expectedUpdate);
    });

    it('should format a twitter photo with text message update in the expected way', function() {
      const rawUpdate = twitterIncomingDms.imageWithText;
      const expectedUpdate = {
        raw: rawUpdate,
        sender: {
          id: rawUpdate.direct_message.sender_id_str
        },
        recipient: {
          id: rawUpdate.direct_message.recipient_id_str
        },
        timestamp: (new Date(rawUpdate.direct_message.created_at)).getTime(),
        message: {
          mid: rawUpdate.direct_message.id_str,
          seq: null,
          text: "Party & Bullshit",
          attachments: [
            {
              type: 'image',
              payload: {
                url: rawUpdate.direct_message.entities.media[0].media_url_https
              }
            }
          ]
        }
      };

      const formattedUpdate = bot.__formatUpdate(rawUpdate);

      expect(formattedUpdate).to.deep.equal(expectedUpdate);
    });

    it('should format a twitter video message update in the expected way', function() {
      const rawUpdate = twitterIncomingDms.videoOnly;
      const expectedUpdate = {
        raw: rawUpdate,
        sender: {
          id: rawUpdate.direct_message.sender_id_str
        },
        recipient: {
          id: rawUpdate.direct_message.recipient_id_str
        },
        timestamp: (new Date(rawUpdate.direct_message.created_at)).getTime(),
        message: {
          mid: rawUpdate.direct_message.id_str,
          seq: null,
          attachments: [
            {
              type: 'video',
              payload: {
                url: rawUpdate.direct_message.entities.media[0].video_info.variants[4].url
              }
            }
          ]
        }
      };

      const formattedUpdate = bot.__formatUpdate(rawUpdate);

      expect(formattedUpdate).to.deep.equal(expectedUpdate);
    });

    it('should format a twitter update with video, image and text in the expected way', function() {
      const rawUpdate = twitterIncomingDms.videoWithImageWithText;
      const expectedUpdate = {
        raw: rawUpdate,
        sender: {
          id: rawUpdate.direct_message.sender_id_str
        },
        recipient: {
          id: rawUpdate.direct_message.recipient_id_str
        },
        timestamp: (new Date(rawUpdate.direct_message.created_at)).getTime(),
        message: {
          mid: rawUpdate.direct_message.id_str,
          seq: null,
          text: "Party & Bullshit",
          attachments: [
            {
              type: 'video',
              payload: {
                url: rawUpdate.direct_message.entities.media[0].video_info.variants[4].url
              }
            },
            {
              type: 'image',
              payload: {
                url: rawUpdate.direct_message.entities.media[1].media_url_https
              }
            }
          ]
        }
      };

      const formattedUpdate = bot.__formatUpdate(rawUpdate);

      expect(formattedUpdate).to.deep.equal(expectedUpdate);
    });

    it('should format a twitter gif message update in the expected way', function() {
      const rawUpdate = twitterIncomingDms.gifOnly;
      const expectedUpdate = {
        raw: rawUpdate,
        sender: {
          id: rawUpdate.direct_message.sender_id_str
        },
        recipient: {
          id: rawUpdate.direct_message.recipient_id_str
        },
        timestamp: (new Date(rawUpdate.direct_message.created_at)).getTime(),
        message: {
          mid: rawUpdate.direct_message.id_str,
          seq: null,
          attachments: [
            {
              type: 'video',
              payload: {
                url: rawUpdate.direct_message.entities.media[0].video_info.variants[0].url
              }
            }
          ]
        }
      };

      const formattedUpdate = bot.__formatUpdate(rawUpdate);

      expect(formattedUpdate).to.deep.equal(expectedUpdate);
    });
  });
});
