'use strict';

// just this code to make sure unhandled exceptions are printed to
// the console when developing.
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION', err.stack);
});

const express = require('express');
const expect = require('chai').expect;
const assert = require('chai').assert;
require('chai').should();
const _ = require('lodash');
const Botmaster = require('../lib');
const MessengerBot = Botmaster.botTypes.MessengerBot;
const config = require('./config.js');
const request = require('request-promise');
const JsonFileStore = require('jfs');
const io = require('socket.io-client');
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
  };

  const slackSettings = {
    credentials: config.slackCredentials,
    webhookEndpoint: '/webhook',
    storeTeamInfoInFile: true
  };

  const socketioSettings = {
    id: "ersfdcredrsfd",
  };

  const baseBotsSettings = [{ telegram: telegramSettings },
                            { messenger: messengerSettings },
                            { twitter: twitterSettings },
                            { slack: slackSettings },
                            { socketio: socketioSettings }];

  describe('#constructor', function() {
    let server = null;
    let app = null;
    beforeEach(function(done) {
      app = express();
      server = app.listen(3100, function() { done(); });
    });

    it('should not throw an error if settings aren\'t specified', function(done) {
      let botmaster;
      expect(() => botmaster = new Botmaster()).to.not.throw();
      botmaster.on('server running', function() {
        botmaster.server.close(function() { done(); });
      });
    });

    it('should not throw an error if settings.botsSettings aren\'t specified', function(done) {
      const settings = {};
      let botmaster;
      expect(() => botmaster = new Botmaster(settings)).to.not.throw();
      botmaster.on('server running', function() {
        botmaster.server.close(function() { done(); });
      });
    });

    it('should throw an error if entry in botsSettings has more than one key', function() {
      const botsSettings = _.cloneDeep(baseBotsSettings);
      botsSettings[0].unrecognized = 'something';
      const settings = {
        botsSettings,
        app
      };
      expect(() => new Botmaster(settings)).to.throw();
    });

    it('should throw an error if botType isn\'t supported yet', function() {
      const botsSettings = _.cloneDeep(baseBotsSettings);
      botsSettings.push({ 'unrecognized': {} });
      const settings = {
        botsSettings,
        app
      };
      expect(() => new Botmaster(settings)).to.throw();
    });

    it('should otherwise properly create and setup the bot objects when no ' +
       'optional parameters is specified', function(done) {
      const settings = { botsSettings: baseBotsSettings };
      const botmaster = new  Botmaster(settings);

      expect(botmaster.bots.length).to.equal(5);

      botmaster.once('server running', function(serverMessage) {
        expect(serverMessage).to.equal(
          'App parameter not specified. Running new App on port: 3000');

        for (const bot of botmaster.bots) {
          if (bot.requiresWebhook) {
            expect(bot.app).to.not.equal(undefined);
          }
        }

        botmaster.server.close(function() { done(); });
      });
    });

    it('should otherwise properly create and setup the bot objects when ' +
       'port parameter is specified', function(done) {
      const settings = {
        botsSettings: baseBotsSettings,
        port: 3101
      };
      const botmaster = new  Botmaster(settings);

      botmaster.once('server running', function(serverMessage) {
        expect(serverMessage).to.equal(
          'App parameter not specified. Running new App on port: 3101');

        botmaster.server.close(function() { done(); });
      });
    });

    it('should otherwise properly create and setup the bot objects when ' +
       'app parameter is specified and socketio is not used', function() {

      let botsSettings = _.cloneDeep(baseBotsSettings);
      botsSettings = botsSettings.slice(0, 4);
      const settings = {
        botsSettings,
        app,
      };
      const botmaster = new  Botmaster(settings);

      expect(botmaster.bots.length).to.equal(4);
    });

    it('should work when using botmaster with socketio and both app ' +
       'and server parameter are defined in botmaster settings', function() {

      const settings = {
        app,
        server,
        botsSettings: baseBotsSettings,
      };

      const botmaster = new  Botmaster(settings);

      expect(botmaster.bots.length).to.equal(5);
    });

    it('should work when using botmaster with socketio ' +
       'and server parameter is defined in socketio settings', function() {

      const socketioSettingsWithServer = _.cloneDeep(socketioSettings);
      socketioSettingsWithServer.server = server;
      const botsSettings = _.cloneDeep(baseBotsSettings);
      botsSettings[4].socketio = socketioSettingsWithServer;

      const settings = {
        botsSettings,
        app,
      };
      const botmaster = new  Botmaster(settings);

      expect(botmaster.bots.length).to.equal(5);
    });

    it('should throw an error if a server parameter is specified ' +
       'without a corresponding app parameter', function() {

      const settings = {
        botsSettings: baseBotsSettings,
        server,
      };

      expect(() => new Botmaster(settings)).to.throw();
    });

    it('should NOT throw an error if a server parameter is specified ' +
       'in socketIoSettings without a botmasterSettings app parameter', function(done) {

      const socketioSettingsWithServer = _.cloneDeep(socketioSettings);
      socketioSettingsWithServer.server = server;
      const botsSettings = _.cloneDeep(baseBotsSettings);
      botsSettings[4].socketio = socketioSettingsWithServer;

      const settings = {
        botsSettings,
      };

      const botmaster = new Botmaster(settings);

      botmaster.once('server running', function() {
        expect(botmaster.server).not.to.equal(server);
        botmaster.server.close(function() { done(); });
      });

    });

    it('should throw (from socketioBot) if app is in parameters, ' +
       'server is not, socketio is being used and has no server param', function() {

      const settings = {
        botsSettings: baseBotsSettings,
        app
      };

      expect(() => new Botmaster(settings)).to.throw();
    });

    afterEach(function(done) {
      server.close(function() { done(); });
    });
  });

  describe('#createBot', function() {
    it('should return a bot with the correct parameters when settings exist', function(done) {
      const settings = { botsSettings: baseBotsSettings };

      const botmaster = new Botmaster(settings);

      botmaster.once('server running', function() {
        const messengerBot = botmaster.createBot(MessengerBot, messengerSettings);
        expect(messengerBot.type).to.equal('messenger');

        botmaster.server.close(function() { done(); });
      });
    });
  });

  describe('#addBot', function() {
    specify('update events should be received by botmaster object for bots ' +
            'that were added', function(done) {
      const botsSettings = _.cloneDeep(baseBotsSettings);
      botsSettings.splice(1,1); // just remove the messengerSettings as I want to add is myself.
      assert.equal(4, botsSettings.length);

      const settings = { botsSettings };

      const botmaster = new Botmaster(settings);

      const messengerBot = new MessengerBot(messengerSettings);

      botmaster.addBot(messengerBot);

      expect(messengerBot.type).to.equal('messenger');

      const userId = '134449875';
      const botId = '123124412';
      const updateData = {
        entry: [{
          messaging: [{
            sender: {
              id: userId
            },
            recipient: {
              id: botId
            },
            timestamp: 1468325836000,
            message: {
              mid: 100,
              seq: 1,
              text: 'Party & Bullshit'
            }
          }]
        }]
      };

      const requestOptions = {
        method: 'POST',
        uri: 'http://localhost:3000/messenger/webhook',
        body: updateData,
        json: true,
        headers: {
            'x-hub-signature': getMessengerSignatureHeader(
            updateData, config.messengerCredentials.fbAppSecret)
        }
      };

      botmaster.once('update', function(bot, update) {
        expect(update).to.not.equal(undefined);
        botmaster.server.close(function() { done(); });
      });

      request(requestOptions);
    });
  });


  describe('#getBot / #getBots', function() {

    let botmaster;
    before(function() {
      const botsSettings = _.cloneDeep(baseBotsSettings);

      const otherMessengerSettings = {
        credentials: config.messengerCredentials,
        webhookEndpoint: '/webhook'
      };

      botsSettings.push({ messenger: otherMessengerSettings} );

      botmaster = new Botmaster({ botsSettings });
    });

    specify('getBot should throw an error when getting called without any options', function() {
      expect(() => botmaster.getBot()).to.throw(
        'ERROR: \'getBot\' needs exactly one of type or id');
    });

    specify('getBot should throw an error when requesting bots using type and id', function() {
      expect(() => botmaster.getBot({type: 'telegram', id: 'not_important'})).to.throw(
        'ERROR: \'getBot\' needs exactly one of type or id');
    });

    specify('getBot should return bot with a certain id when requested using getBot', function() {
      const bot = botmaster.getBot({ id: config.telegramBotId });
      expect(bot.type).to.equal('telegram');
    });

    specify('getBot should return unique bot of a certain type when requested using getBot', function() {
      const bot = botmaster.getBot({ type: 'messenger' });
      expect(bot.type).to.equal('messenger');
    });

    specify('getBots should throw error when used like getBot', function() {
      expect(() => botmaster.getBots({ type: 'messenger'} )).to.throw(
        'ERROR: \'getBots\' takes in a string as only parameter');
    });

    specify('getBots should return bots of a certain type when requested', function() {
      const bots = botmaster.getBots('messenger');
      expect(bots.length).to.equal(2);
      expect(bots[0].type).to.equal('messenger');
      expect(bots[1].type).to.equal('messenger');
    });

    after(function(done) {
      botmaster.server.close(function() { done(); });
    });
  });

  describe('sending messages', function() {
    this.retries(4);
    // botmaster.server stops listening onto port 3200 in the after hook
    // of 'sending message'
    const botmasterSettings = {
      botsSettings: baseBotsSettings,
      port: 3200
    };
    const botmaster = new Botmaster(botmasterSettings);

    for (const bot of botmaster.bots) {
      // if (bot.type !== 'slack') continue; // for now
      let recipientId = null;
      let socket;

      before(function(done) {
        if (bot.type === 'telegram') {
          recipientId = config.telegramUserId;
          done();
        } else if (bot.type === 'messenger') {
          recipientId = config.messengerUserId;
          done();
        } else if (bot.type === 'twitter') {
          recipientId = config.twitterUserId;
          done();
        } else if (bot.type === 'slack') {
          const jsonFileStoreDB = new JsonFileStore('slack_teams_info');
          const teamId = config.slackTeamInfo.team_id;
          const channel = config.slackTestInfo.channel;
          // write teamInfo data to file expected to be read
          jsonFileStoreDB.saveSync(teamId, config.slackTeamInfo);
          // extract recipientId from that data (and the one in config)
          recipientId = `${teamId}.${channel}`;
          done();
        } else if (bot.type === 'socketio') {
          socket = io('ws://localhost:3200');

          socket.on('connect', function() {
            recipientId = socket.id;
            done();
          });
        }
      });

      describe(`to the ${bot.type} platform`, function() {

        specify('using #sendMessage', function(done) {
          const message = {
            recipient: {
              id: recipientId
            },
            message: {
              text: 'Party & bullshit'
            }
          };

          bot.sendMessage(message)

          .then(function(body) {
            expect(body.message_id).to.not.equal(undefined);
            expect(body.recipient_id).to.not.equal(undefined);
            done();
          });
        });

        specify('using #sendMessageTo', function(done) {
          const message = {
            text: 'Party & bullshit'
          };

          bot.sendMessageTo(message, recipientId)

          .then(function(body) {
            expect(body.message_id).to.not.equal(undefined);
            expect(body.recipient_id).to.not.equal(undefined);
            done();
          });
        });

        specify('using #sendTextMessageTo', function(done) {
          // using callback here
          bot.sendTextMessageTo('Party & bullshit', recipientId, function(err, body) {
            expect(body.message_id).to.not.equal(undefined);
            expect(body.recipient_id).to.not.equal(undefined);
            done();
          });
        });

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
        });

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
            done();
          });
        });

        specify('using #sendDefaultButtonMessageTo with bad 3rd argument', function(done) {
          const buttons = ['option One', 'Option Two', 'Option Three', 'Option Four'];

          bot.sendDefaultButtonMessageTo(buttons, recipientId, bot)

          .catch((err) => {
            err.message.should.equal('ERROR: third argument must be a "String", "Object" or absent');
            done();
          });
        });

        specify('using #sendDefaultButtonMessageTo with bad 3rd argument callback', function(done) {
          const buttons = ['option One', 'Option Two', 'Option Three', 'Option Four'];

          bot.sendDefaultButtonMessageTo(buttons, recipientId, bot, function(err) {
            err.message.should.equal('ERROR: third argument must be a "String", "Object" or absent');
            done();
          });
        });

        specify('using #sendDefaultButtonMessageTo with too many buttons', function(done) {
          const tooManyButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

          bot.sendDefaultButtonMessageTo(tooManyButtons, recipientId)

          .catch(function(err) {
            err.message.should.equal('ERROR: buttonTitles must be of length 10 or less');
            done();
          });
        });

        specify('using #sendAttachmentFromURLTo', function() {
          this.timeout(3000);
          const url = 'https://raw.githubusercontent.com/ttezel/twit/master/tests/img/bigbird.jpg';

          return bot.sendAttachmentFromURLTo('image', url, recipientId)

          .then(function(body) {
            expect(body.message_id).to.not.equal(undefined);
            expect(body.recipient_id).to.not.equal(undefined);
          });
        });

        specify('using #sendIsTypingMessageTo', function(done) {

          bot.sendIsTypingMessageTo(recipientId, function(err, body) {
            expect(body.recipient_id).to.equal(recipientId);
            done();
          });
        });
      });

      // after each run of the loop (runs in parallel)
      // so for each bot type, they will run after the tests in context,
      // I.e. the after for slack will be run after all tests for, say, messenger
      // are run ( but in context).
      after(function() {
        if (bot.type === 'slack') {
          const jsonFileStoreDB = new JsonFileStore('slack_teams_info');
          // delete teamInfo data
          jsonFileStoreDB.delete(config.slackTeamInfo.team_id);
        }

        if (bot.type === 'socketio') {
          socket.disconnect();
        }
      });
    }

    // close server after all single after blocks have run
    after(function(done) {
      this.retries(4);
      botmaster.server.close(function() { done(); });
    });
  });

});
