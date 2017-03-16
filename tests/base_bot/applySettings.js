import test from 'ava';

import MockBot from '../_mock_bot';

const errorTestTitleBase = 'should throw an error when controller is called';
const successTestTitleBase = 'should not throw an error when controller is called';

test(`${errorTestTitleBase} with a string`, (t) => {
  t.plan(1);

  const botSettings = 'invalid';

  try {
    const bot = new MockBot(botSettings);
  } catch (err) {
    t.is(err.message.indexOf('settings must be object') > -1, true);
  }
});

test(`${errorTestTitleBase} with no credentials, although class requires some`, (t) => {
  t.plan(1);

  const botSettings = {
    requiredCredentials: ['token', 'password'],
  };

  try {
    const bot = new MockBot(botSettings);
  } catch (err) {
    t.is(err.message.indexOf('no credentials specified') > -1, true);
  }
});

test(`${errorTestTitleBase} with misnamed credentials`, (t) => {
  t.plan(1);

  const botSettings = {
    requiredCredentials: ['token', 'password'],
    credentials: {
      token: 'something',
      pass: 'something else',
    },
  };

  try {
    const bot = new MockBot(botSettings);
  } catch (err) {
    console.log(err.message);
    t.is(err.message.indexOf('are expected to have \'password\' credentials') > -1, true);
  }
});

test(`${successTestTitleBase} with correctly named credentials`, (t) => {
  t.plan(1);

  const botSettings = {
    requiredCredentials: ['token', 'password'],
    credentials: {
      token: 'something',
      password: 'something else',
    },
  };
  const bot = new MockBot(botSettings);
  t.pass();
});

test(`${errorTestTitleBase} with no webhookEndpoint although it requires one`, (t) => {
  t.plan(1);

  const botSettings = {
    requiresWebhook: true,
  };

  try {
    const bot = new MockBot(botSettings);
  } catch (err) {
    t.is(err.message.indexOf('must be defined with webhookEndpoint') > -1, true);
  }
});

test(`${successTestTitleBase} with webhookEndpoint and it needs one`, (t) => {
  t.plan(1);

  const botSettings = {
    requiresWebhook: true,
    webhookEndpoint: 'webhook',
  };

  const bot = new MockBot(botSettings);
  t.pass();
});

test(`${errorTestTitleBase} with a webhookEndpoint although it does not requires one`, (t) => {
  t.plan(1);

  const botSettings = {
    webhookEndpoint: 'webhook',
  };

  try {
    const bot = new MockBot(botSettings);
  } catch (err) {
    t.is(err.message.indexOf('do not require webhookEndpoint in') > -1, true);
  }
});
