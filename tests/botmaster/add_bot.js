import test from 'ava';
import http from 'http';
import express from 'express';
import Koa from 'koa';
import _ from 'lodash';
import request from 'request-promise';
import nock from 'nock';

import Botmaster from '../../lib';
import MockBot from '../_mock_bot';
import config from '../_config';

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
      botmaster.server.close(() => {
        resolve();
      });
    });
  });
});
