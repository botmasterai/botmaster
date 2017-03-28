import test from 'ava';

import Botmaster from '../../lib';

test.beforeEach((t) => {
  return new Promise((resolve) => {
    t.context.botmaster = new Botmaster();
    t.context.botmaster.on('listening', resolve);
  });
});

test.afterEach((t) => {
  return new Promise((resolve) => {
    t.context.botmaster.server.close(resolve);
  });
});

const errorThrowingMacro = (t, params) => {
  t.plan(1);

  const botmaster = t.context.botmaster;
  try {
    botmaster.useWrapped(params.incomingMiddleware, params.outgoingMiddleware);
  } catch (err) {
    t.is(err.message,
      params.errorMessage,
      'Error message is not the same as expected');
  }
};

errorThrowingMacro.title = customTitlePart =>
  `throws an error if ${customTitlePart}`;

test('called with no params', errorThrowingMacro, {
  errorMessage: 'useWrapped should be called with both an' +
                ' incoming and an outgoing middleware',
});

test('called with no outgoing middleware', errorThrowingMacro, {
  incomingMiddleware: {
    type: 'incoming',
    controller: __ => __,
  },
  errorMessage: 'useWrapped should be called with both an' +
                ' incoming and an outgoing middleware',
});

test('called with no incoming middleware', errorThrowingMacro, {
  outgoingMiddleware: {
    type: 'outgoing',
    controller: __ => __,
  },
  errorMessage: 'useWrapped should be called with both an' +
                ' incoming and an outgoing middleware',
});

test('called with two incoming middlewares', errorThrowingMacro, {
  incomingMiddleware: {
    type: 'outgoing',
    controller: __ => __,
  },
  outgoingMiddleware: {
    type: 'outgoing',
    controller: __ => __,
  },
  errorMessage: 'first argument of "useWrapped" should be an' +
                ' incoming middleware',
});

test('called with two incoming middlewares', errorThrowingMacro, {
  incomingMiddleware: {
    type: 'incoming',
    controller: __ => __,
  },
  outgoingMiddleware: {
    type: 'incoming',
    controller: __ => __,
  },
  errorMessage: 'second argument of "useWrapped" should be an' +
                ' outgoing middleware',
});

test('middleware gets added where expected', (t) => {
  t.plan(4);

  const botmaster = t.context.botmaster;

  const useIncomingController = __ => __;
  botmaster.use({
    type: 'incoming',
    controller: useIncomingController,
  });

  const useOutgoingController = __ => __;
  botmaster.use({
    type: 'outgoing',
    controller: useOutgoingController,
  });

  const useWrappedIncomingController = __ => __;
  const useWrappedOutgoingController = __ => __;

  botmaster.useWrapped({
    type: 'incoming',
    controller: useWrappedIncomingController,
  }, {
    type: 'outgoing',
    controller: useWrappedOutgoingController,
  });

  t.is(botmaster.middleware.incomingMiddlewareStack.length, 2);
  t.is(botmaster.middleware.outgoingMiddlewareStack.length, 2);
  t.is(botmaster.middleware.incomingMiddlewareStack[0].controller,
    useWrappedIncomingController);
  t.is(botmaster.middleware.outgoingMiddlewareStack[1].controller,
    useWrappedOutgoingController);
});
