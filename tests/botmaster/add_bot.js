import test from 'ava';
import http from 'http';
import express from 'express';
import _ from 'lodash';
import request from 'request-promise';

import Botmaster from '../../lib';
import MockBot from '../_mock_bot';

const testTitleBase = 'Botmaster #addBot';

test(`${testTitleBase} works with a bot that doesn't require webhhooks`, (t) => {
  t.plan(3);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();

    botmaster.on('server running', () => {
      const bot = new MockBot();

      botmaster.addBot(bot);
      t.is(Object.keys(botmaster.__serverRequestListeners).length, 0);
      t.is(botmaster.bots.length, 1);
      t.is(botmaster.bots[0], bot);
      botmaster.server.close(resolve);
    });
  });
});

const arbitraryBotMacro = (t, botSettings) => {
  t.plan(3);
  return new Promise((resolve) => {
    const botmaster = new Botmaster();

    botmaster.on('server running', () => {
      const bot = new MockBot(botSettings);

      botmaster.addBot(bot);
      t.is(Object.keys(botmaster.__serverRequestListeners).length, 1);
      t.is(botmaster.bots.length, 1);

      const updateToSend = { text: 'Hello world' };
      const requestOptions = {
        method: 'POST',
        uri: `http://localhost:3000/mock/${botSettings.webhookEndpoint}`,
        json: updateToSend,
      };

      request(requestOptions);

      botmaster.on('update', (onUpdateBot, update) => {
        t.deepEqual(update.raw, updateToSend);
        botmaster.server.close(resolve);
      });
    });
  });
};

test(`${testTitleBase} works with an express bot`, arbitraryBotMacro, {
  requiresWebhook: true,
  webhookEndpoint: 'express',
});

test(`${testTitleBase} works with a koa bot`, arbitraryBotMacro, {
  requiresWebhook: true,
  webhookEndpoint: 'koa',
});

test(`${testTitleBase} works with an express server AND both an express and a koa bot`, (t) => {
  t.plan(3);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();

    botmaster.on('server running', () => {
      const bot = new MockBot();

      botmaster.addBot(bot);
      t.is(Object.keys(botmaster.__serverRequestListeners).length, 0);
      t.is(botmaster.bots.length, 1);
      t.is(botmaster.bots[0], bot);
      botmaster.server.close(() => {
        resolve();
      });
    });
  });
});
