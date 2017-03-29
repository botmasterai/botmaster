import test from 'ava';

import MockBot from '../_mock_bot';

test('throws error when bot type does not support retrieving user is', async (t) => {
  t.plan(1);

  const bot = new MockBot();
  try {
    await bot.getUserInfo('user_id');
    t.fail('Error not returned');
  } catch (err) {
    t.is(err.message, 'Bots of type mock don\'t provide access to user info.',
        'Error message is not same as expected');
  }
});

test('works when bot type supports retrieving the info', async (t) => {
  t.plan(1);

  const bot = new MockBot({
    retrievesUserInfo: true,
  });

  const userInfo = await bot.getUserInfo('user_id');
  t.is(userInfo.first_name, 'Peter', 'userInfo is not same as expected');
});
