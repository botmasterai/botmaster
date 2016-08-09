'use strict'

// just this code to make sure unhandled exceptions are printed to
// the console when developing.
process.on('unhandledRejection', (err, promise) => {
  console.error('UNHANDLED REJECTION', err.stack);
});

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
require('chai').should();
const _ = require('lodash');
const Botmaster = require('../lib');
const config = require('./config.js')
const getMessengerSignatureHeader = require('./tests_utils').getMessengerSignatureHeader;

describe('Botmaster', function() {

  const telegramSettings = {
    credentials: config.telegramCredentials,
    webhookEndpoint: '/webhook'
  };

  const messengerSettings = {
    credentials: config.messengerCredentials,
    webhookEndpoint: '/webhook'
  };

  const twitterSettings = {
    credentials: config.twitterCredentials
  }

  const botsSettings = [{ telegram: telegramSettings },
                        { messenger: messengerSettings },
                        { twitter: twitterSettings }];

  const botmasterSettings = {
    botsSettings,
    app
  }

  let botmaster = new  Botmaster(botmasterSettings);

  let server = null;
  before(function(done) {
    server = app.listen(3000, function() { done(); });
  })

  describe('sending messages', function() {

    for (const bot of botmaster.bots) {
      // if (bot.type !== 'twitter') continue; // for now

      let recipientId = null
      if (bot.type === 'telegram') {
        recipientId = config.telegramUserId
      } else if (bot.type === 'messenger') {
        recipientId = config.messengerUserId;
      } else if (bot.type === 'twitter') {
        recipientId = config.twitterUserId;
      }


      describe(`to the ${bot.type} platform`, function() {

        specify('using #sendMessage', function(done) {
          const message = { 
            recipient: {
              id: recipientId
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

        specify('using #sendMessageTo', function(done) {
          const message = { 
            text: 'Party & bullshit'
          }

          bot.sendMessageTo(message, recipientId)

          .then(function(body) {
            expect(body.message_id).to.not.equal(undefined);
            expect(body.recipient_id).to.not.equal(undefined);
            done();
          })
        })

        specify('using #sendTextMessageTo', function(done) {
          bot.sendTextMessageTo('Party & bullshit', recipientId)

          .then(function(body) {
            expect(body.message_id).to.not.equal(undefined);
            expect(body.recipient_id).to.not.equal(undefined);
            done();
          })
        })

        specify('using #reply', function(done) {

          // that's all that's needed for this test
          const update = {};
          update.sender = {};
          update.sender.id = recipientId;

          bot.reply(update, 'replying to update')

          .then(function(body) {
            expect(body.message_id).to.not.equal(undefined);
            expect(body.recipient_id).to.not.equal(undefined);
            done();
          });
        })

        specify('using #sendDefaultButtonMessageTo with good arguments', function(done) {
          const buttons = ['option One', 'Option Two', 'Option Three', 'Option Four'];

          Promise.all([
            bot.sendDefaultButtonMessageTo(buttons, recipientId),
            bot.sendDefaultButtonMessageTo(buttons, recipientId, 'Don\'t select any of:')
          ])
          .then(function(bodies) {
            expect(bodies[0].message_id).to.not.equal(undefined);
            expect(bodies[0].recipient_id).to.not.equal(undefined);
            expect(bodies[1].message_id).to.not.equal(undefined);
            expect(bodies[1].recipient_id).to.not.equal(undefined);
            done()
          });
        })

        specify('using #sendDefaultButtonMessageTo with bad 3rd arg arguments', function(done) {
          const buttons = ['option One', 'Option Two', 'Option Three', 'Option Four'];

          bot.sendDefaultButtonMessageTo(buttons, recipientId, bot)

          .catch((err) => {
            err.message.should.equal('ERROR: third argument must be a "String", "Object" or absent');
            done()
          })

        })

        specify('using #sendDefaultButtonMessageTo with too many buttons', function(done) {
          const tooManyButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

          bot.sendDefaultButtonMessageTo(tooManyButtons, recipientId)

          .catch((err) => {
            err.message.should.equal('ERROR: buttonTitles must be of length 10 or less');
            done()
          })

        })

        specify('using #sendAttachmentFromURLTo', function() {
          this.timeout(3000);
          const url = 'https://raw.githubusercontent.com/ttezel/twit/master/tests/img/bigbird.jpg';

          return bot.sendAttachmentFromURLTo('image', url, recipientId)

          .then(function(body) {
            expect(body.message_id).to.not.equal(undefined);
            expect(body.recipient_id).to.not.equal(undefined);
          });
        })

        specify('using #sendIsTypingMessageTo', function() {

          return bot.sendIsTypingMessageTo(recipientId)

          .then(function(body) {
            expect(body.recipient_id).to.equal(recipientId);
          });
        })

      })
    }
  });

  after(function(done) {
    server.close(function() { done(); });
  })

});