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
    // botmaster = new  Botmaster(botmasterSettings);
    server = app.listen(3000, function() { done(); });
  })

  describe('sending messages', function() {

    for (const bot of botmaster.bots) {
      if (bot.type !== 'messenger') continue; // for now

      describe(`to the ${bot.type} platform`, function() {

        specify('using #sendMessage', function(done) {
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

        specify('using #sendMessageTo', function(done) {
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

        specify('using #sendTextMessageTo', function(done) {
          bot.sendTextMessageTo('Party & bullshit', config.messengerUserId)

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
          if (bot.type === 'telegram') {
            update.sender.id = config.telegramUserId
          } else if (bot.type === 'messenger') {
            update.sender.id = config.messengerUserId;
          } else if (bot.type === 'twitter') {
            update.sender.id = config.twitterUserId;
          }

          bot.reply(update, 'replying to update')

          .then(function(body) {
            expect(body.message_id).to.not.equal(undefined);
            expect(body.recipient_id).to.not.equal(undefined);
            done();
          });
        })

        specify('using #sendDefaultButtonMessageTo', function(done) {
          const buttons = ['option One', 'Option Two', 'Option Three'];

          Promise.all([
            bot.sendDefaultButtonMessageTo(buttons, config.messengerUserId),
            bot.sendDefaultButtonMessageTo(buttons, config.messengerUserId, 'Don\'t select any of:')
          ])
          .then(function(bodies) {
            expect(bodies[0].message_id).to.not.equal(undefined);
            expect(bodies[0].recipient_id).to.not.equal(undefined);
            expect(bodies[1].message_id).to.not.equal(undefined);
            expect(bodies[1].recipient_id).to.not.equal(undefined);
            done()
          });
        })


      })

    }
  });

  after(function(done) {
    server.close(function() { done(); });
  })

});