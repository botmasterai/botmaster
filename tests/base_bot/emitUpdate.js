import test from 'ava';

import MockBot from '../_mock_bot';

test('Emits error when called from non owned bot', (t) => {
  t.plan(1);

  const bot = new MockBot();

  return bot.__emitUpdate({})
  .catch((err) => {
    t.is(err.message, 'bot needs to be added to a botmaster instance ' +
                      'in order to emit received updates');
  });
});
