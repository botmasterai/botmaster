import test from 'ava';
import http from 'http';
import express from 'express';
import Koa from 'koa';
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

test('shouldn\'t throw any error if settings aren\'t specified', (t) => {
  t.plan(2);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();

    botmaster.on('listening', () => {
      t.is(botmaster.server.address().port, 3000);
      botmaster.server.close(() => {
        t.pass();
        resolve();
      });
    });
  });
});

test('should throw any error if settings.botsSetting are specified', (t) => {
  t.plan(1);

  const settings = {
    botsSettings: 'something',
  };
  try {
    const botmaster = new Botmaster(settings);
  } catch (e) {
    t.is(e.message.indexOf(
      'Starting botmaster with botsSettings is no longer supported') > -1,
      true, e.message);
  }
});

test('should throw any error if settings.app are specified', (t) => {
  t.plan(1);

  const settings = {
    app: 'something',
  };
  try {
    const botmaster = new Botmaster(settings);
  } catch (e) {
    t.is(e.message.indexOf(
      'Starting botmaster with app is no longer') > -1, true,
      e.message);
  }
});

test('should use my server when passed in settings', (t) => {
  t.plan(2);
  const myServer = http.createServer();

  const settings = {
    server: myServer,
  };
  const botmaster = new Botmaster(settings);
  t.is(botmaster.server === myServer, true);
  t.is(botmaster.server, myServer);
});

test('should correctly set port when passed in settings', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    const settings = {
      port: 5000,
    };
    const botmaster = new Botmaster(settings);

    botmaster.on('listening', () => {
      t.is(botmaster.server.address().port, 5000);
      botmaster.server.close(resolve);
    });
  });
});

test('should throw and error when server and port passed in settings', (t) => {
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

test('should throw and error when settings is an object and neither port nor server is passed', (t) => {
  t.plan(1);

  try {
    const botmaster = new Botmaster({});
  } catch (e) {
    t.is(e.message.indexOf('If passing through settings,') > -1, true, 'Error message not same as expected');
  }
});

test('when used with default botmaster server,' +
     'requestListener should return 404s to unfound routes', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();

    botmaster.on('listening', () => {
      const options = {
        uri: 'http://localhost:3000/someRoute',
        json: true,
      };
      request.get(options)

      .catch((err) => {
        t.is(err.error.message, 'Couldn\'t GET /someRoute');
        botmaster.server.close(resolve);
      });
    });
  });
});

test('when used with a server created with an express app' +
     'requestListener should route non botmaster requests to express app', (t) => {
  t.plan(2);
  const app = express();
  const appResponse = {
    text: 'wadup?',
  };

  app.use('/someRoute', (req, res) => {
    res.json(appResponse);
  });

  return new Promise((resolve) => {
    const myServer = app.listen(3000);
    const botmaster = new Botmaster({ server: myServer });

    myServer.on('listening', () => {
      const options = {
        uri: 'http://localhost:3000/someRoute',
        json: true,
      };
      request.get(options)

      .then((body) => {
        t.deepEqual(appResponse, body);
        t.is(botmaster.server, myServer);
        botmaster.server.close(resolve);
      });
    });
  });
});

test('when used with a server created with a koa app' +
     'requestListener should route non botmaster requests to koa app', (t) => {
  t.plan(2);
  const app = new Koa();
  const appResponse = {
    text: 'wadup?',
  };

  app.use((ctx) => {
    if (ctx.request.url === '/someRoute') {
      ctx.body = appResponse;
    }
  });

  return new Promise((resolve) => {
    const myServer = app.listen(3000);
    const botmaster = new Botmaster({ server: myServer });

    myServer.on('listening', () => {
      const options = {
        uri: 'http://localhost:3000/someRoute',
        json: true,
      };
      request.get(options)

      .then((body) => {
        t.deepEqual(body, appResponse);
        t.is(botmaster.server, myServer);
        botmaster.server.close(() => {
          resolve();
        });
      });
    });
  });
});
