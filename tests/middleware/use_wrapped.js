import test from 'ava';
import request from 'request-promise';
import { assign } from 'lodash';
import { outgoingMessageFixtures,
         incomingUpdateFixtures,
         attachmentFixtures } from 'botmaster-test-fixtures';

import Botmaster from '../../lib';
import MockBot from '../_mock_bot';

test('throws an error if called with falsy params', (t) => {
  t.plan(2);

  const bot = new MockBot();
  try {
    bot.useWrapped();
  } catch (err) {
    t.is(err.message,
      'Can\'t add middleware without params',
      'Error message is not the same as expected');
  }
  try {
    bot.useWrapped('');
  } catch (err) {
    t.is(err.message,
      'Can\'t add middleware without params',
      'Error message is not the same as expected');
  }
});

test('throws an error if params is missing either is not incoming or outgoing', (t) => {
  t.plan(2);

  const bot = new MockBot();
  try {
    bot.useWrapped({
      incoming: 'something',
    });
  } catch (err) {
    t.is(err.message,
      'useWrapped should be called with both an incoming and an outgoing callback',
      'Error message is not the same as expected');
  }
  try {
    bot.useWrapped({
      outgoing: 'something',
    });
  } catch (err) {
    t.is(err.message,
      'useWrapped should be called with both an incoming and an outgoing callback',
      'Error message is not the same as expected');
  }
});

test('results in error being emitted if error occurs in incoming of wrapped', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();
    botmaster.addBot(new MockBot());

    botmaster.useWrapped({
      incoming: {
        cb: (bot, update, next) => {
          update.blop();
          next();
        },
      },
      outgoing: {
        cb: (bot, update, message, next) => {
          t.fail();
          next();
        },
      },
    });

    botmaster.on('error', (bot, err) => {
      t.is(err.message,
        '""update.blop is not a function". In incoming wrapped middleware". This is most probably on your end.',
        'Error message is not same as expected');
      botmaster.server.close(resolve);
    });

    botmaster.on('listening', () => {
      const bot = botmaster.bots[0];
      bot.__emitUpdate(incomingUpdateFixtures.textUpdate());
    });
  });
});

test('results in error being thrown if error occurs in outgoing of wrapped', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();
    botmaster.addBot(new MockBot());

    botmaster.useWrapped({
      incoming: {
        cb: (bot, update, next) => {
          t.fail();
          next();
        },
      },
      outgoing: {
        cb: (bot, update, message, next) => {
          message.blop();
          next();
        },
      },
    });

    botmaster.on('error', (bot, err) => {
      t.is(err.message,
        '""update.blop is not a function". In incoming wrapped middleware". This is most probably on your end.',
        'Error message is not same as expected');
      botmaster.server.close(resolve);
    });

    botmaster.on('listening', async () => {
      const bot = botmaster.bots[0];
      try {
        await bot.sendMessage(outgoingMessageFixtures.textMessage());
      } catch (err) {
        console.log(err.message);
        t.is(err.message,
          '"message.blop is not a function". In outgoing wrapped middleware',
          'Error message is not same as expected');
        botmaster.server.close(resolve);
      }
    });
  });
});

test('sets up the wrapped middleware that then gets hit in the order expected of them even if addBot declared after', (t) => {
  t.plan(2);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();

    botmaster.useWrapped({
      incoming: {
        cb: (bot, update, next) => {
          update.message.text += ' World';
          next();
        },
      },
      outgoing: {
        cb: (bot, update, message, next) => {
          message.message.text += ' done';
          next();
        },
      },
    })
    .use({
      incoming: {
        cb: async (bot, update, next) => {
          update.message.text += '!';
          const body = await bot.reply(update, 'Goodbye World!');
          t.is(body.sentOutgoingMessage.message.text, 'We\'re done!', 'message object not as expected after going through outgoing middleware');
          botmaster.server.close(resolve);
        },
      },
    })
    .use({
      outgoing: {
        cb: (bot, update, message, next) => {
          t.is(update.message.text, 'Hello World!', 'update object not as expected at start of outgoing');
          message.message.text = 'We\'re';
          next();
        },

      },
    })
    .useWrapped({
      incoming: {
        cb: (bot, update, next) => {
          update.message.text = 'Hello';
          next();
        },
      },
      outgoing: {
        cb: (bot, update, message, next) => {
          message.message.text += '!';
          next();
        },
      },
    })
    .addBot(new MockBot())

    .on('listening', async () => {
      const bot = botmaster.bots[0];
      bot.__emitUpdate(incomingUpdateFixtures.textUpdate());
    });
  });
});

test('sets up the wrapped middleware pairwise only. Even if one of the middleware making up the pair is addable', (t) => {
  t.plan(2);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();
    botmaster.addBot(new MockBot({
      receives: {
        text: false,
      },
    }));

    botmaster.useWrapped({
      incoming: {
        cb: (bot, update, next) => {
          t.fail('Middleware wrap should not have been added');
          botmaster.server.close(resolve);
        },
        options: {
          botReceives: 'text',
        },
      },
      outgoing: {
        cb: (bot, update, message, next) => {
          t.fail('Middleware wrap should not have been added');
          botmaster.server.close(resolve);
        },
        options: {
          botSends: 'text',
        },
      },
    });

    botmaster.useWrapped({
      incoming: {
        cb: async (bot, update, next) => {
          const body = await bot.sendTextMessageTo('Goodbye');
          t.is(body.sentOutgoingMessage.message.text, 'Goodbye', 'message not as expected');
          botmaster.server.close(resolve);
        },
      },
      outgoing: {
        cb: (bot, update, message, next) => {
          t.pass();
          next();
        },
      },
    });

    botmaster.on('listening', () => {
      const bot = botmaster.bots[0];
      bot.__emitUpdate(incomingUpdateFixtures.textUpdate());
    });
  });
});

test('sets up the wrapped middleware that then gets skipped as expected when specified to using skip*Wrapped*', (t) => {
  t.plan(2);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();
    botmaster.addBot(new MockBot());

    botmaster.useWrapped({
      incoming: {
        cb: (bot, update, next) => {
          t.fail('should not be hitting second wrapped incoming middleware');
          botmaster.server.close(resolve);
        },
      },
      outgoing: {
        cb: (bot, update, message, next) => {
          message.message.text += ' done';
          next();
        },
      },
    })
    .use({
      incoming: {
        cb: async (bot, update, next) => {
          update.message.text += '!';
          const body = await bot.reply(update, 'Goodbye World!');
          t.is(body.sentOutgoingMessage.message.text, 'We\'re done!', 'message object not as expected after going through outgoing middleware');
          botmaster.server.close(resolve);
        },
      },
    })
    .use({
      outgoing: {
        cb: (bot, update, message, next) => {
          t.is(update.message.text, 'Hi!', 'update object not as expected at start of outgoing');
          message.message.text = 'We\'re';
          next('skipNonWrappedOutgoingOnly');
        },
      },
    })
    .use({
      outgoing: {
        cb: (bot, update, message, next) => {
          t.fail('should not be hitting second normal outgoing middleware');
          botmaster.server.close(resolve);
        },
      },
    })
    .useWrapped({
      incoming: {
        cb: (bot, update, next) => {
          update.message.text = 'Hi';
          next('skipWrappedIncomingOnly');
        },
      },
      outgoing: {
        cb: (bot, update, message, next) => {
          message.message.text += '!';
          next();
        },
      },
    });

    botmaster.on('listening', async () => {
      const bot = botmaster.bots[0];
      bot.__emitUpdate(incomingUpdateFixtures.textUpdate());
    });
  });
});

test('sets up the wrapped middleware that then gets skipped as expected when specified to using main skips', (t) => {
  t.plan(2);

  return new Promise((resolve) => {
    const botmaster = new Botmaster();
    botmaster.addBot(new MockBot());

    botmaster.useWrapped({
      incoming: {
        cb: (bot, update, next) => {
          t.fail('should not be hitting second wrapped incoming middleware');
          botmaster.server.close(resolve);
        },
      },
      outgoing: {
        cb: (bot, update, message, next) => {
          // because they are wrapping, this is first for outgoing and second for incoming.
          t.fail('should not be hitting first wrapped outgoing middleware');
          botmaster.server.close(resolve);
        },
      },
    });

    botmaster.use({
      incoming: {
        cb: async (bot, update, next) => {
          t.fail('should not be hitting any normal incoming middleware');
          botmaster.server.close(resolve);
        },
      },
    });

    botmaster.on('update', async (bot, update) => {
      update.message.text += '!';
      const body = await bot.reply(update, 'Goodbye World!');
      t.is(body.sentOutgoingMessage.message.text, 'done!', 'message object not as expected after going through outgoing middleware');
      botmaster.server.close(resolve);
    });

    botmaster.use({
      outgoing: {
        cb: (bot, update, message, next) => {
          t.is(update.message.text, 'Hi!', 'update object not as expected at start of outgoing');
          message.message.text = 'done!';
          next('skip');
        },
      },
    });

    botmaster.use({
      outgoing: {
        cb: (bot, update, message, next) => {
          t.fail('should not be hitting second normal outgoing middleware');
          botmaster.server.close(resolve);
        },
      },
    });

    botmaster.useWrapped({
      incoming: {
        cb: (bot, update, next) => {
          update.message.text = 'Hi';
          next('skip');
        },
      },
      outgoing: {
        cb: (bot, update, message, next) => {
          t.fail('should not be hitting second wrapped outgoing middleware');
          botmaster.server.close(resolve);
        },
      },
    });

    botmaster.on('listening', async () => {
      const bot = botmaster.bots[0];
      bot.__emitUpdate(incomingUpdateFixtures.textUpdate());
    });
  });
});
