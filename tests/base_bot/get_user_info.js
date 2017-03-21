import test from 'ava';
import http from 'http';
import express from 'express';
import request from 'request-promise';

import Botmaster from '../../lib';
import MockBot from '../_mock_bot';

test('throws error when bot type does not support retrieving user is', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    const bot = new MockBot();

    try {
      bot.getUserInfo('user_id');
    } catch (err) {
      t.is(err.message, 'Bots of type mock don\'t provide access to user info.',
           'Error message is not same as expected');
      resolve();
    }
  });
});

test('works when bot type supports retrieving the info', (t) => {
  t.plan(2);

  return new Promise(async (resolve) => {
    const bot = new MockBot({
      retrievableUserInfo: true,
    });

    const userInfo = await bot.getUserInfo('user_id');
    t.is(userInfo.first_name, 'Peter', 'userInfo is not same as expected');

    bot.getUserInfo('user_id', (err, userInfo2) => {
      t.is(userInfo2.last_name, 'Chang', 'userInfo is not same as expected');
      resolve();
    });
  });
});
