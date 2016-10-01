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

    let bot;
    before(function () {
      bot = new TwitterBot(settings);
    });

    it('should emit an update event to the bot object when ' +
       'receiving a text update', function (done) {

      bot.once('update', function (update) {
       expect(update).not.to.equal(undefined);
       done();
      });

      // bot.userStream is the stream object created by twit and the emit
      // method is how it passes updates to the developer facing part of the
      // framework. => to botmaster
      bot.userStream.emit('direct_message', twitterIncomingDms.textOnly);
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
