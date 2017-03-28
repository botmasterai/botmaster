import test from 'ava';
import request from 'request-promise';
import { assign } from 'lodash';
import { outgoingMessageFixtures,
         incomingUpdateFixtures } from 'botmaster-test-fixtures';

import Botmaster from '../../lib';
import MockBot from '../_mock_bot';

test.beforeEach((t) => {
  return new Promise((resolve) => {
    t.context.botmaster = new Botmaster();
    t.context.bot = new MockBot({
      requiresWebhook: true,
      webhookEndpoint: 'webhook',
      type: 'express',
    });
    t.context.botmaster.addBot(t.context.bot);
    t.context.baseRequestOptions = {
      method: 'POST',
      uri: 'http://localhost:3000/express/webhook',
      body: {},
      json: true,
      resolveWithFullResponse: true,
    };
    t.context.botmaster.on('listening', resolve);
  });
});

test.afterEach((t) => {
  return new Promise((resolve) => {
    t.context.botmaster.server.close(resolve);
  });
});

test('throws an error middleware is not an object', (t) => {
  t.plan(1);

  try {
    t.context.botmaster.use('something');
  } catch (err) {
    t.is(err.message,
      'middleware should be an object. Not string',
      'Error message is not the same as expected');
  }
});

test('throws an error if type is not incoming or outgoing', (t) => {
  t.plan(1);

  try {
    t.context.botmaster.use({
      type: 'something',
    });
  } catch (err) {
    t.is(err.message,
      'invalid middleware type. Type should be either \'incoming\' or \'outgoing\'',
      'Error message is not the same as expected');
  }
});

test('throws an error if controller is not defined', (t) => {
  t.plan(1);

  try {
    t.context.botmaster.use({
      type: 'incoming',
    });
  } catch (err) {
    t.is(err.message,
      'middleware controller can\'t be of type undefined. It needs to be a function',
      'Error message is not the same as expected');
  }
});

test('throws an error if middlewareCallback is not a function', (t) => {
  t.plan(1);

  try {
    t.context.botmaster.use({
      type: 'incoming',
      controller: 'not valid',
    });
  } catch (err) {
    t.is(err.message,
      'middleware controller can\'t be of type string. It needs to be a function',
      'Error message is not the same as expected');
  }
});

const incomingMiddlewareErrorMacro = (t, controller) => {
  t.plan(1);

  return new Promise((resolve) => {
    const botmaster = t.context.botmaster;

    botmaster.use({
      controller,
      type: 'incoming',
    });

    botmaster.use({
      type: 'incoming',
      controller: () => {
        t.fail('this middleware should not get hit');
        resolve();
      },
    });

    botmaster.on('error', (bot, err) => {
      t.is(err.message,
        '"update.blop is not a function". This is most probably on your end.',
        'Error message did not match');
      resolve();
    });

    request(t.context.baseRequestOptions);
  });
};

incomingMiddlewareErrorMacro.title = customTitlePart =>
  `Errors in incoming middleware are emitted correctly ${customTitlePart}`;

test('in synchronous middleware', incomingMiddlewareErrorMacro,
  (bot, update) => {
    update.blop();
  });

test('using next', incomingMiddlewareErrorMacro,
  (bot, update, next) => {
    process.nextTick(() => {
      try {
        update.blop();
      } catch (err) {
        next(err);
      }
    });
  });

test('using promises', incomingMiddlewareErrorMacro,
  (bot, update) => {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        try {
          update.blop();
        } catch (err) {
          reject(err);
        }
      });
    });
  });

test('using async function', incomingMiddlewareErrorMacro,
  async (bot, update) => {
    // just a function that returns a promise
    const somePromise = () => new Promise((resolve) => {
      process.nextTick(() => {
        resolve();
      });
    });

    await somePromise();
    update.blop();
  });

test('Error is emitted if error is thrown by user and does not inherit from Error', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    const botmaster = t.context.botmaster;

    botmaster.use({
      controller: async () => {
        const err = 'not expected';
        throw err;
      },
      type: 'incoming',
    });

    botmaster.use({
      type: 'incoming',
      controller: () => {
        t.fail('this middleware should not get hit');
        resolve();
      },
    });

    botmaster.on('error', (bot, err) => {
      t.is(err,
        'not expected',
        'Error message did not match');
      resolve();
    });

    request(t.context.baseRequestOptions);
  });
});

test('Error is emitted if error is thrown by user and is falsy', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    const botmaster = t.context.botmaster;

    botmaster.use({
      controller: () => Promise.reject(),
      type: 'incoming',
    });

    botmaster.use({
      type: 'incoming',
      controller: () => {
        t.fail('this middleware should not get hit');
        resolve();
      },
    });

    botmaster.on('error', (bot, err) => {
      t.is(err,
        'empty error object',
        'Error message did not match');
      resolve();
    });

    request(t.context.baseRequestOptions);
  });
});

test('Emits error if next is used within returned promise', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    const botmaster = t.context.botmaster;

    botmaster.use({
      type: 'incoming',
      controller: async (bot, update, next) => {
        next('skip');
      },
    });

    botmaster.use({
      type: 'incoming',
      controller: () => {
        t.fail('this middleware should not get hit');
        resolve();
      },
    });

    botmaster.on('error', (bot, err) => {
      t.is(err.message,
        '"next can\'t be called if middleware returns a promise/is an async ' +
        'function". This is most probably on your end.',
        'Error message did not match');
      resolve();
    });

    request(t.context.baseRequestOptions);
  });
});

test('sets up the incoming middleware function specified if good params' +
' passed. Does not call any outgoing middleware when going through', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    const botmaster = t.context.botmaster;

    botmaster.use({
      type: 'incoming',
      controller: async (bot, update) => {
        update.message.text = 'Hello World!';
      },
    });

    botmaster.use({
      type: 'outgoing',
      controller: () => {
        t.fail('outgoing middleware should not be called');
      },
    });

    botmaster.use({
      type: 'incoming',
      controller: (bot, update) => {
        t.is(update.message.text, 'Hello World!', 'update object did not match');
        resolve();
      },
    });

    request(t.context.baseRequestOptions);
  });
});


test('sets up the incoming middleware and calls them using __emitUpdate', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    t.context.botmaster.use({
      type: 'incoming',
      controller: (bot, update, next) => {
        update.text = 'Hello World!';
        next();
      },
    });

    t.context.botmaster.use({
      type: 'incoming',
      controller: (bot, update) => {
        t.is(update.text, 'Hello World!', 'update object did not match');
        resolve();
      },
    });

    t.context.bot.__emitUpdate({});
  });
});


test('sets up the incoming middleware in order of declaration', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    t.context.botmaster.use({
      type: 'incoming',
      controller: (bot, update, next) => {
        update.text = 'Hello ';
        next();
      },
    });

    t.context.botmaster.use({
      type: 'incoming',
      controller: (bot, update) => {
        update.text += 'World!';
        return Promise.resolve();
      },
    });

    t.context.botmaster.use({
      type: 'incoming',
      controller: async (bot, update) => {
        update.text += ' And others';
      },
    });

    t.context.botmaster.use({
      type: 'incoming',
      controller: (bot, update) => {
        t.is(update.text, 'Hello World! And others', 'update object did not match');
        resolve();
      },
    });

    t.context.bot.__emitUpdate({});
  });
});

const incomingMiddlewareChainBreakerMacro = (t, controller) => {
  t.plan(1);

  return new Promise(async (resolve) => {
    t.context.botmaster.use({
      type: 'incoming',
      controller,
    });

    t.context.botmaster.use({
      type: 'incoming',
      controller: () => {
        t.fail('this middleware should not get hit');
        resolve();
      },
    });

    const val = await t.context.bot.__emitUpdate({});
    if (val) {
      t.is(val, 'cancelled');
    } else {
      t.pass();
    }
    resolve();
  });
};

incomingMiddlewareChainBreakerMacro.title = customTitlePart =>
  `using middleware chain breakers in incoming middleware works as expected ${customTitlePart}`;

test('using next skip', incomingMiddlewareChainBreakerMacro, (bot, update, next) => {
  next('skip');
});

test('using promise skip', incomingMiddlewareChainBreakerMacro,
  () => Promise.resolve('skip'));

test('using async skip', incomingMiddlewareChainBreakerMacro,
  async () => 'skip');

test('using next cancel', incomingMiddlewareChainBreakerMacro, (bot, update, next) => {
  next('cancel');
});

test('using promise cancel', incomingMiddlewareChainBreakerMacro,
  () => Promise.resolve('cancel'));

test('using async cancel', incomingMiddlewareChainBreakerMacro,
  async () => 'cancel');


test('echo, read and delivery are not included by default', (t) => {
  t.plan(3);

  return new Promise((resolve) => {
    t.context.botmaster.use({
      type: 'incoming',
      controller: () => {
        t.fail('this middleware should never get hit in this test');
        resolve();
      },
    });

    let hitMiddlewareCount = 0;
    const resolveWhenNeeded = () => {
      hitMiddlewareCount += 1;
      if (hitMiddlewareCount === 3) {
        resolve();
      }
    };

    t.context.botmaster.use({
      type: 'incoming',
      includeEcho: true,
      controller: (bot, update, next) => {
        t.truthy(update.message.is_echo, 'message is not an echo');
        resolveWhenNeeded();
        next();
      },
    });

    t.context.botmaster.use({
      type: 'incoming',
      includeDelivery: true,
      controller: (bot, update) => {
        t.truthy(update.delivery, 'message is not a delivery confirmation');
        resolveWhenNeeded();
        return Promise.resolve();
      },
    });

    t.context.botmaster.use({
      type: 'incoming',
      includeRead: true,
      controller: async (bot, update) => {
        t.truthy(update.read, 'message is not a read confirmation');
        resolveWhenNeeded();
      },
    });

    t.context.bot.__emitUpdate(incomingUpdateFixtures.echoUpdate());
    t.context.bot.__emitUpdate(incomingUpdateFixtures.messageReadUpdate());
    t.context.bot.__emitUpdate(incomingUpdateFixtures.messageDeliveredUpdate());
  });
});

const outgoingMiddlewareErrorMacro = (t, controller) => {
  t.plan(1);

  return new Promise((resolve) => {
    const botmaster = t.context.botmaster;

    botmaster.use({
      controller,
      type: 'outgoing',
    });

    botmaster.use({
      type: 'outgoing',
      controller: () => {
        t.fail('this middleware should not get hit');
        resolve();
      },
    });

    botmaster.bots[0].sendMessage({})
    .catch((err) => {
      t.is(err.message,
          'message.blop is not a function',
          'Error message did not match');
      resolve();
    });
  });
};

outgoingMiddlewareErrorMacro.title = customTitlePart =>
  `Errors in outgoing middleware are thrown correctly ${customTitlePart}`;

test('in synchronous middleware', outgoingMiddlewareErrorMacro,
  (bot, update, message) => {
    message.blop();
  });

test('using next', outgoingMiddlewareErrorMacro,
  (bot, update, message, next) => {
    process.nextTick(() => {
      try {
        message.blop();
      } catch (err) {
        next(err);
      }
    });
  });

test('using promises', outgoingMiddlewareErrorMacro,
  (bot, update, message) => {
    return new Promise((resolve, reject) => {
      process.nextTick(() => {
        try {
          message.blop();
        } catch (err) {
          reject(err);
        }
      });
    });
  });

test('using async function', outgoingMiddlewareErrorMacro,
  async (bot, update, message) => {
    // just a function that returns a promise
    const somePromise = () => new Promise((resolve) => {
      process.nextTick(() => {
        resolve();
      });
    });

    await somePromise();
    message.blop();
  });

test('sets up the outgoing middleware in order of declaration. ' +
  'Then calls them when prompted without calling incoming middleware', (t) => {
  t.plan(1);

  return new Promise((resolve) => {
    const botmaster = t.context.botmaster;

    botmaster.use({
      type: 'incoming',
      controller: (bot, update, next) => {
        t.fail('Called incoming middleware, although should not');
        next();
      },
    });

    botmaster.use({
      type: 'outgoing',
      controller: async (bot, update, message) => {
        message.removeText();
      },
    });

    botmaster.use({
      type: 'outgoing',
      controller: (bot, update, message, next) => {
        message.addText('Goodbye Worlds!');
        next();
      },
    });

    botmaster.bots[0].sendMessage(outgoingMessageFixtures.textMessage())
    .then((body) => {
      t.is(body.sentOutgoingMessage.message.text, 'Goodbye Worlds!', 'sent message did not match');
      resolve();
    })
    .catch((err) => {
      t.fail(err.message);
      resolve();
    });
  });
});

const skipOutgoingMiddlewareMacro = (t, controller) => {
  t.plan(2);

  return new Promise(async (resolve) => {
    t.context.botmaster.use({
      type: 'outgoing',
      controller: (bot, update, message, next) => {
        t.pass();
        return controller(bot, update, message, next);
      },
    });

    t.context.botmaster.use({
      type: 'outgoing',
      controller: () => {
        t.fail('this middleware should not get hit');
        resolve();
      },
    });

    const body = await t.context.bot.sendMessage(
      outgoingMessageFixtures.textMessage());
    t.deepEqual(body.sentRawMessage, outgoingMessageFixtures.textMessage());
    resolve();
  });
};

skipOutgoingMiddlewareMacro.title = customTitlePart =>
  `using middleware skip in outgoing middleware works as expected ${customTitlePart}`;

test('using next skip', skipOutgoingMiddlewareMacro, (bot, update, message, next) => {
  next('skip');
});

test('using promise skip', skipOutgoingMiddlewareMacro,
  () => Promise.resolve('skip'));

test('using async skip', skipOutgoingMiddlewareMacro,
  async () => 'skip');


const cancelOutgoingMiddlewareMacro = async (t, controller) => {
  t.plan(2);

  return new Promise(async (resolve) => {
    t.context.botmaster.use({
      type: 'outgoing',
      controller: (bot, update, message, next) => {
        t.pass();
        return controller(bot, update, message, next);
      },
    });

    t.context.botmaster.use({
      type: 'outgoing',
      controller: () => {
        t.fail('this middleware should not get hit');
        resolve();
      },
    });

    const body = await t.context.bot.sendMessage(
      outgoingMessageFixtures.textMessage());
    t.is(body, 'cancelled');
    resolve();
  });
};

cancelOutgoingMiddlewareMacro.title = customTitlePart =>
  `using middleware cancel in outgoing middleware works as expected ${customTitlePart}`;

test('using next cancel', cancelOutgoingMiddlewareMacro, (bot, update, message, next) => {
  next('cancel');
});

test('using promise cancel', cancelOutgoingMiddlewareMacro,
  () => Promise.resolve('cancel'));

test('using async cancel', cancelOutgoingMiddlewareMacro,
  async () => 'cancel');

test('sets up the outgoing middleware which is ignored if specified so in sendOptions.', (t) => {
  t.plan(2);

  return new Promise(async (resolve) => {
    t.context.botmaster.use({
      type: 'outgoing',
      controller: () => {
        t.fail('this middleware should not get hit');
        resolve();
      },
    });

    const bot = t.context.bot;
    try {
      await bot.sendMessage(
        outgoingMessageFixtures.textMessage(), { ignoreMiddleware: true });
      await bot.reply(
        incomingUpdateFixtures.textUpdate(), 'wadup?', { ignoreMiddleware: true });
      await bot.sendAttachmentFromUrlTo(
        'image', 'some_link', 'user_id', { ignoreMiddleware: true });
      await bot.sendDefaultButtonMessageTo(
        ['b1', 'b2'], undefined, 'user_id', { ignoreMiddleware: true });
      await bot.sendIsTypingMessageTo(
        'user_id', { ignoreMiddleware: true });
      const bodies = await bot.sendTextCascadeTo(
        ['message1', 'message2'], 'user_id', { ignoreMiddleware: true });

      t.is(bodies[0].sentOutgoingMessage.message.text, 'message1',
        'sentOutgoingMessage was not as expected');
      t.is(bodies[1].sentOutgoingMessage.message.text, 'message2',
        'sentOutgoingMessage was not as expected');

      resolve();
    } catch (err) {
      t.fail(err.message);
      resolve();
    }
  });
});

test('sets up the outgoing middleware which is aware of update when manually set using sendOptions. or __createBotPatchedWithUpdate', (t) => {
  t.plan(4);

  return new Promise(async (resolve) => {
    const botmaster = t.context.botmaster;

    const mockUpdate = { id: 1 };
    botmaster.use({
      type: 'outgoing',
      controller: (bot, update, message, next) => {
        t.is(update, mockUpdate, 'associated update is not the same');
        t.deepEqual(assign({}, message), outgoingMessageFixtures.textMessage(),
          'Message is not the same');
        next();
      },
    });

    const bot = botmaster.bots[0];
    try {
      await bot.sendMessage(
        outgoingMessageFixtures.textMessage(), { __update: mockUpdate });

      // with a patchedBot
      const patchedBot = bot.__createBotPatchedWithUpdate(mockUpdate);
      await patchedBot.sendMessage(outgoingMessageFixtures.textMessage());

      botmaster.server.close(resolve);
    } catch (err) {
      t.fail(err.message);
      botmaster.server.close(resolve);
    }
  });
});

test('sets up the outgoing middleware which is aware of update when sending message from incoming middleware', (t) => {
  t.plan(3);

  return new Promise((resolve) => {
    const botmaster = t.context.botmaster;

    botmaster.use({
      type: 'incoming',
      controller: async (bot, update) => {
        const body = await bot.reply(update, 'Hello World!');
        t.is(body.sentOutgoingMessage.message.text, 'Hello World!');
        resolve();
      },
    });

    botmaster.use({
      type: 'outgoing',
      controller: (bot, update, message, next) => {
        t.deepEqual(assign({}, update), incomingUpdateFixtures.textUpdate(), 'associated update is not the same');
        t.deepEqual(assign({}, message), outgoingMessageFixtures.textMessage(), 'Message is not the same');
        next();
      },
    });

    const bot = botmaster.bots[0];
    bot.__emitUpdate(incomingUpdateFixtures.textUpdate());
  });
});

test('sets up the outgoing middleware which is aware of update on the second pass when sending a message in outgoing middleware', (t) => {
  t.plan(8);

  return new Promise((resolve) => {
    const botmaster = t.context.botmaster;

    const receivedUpdate = incomingUpdateFixtures.textUpdate();

    let pass = 1;
    botmaster.use({
      type: 'outgoing',
      controller: async (bot, update, message) => {
        if (pass === 1) {
          t.is(message.message.text, 'Hello World!', 'message text is not as expected on first pass');
          t.is(update.newProp, 1, 'newProp is not the expected value on first pass');
          t.is(update, receivedUpdate, 'Reference to update is not the same');
          update.newProp = 2;
          pass += 1;

          const body = await bot.reply(update, 'Goodbye World!');
          t.is(body.sentRawMessage.message.text, 'Goodbye World!');
        } else if (pass === 2) {
          t.is(message.message.text, 'Goodbye World!', 'message text is not as expected on second pass');
          t.is(update.newProp, 2, 'newProp is not the expected value on second pass');
          t.is(update, receivedUpdate, 'Reference to update is not the same');
          resolve();
        }
      },
    });

    botmaster.use({
      type: 'incoming',
      controller: async (bot, update) => {
        update.newProp = 1;
        const body = await bot.reply(update, 'Hello World!');
        t.is(body.sentRawMessage.message.text, 'Hello World!');
      },
    });

    t.context.bot.__emitUpdate(receivedUpdate);
  });
});

