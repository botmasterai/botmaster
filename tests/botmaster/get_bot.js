import test from 'ava';

import Botmaster from '../../lib';
import MockBot from '../_mock_bot';

const testTitleBase = 'Botmaster #getBot';

let botmaster;
let botOne;
let botTwo;
let botThree;

test.before(() => {
  const botOneOptions = {
    type: 'platformOne',
    id: 'botOne',
  };
  botOne = new MockBot(botOneOptions);

  const botTwoOptions = {
    type: 'platformOne', // same type as botOne (but added after)
    id: 'botTwo',
  };
  botTwo = new MockBot(botTwoOptions);

  const botThreeOptions = {
    type: 'platformThree',
    id: 'botThree',
  };
  botThree = new MockBot(botThreeOptions);

  // just using createServer here so I don't have to close it after.
  // i.e. no need for before and after hooks
  botmaster = new Botmaster();

  botmaster.addBot(botOne);
  botmaster.addBot(botTwo);
  botmaster.addBot(botThree);
});

test(`${testTitleBase} should throw an error when getting called without any options `, (t) => {
  t.plan(1);

  try {
    botmaster.getBot();
  } catch (err) {
    t.is(err.message.indexOf('needs exactly one of') > -1, true);
  }
});

test(`${testTitleBase} should throw an error when getting called without two options`, (t) => {
  t.plan(1);

  try {
    botmaster.getBot({
      type: 'platformOne',
      id: 'botOne',
    });
  } catch (err) {
    t.is(err.message.indexOf('needs exactly one of') > -1, true);
  }
});

test(`${testTitleBase} should work when getting called with only id option`, (t) => {
  t.plan(1);

  const bot = botmaster.getBot({
    id: 'botOne',
  });
  t.is(bot, botOne);
});

test(`${testTitleBase} should work when getting called with only type option`, (t) => {
  t.plan(1);

  const bot = botmaster.getBot({
    type: 'platformOne',
  });
  t.is(bot, botOne);
});

test(`${testTitleBase}s should work when getting called with only type option`, (t) => {
  t.plan(1);

  try {
    botmaster.getBots({
      type: 'platformOne',
    });
  } catch (err) {
    t.is(err.message.indexOf('takes in a string as') > -1, true);
  }
});

test(`${testTitleBase}s should return bots of a certain type when requested`, (t) => {
  t.plan(6);

  const platformOneBots = botmaster.getBots('platformOne');
  t.is(platformOneBots.length, 2);
  t.is(platformOneBots[0].type, 'platformOne');
  t.is(platformOneBots[1].type, 'platformOne');

  const platformTwoBots = botmaster.getBots('platformTwo');
  t.is(platformTwoBots.length, 0);

  const platformThreeBots = botmaster.getBots('platformThree');
  t.is(platformThreeBots.length, 1);
  t.is(platformThreeBots[0].type, 'platformThree');
});

test.after(() => {
  return new Promise((resolve) => {
    botmaster.server.close(resolve);
  });
});
