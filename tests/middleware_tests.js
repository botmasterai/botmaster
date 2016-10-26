'use strict';

const expect = require('chai').expect;
const assert = require('chai').assert;
require('chai').should();
const _ = require('lodash');
const Botmaster = require('../lib');
const config = require('./config.js');

describe('Middleware', function() {

  const incomingUdpate = {
    raw: 'some raw object data',
    sender: {
      id: config.telegramUserId // not really important which one is used here
    },
    recipient: {
      id: config.telegramBotId // not really important which one is used here
    },
    timestamp: 1468325836000,
    message: {
      mid: '4666071',
      seq: 1,
      text: 'Party & Bullshit'
    }
  };

  const outgoingMessage = {
    recipient: {
      id: 'invalidId'
    },
    message: {
      text: 'Party & bullshit'
    }
  };

  let botmaster = null;
  beforeEach(function(done) {
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
      storeTeamInfoInFile: true,
    };

    const botsSettings = [{ telegram: telegramSettings },
                          { messenger: messengerSettings },
                          { twitter: twitterSettings },
                          { slack: slackSettings }];

    const botmasterSettings = {
      botsSettings,
    };
    botmaster = new Botmaster(botmasterSettings);

    botmaster.on('server running', () => { done(); });
  });

  describe('Incoming middleware', function() {
    it('should throw an error if the first argument is not a valid string', function() {
      expect(() => botmaster.use('typo', function(bot, update, next) {
        next();
      })).to.throw('ERROR: invalid middleware type. Type should be either \'incoming\' or \'outgoing\'');

      expect(() => botmaster.use(function(bot, update, next) {
        next();
      })).to.throw('ERROR: invalid middleware type. Type should be either \'incoming\' or \'outgoing\'');
    });

    it('should throw an error if the second argument exists and it isn\'t an object', function() {
      expect(() => botmaster.use('incoming', 'some string', function(bot, update, next) {
        next();
      })).to.throw('ERROR: invalid options. Options should be passed as an object');
    });

    it('should throw an error if it is passed more than 3 arguments', function() {
      expect(() => botmaster.use('incoming', {}, 'too much', function(bot, update, next) {
        next();
      })).to.throw('ERROR: too many arguments. 2-3 expected');
    });

    it('should throw an error if the last argument is not a function', function() {
      expect(() => botmaster.use('incoming', {})).
             to.throw('ERROR: invalid callback. Callback should be a function');
    });

    specify('Botmaster should call a middleware function that was setup', function(done) {
      // incomming middleware
      botmaster.use('incoming', function(bot, update, next) {
        update.session = 'disASession';
        return next();
      });

      botmaster.once('update', function(bot, update){
        expect(update.session).to.equal('disASession');
        done();
      });

      const bot = botmaster.getBots('telegram')[0];

      // middleware is called right before being actually emitted, =>
      // in __emitUpdate;
      const incomingUdpateCopy = _.cloneDeep(incomingUdpate);
      bot.__emitUpdate( incomingUdpateCopy);

    });

    specify('Botmaster should call the middleware function before emitting the update', function(done) {
      let touched = false;
      botmaster.use('incoming', function(bot, update, next) {
        touched = true;
        return next();
      });

      botmaster.once('update', function(){
        expect(touched).to.equal(true);
        done();
      });

      const bot = botmaster.getBots('telegram')[0];

      bot.__emitUpdate(incomingUdpate);
    });

    specify('Botmaster should call the middleware functions in order of declaration', function(done) {
      let callOrder = [];
      botmaster.use('incoming', function(bot, update, next) {
        update.session = 'disASession';
        callOrder.push('first');
        return next();
      });

      botmaster.use('incoming', function(bot, update, next) {
        update.session.should.equal('disASession');
        callOrder.push('second');
        return next();
      });

      botmaster.once('update', function(){
        expect(callOrder[0]).to.equal('first');
        expect(callOrder[1]).to.equal('second');
        done();
      });

      const bot = botmaster.getBots('telegram')[0];

      const incomingUdpateCopy = _.cloneDeep(incomingUdpate);
      bot.__emitUpdate(incomingUdpateCopy);
    });

    specify('Botmaster should call the middleware functions on a specific bot type only if specified', function(done) {
      botmaster.use('incoming', { type: 'messenger' }, function(bot, update, next) {
        expect(bot.type).to.equal('messenger');
        done();
      });

      const bots = botmaster.bots;

      for (const bot of bots) {
        bot.__emitUpdate(incomingUdpate);
      }
    });

    specify('Error in incoming middleware is emitted on incoming message', function(done) {
      // outgoing middleware
      botmaster.use('incoming', function(bot, message, next) {
        message.blob(); // doesn't exist, should throw
        return next();
      });

      botmaster.once('error', function(bot, err) {
        expect(err.message).to.equal('"message.blob is not a function". In incoming middleware');
        done();
      });

      const bot = botmaster.getBots('messenger')[0];

      bot.__emitUpdate(incomingUdpate);
    });

    specify('Botmaster should call the middleware functions on multiple specific bot types only if specified', function(done) {
      let visitedCount = 0;
      botmaster.use('incoming', { type: ['messenger', 'telegram'] }, function(bot, update, next) {
        assert(bot.type === 'messenger' || bot.type === 'telegram');
        ++visitedCount;
        if (visitedCount === 1) {
          return next();
        }
        done();
      });

      const bots = botmaster.bots;

      for (const bot of bots) {
        bot.__emitUpdate(incomingUdpate);
      }
    });

    specify('Botmaster should not call outgoing middleware', function(done) {
      botmaster.use('outgoing', function(bot, update, next) {
        // something wrong as this should not happen
        assert(1 === 2);
        next();
      });

      const bot = botmaster.bots[0];

      botmaster.once('update', function() {
        // if here, it means it didn't go into hook. => all good
        done();
      });

      bot.__emitUpdate(incomingUdpate);
    });
  });

  describe('Outgoing Middleware', function() {
    this.retries(4);

    specify('Botmaster should call a middleware function that was setup', function(done) {
      // outgoing middleware
      botmaster.use('outgoing', function(bot, message, next) {
        message.recipient.id = config.messengerUserId;
        return next();
      });

      botmaster.once('update', function(bot, update){
        expect(update.session).to.equal('disASession');
        done();
      });

      const bot = botmaster.getBots('messenger')[0];

      const outgoingMessageCopy = _.cloneDeep(outgoingMessage);
      bot.sendMessage(outgoingMessageCopy)

      .then(function(body) {
        expect(body).to.not.equal(undefined);
        done();
      });
    });

    specify('Error in outgoing middleware is thrown on sendMessage', function(done) {
      // outgoing middleware
      botmaster.use('outgoing', function(bot, message, next) {
        message.blob(); // doesn't exist, should throw
        return next();
      });

      const bot = botmaster.getBots('messenger')[0];

      const outgoingMessageCopy = _.cloneDeep(outgoingMessage);
      bot.sendMessage(outgoingMessageCopy)

      // catch error with promise
      .catch(function(err) {
        expect(err.message).to.equal('"message.blob is not a function". In outgoing middleware');
        // get error in callback
        bot.sendMessage(outgoingMessage, function(err) {
          expect(err.message).to.equal('"message.blob is not a function". In outgoing middleware');
          done();
        });
      });
    });

    specify('Botmaster should not call incoming middleware', function(done) {
      botmaster.use('incoming', function(bot, update, next) {
        // something wrong as this should not happen
        update.recipient.id = config.messengerUserId;
        next();
      });

      const bot = botmaster.getBots('messenger')[0];

      const outgoingMessageCopy = _.cloneDeep(outgoingMessage);
      bot.sendMessage(outgoingMessageCopy)

      .catch(function(err) {
        expect(err).to.not.equal(undefined);
        done();
      });
    });

  });

  afterEach(function(done) {
    this.retries(4);
    process.nextTick(function() {
      botmaster.server.close(function() { done(); });
    });
  });

});
