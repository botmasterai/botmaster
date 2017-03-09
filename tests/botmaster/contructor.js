import test from 'ava';
import http from 'http';
import express from 'express';
import koa from 'koa';
import _ from 'lodash';
import request from 'request-promise';

import Botmaster from '../../lib';

// just this code to make sure unhandled exceptions are printed to
// the console when developing.
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION', err.stack);
});

// const request = require('request-promise');
// const JsonFileStore = require('jfs');

const testTitleBase = 'Botmaster constructor';

test(`${testTitleBase} shouldn't throw any error if settings aren't specified`, (t) => {
  t.plan(2);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();

    botmaster.on('server running', () => {
      t.is(botmaster.server.address().port, 3000);
      botmaster.server.close(() => {
        t.pass();
        resolve();
      });
    });
  });
});

test(`${testTitleBase} should throw any error if settings.botsSetting are specified`, (t) => {
  t.plan(1);

  const settings = {
    botsSettings: 'something',
  };
  try {
    const botmaster = new Botmaster(settings);
  } catch (e) {
    t.is(e.message.indexOf('TwoPointXError') > -1, true);
  }
});

test(`${testTitleBase} should throw any error if settings.app are specified`, (t) => {
  t.plan(1);

  const settings = {
    app: 'something',
  };
  try {
    const botmaster = new Botmaster(settings);
  } catch (e) {
    t.is(e.message.indexOf('TwoPointXError') > -1, true);
  }
});

test(`${testTitleBase} should use my server when passed in settings`, (t) => {
  t.plan(2);
  const myServer = http.createServer();

  const settings = {
    server: myServer,
  };
  const botmaster = new Botmaster(settings);
  t.is(botmaster.server === myServer, true);
  t.is(botmaster.server, myServer);
});

test(`${testTitleBase} should correctly set port when passed in settings`, (t) => {
  t.plan(2);

  return new Promise((resolve) => {
    const settings = {
      port: 5000,
    };
    const botmaster = new Botmaster(settings);

    botmaster.on('server running', () => {
      t.is(botmaster.server.address().port, 5000);
      botmaster.server.close(() => {
        t.pass();
        resolve();
      });
    });
  });
});

test(`${testTitleBase} should throw and error when server and port passed in settings`, (t) => {
  t.plan(1);

  const myServer = http.createServer();

  try {
    const settings = {
      server: myServer,
      port: 4000,
    };
    const botmaster = new Botmaster(settings);
  } catch (e) {
    t.is(e.message.indexOf('IncompatibleArgumentsError') > -1, true);
  }
});


// describe('Botmaster', function() {
//   const mockBotSettings = {

//   };

//   const KoaBotSettings = {

//   };

//   describe('#constructor', function() {
//     // let server = null;
//     // let app = null;
//     // beforeEach(function(done) {
//     //   app = express();
//     //   server = app.listen(3100, function() { done(); });
//     // });



//     it('should otherwise properly create and setup the bot objects when no ' +
//        'optional parameters is specified', function(done) {
//       const settings = { botsSettings: baseBotsSettings };
//       const botmaster = new  Botmaster(settings);

//       expect(botmaster.bots.length).to.equal(5);

//       botmaster.once('server running', function(serverMessage) {
//         expect(serverMessage).to.equal(
//           'App parameter not specified. Running new App on port: 3000');

//         for (const bot of botmaster.bots) {
//           if (bot.requiresWebhook) {
//             expect(bot.app).to.not.equal(undefined);
//           }
//         }

//         botmaster.server.close(function() { done(); });
//       });
//     });

//     it('should otherwise properly create and setup the bot objects when ' +
//        'port parameter is specified', function(done) {
//       const settings = {
//         botsSettings: baseBotsSettings,
//         port: 3101
//       };
//       const botmaster = new  Botmaster(settings);

//       botmaster.once('server running', function(serverMessage) {
//         expect(serverMessage).to.equal(
//           'App parameter not specified. Running new App on port: 3101');

//         botmaster.server.close(function() { done(); });
//       });
//     });

//     it('should otherwise properly create and setup the bot objects when ' +
//        'app parameter is specified and socketio is not used', function() {

//       let botsSettings = _.cloneDeep(baseBotsSettings);
//       botsSettings = botsSettings.slice(0, 4);
//       const settings = {
//         botsSettings,
//         app,
//       };
//       const botmaster = new  Botmaster(settings);

//       expect(botmaster.bots.length).to.equal(4);
//     });

//     it('should work when using botmaster with socketio and both app ' +
//        'and server parameter are defined in botmaster settings', function() {

//       const settings = {
//         app,
//         server,
//         botsSettings: baseBotsSettings,
//       };

//       const botmaster = new  Botmaster(settings);

//       expect(botmaster.bots.length).to.equal(5);
//     });

//     it('should work when using botmaster with socketio ' +
//        'and server parameter is defined in socketio settings', function() {

//       const socketioSettingsWithServer = _.cloneDeep(socketioSettings);
//       socketioSettingsWithServer.server = server;
//       const botsSettings = _.cloneDeep(baseBotsSettings);
//       botsSettings[4].socketio = socketioSettingsWithServer;

//       const settings = {
//         botsSettings,
//         app,
//       };
//       const botmaster = new  Botmaster(settings);

//       expect(botmaster.bots.length).to.equal(5);
//     });

//     it('should throw an error if a server parameter is specified ' +
//        'without a corresponding app parameter', function() {

//       const settings = {
//         botsSettings: baseBotsSettings,
//         server,
//       };

//       expect(() => new Botmaster(settings)).to.throw();
//     });

//     it('should NOT throw an error if a server parameter is specified ' +
//        'in socketIoSettings without a botmasterSettings app parameter', function(done) {

//       const socketioSettingsWithServer = _.cloneDeep(socketioSettings);
//       socketioSettingsWithServer.server = server;
//       const botsSettings = _.cloneDeep(baseBotsSettings);
//       botsSettings[4].socketio = socketioSettingsWithServer;

//       const settings = {
//         botsSettings,
//       };

//       const botmaster = new Botmaster(settings);

//       botmaster.once('server running', function() {
//         expect(botmaster.server).not.to.equal(server);
//         botmaster.server.close(function() { done(); });
//       });

//     });

//     it('should throw (from socketioBot) if app is in parameters, ' +
//        'server is not, socketio is being used and has no server param', function() {

//       const settings = {
//         botsSettings: baseBotsSettings,
//         app
//       };

//       expect(() => new Botmaster(settings)).to.throw();
//     });

//     afterEach(function(done) {
//       server.close(function() { done(); });
//     });
//   });
// });