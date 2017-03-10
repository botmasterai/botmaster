import test from 'ava';
import { outgoingMessageFixtures } from 'botmaster-test-fixtures';
import { assign } from 'lodash';

import OutgoingMessage from '../lib/outgoing_message';

const titleBase = 'OutgoingMessage';

const createBaseOutgoingMessageWrapper = () => {
  const outgoingMessage = {
    recipient: {
      id: 'user_id',
    }
  };

  return new OutgoingMessage(outgoingMessage);
}

test(`${titleBase}'s #constructor throws an error when initialised without argument'`, (t) => {
  t.plan(1);

  try {
    const m = new OutgoingMessage();
  } catch (err) {
    t.is(err.message,
      'OutgoingMessage constructor needs to be initialised with a message object');
  }
});

test(`${titleBase}'s throws an error when argument passed is not an object'`, (t) => {
  t.plan(1);

  try {
    const m = new OutgoingMessage('not an object');
  } catch (err) {
    t.is(err.message,
      'OutgoingMessage constructor takes in an object as param');
  }
});

test(`${titleBase}'s #constructor properly assigns passed in object'`, (t) => {
  t.plan(1);

  const message = outgoingMessageFixtures.textMessage();
  const outgoingMessage = new OutgoingMessage(message);

  // assign is used here and in all the subsequent tests, in order
  // to make sure that the deepEqual passes. Otherwise, it is comparing an
  // instance of OutgoingMessage with Object, whcih won't work!
  t.deepEqual(assign({}, outgoingMessage), message);
});

//
// describe('Outgoing Message', function() {
//   let outgoingMessageWrapper;
//
//   beforeEach(function() {
//     const outgoingMessage = {
//       recipient: {
//         id: 'user_id',
//       }
//     };
//     outgoingMessageWrapper = new (outgoingMessage);
//   });
//
//   describe.only('#addText', function() {
//     it('should correctly add text to the object', function() {
//       outgoingMessageWrapper.addText('HelloWorld!');
//
//       assert(outgoingMessageWrapper.get() == outgoingMessages.textMessage);
//     });
//   });
// });
