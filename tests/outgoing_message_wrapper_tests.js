'use strict';

const OutgoingMessageWrapper = require('../lib/outgoing_message_wrapper');
const outgoingMessages = require('botmaster-test-fixtures').outgoingMessages;

describe('Outgoing Message', function() {
  let outgoingMessageWrapper;

  beforeEach(function() {
    const outgoingMessage = {
      recipient: {
        id: 'user_id',
      }
    };
    outgoingMessageWrapper = new (outgoingMessage);
  });

  describe.only('#addText', function() {
    it('should correctly add text to the object', function() {
      outgoingMessageWrapper.addText('HelloWorld!');

      assert(outgoingMessageWrapper.get() == outgoingMessages.textMessage);
    });


  });
});
