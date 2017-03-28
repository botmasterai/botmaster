import test from 'ava';
import http from 'http';
import express from 'express';
import request from 'request-promise';

import Botmaster from '../../lib';
import MockBot from '../_mock_bot';

test('works with a bot that doesn\'t require webhhooks', (t) => {
  t.plan(2);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();

    botmaster.on('listening', () => {
      const bot = new MockBot();

      botmaster.addBot(bot);
      botmaster.removeBot(bot);
      t.is(Object.keys(botmaster.__serverRequestListeners).length, 0);
      t.is(botmaster.bots.length, 0);
      botmaster.server.close(resolve);
    });
  });
});

const arbitraryBotMacro = (t, botSettings) => {
  t.plan(3);
  return new Promise((resolve) => {
    const botmaster = new Botmaster();

    botmaster.on('listening', () => {
      const bot = new MockBot(botSettings);

      botmaster.addBot(bot);
      botmaster.removeBot(bot);
      t.is(Object.keys(botmaster.__serverRequestListeners).length, 0);
      t.is(botmaster.bots.length, 0);

      const updateToSend = { text: 'Hello world' };
      const requestOptions = {
        method: 'POST',
        uri: `http://localhost:3000/mock/${botSettings.webhookEndpoint}`,
        json: updateToSend,
      };

      request(requestOptions)

      .catch((err) => {
        t.is(err.error.message,
          `Couldn't POST /mock/${botSettings.webhookEndpoint}`);
        botmaster.server.close(resolve);
      });
    });
  });
};

test('works with an express bot', arbitraryBotMacro, {
  requiresWebhook: true,
  webhookEndpoint: 'express',
});

test('works with a koa bot', arbitraryBotMacro, {
  requiresWebhook: true,
  webhookEndpoint: 'koa',
});
