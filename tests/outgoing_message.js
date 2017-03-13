import test from 'ava';
import { outgoingMessageFixtures, attachmentFixtures } from 'botmaster-test-fixtures';
import { assign } from 'lodash';

import OutgoingMessage from '../lib/outgoing_message';

const titleBase = 'OutgoingMessage';

const createBaseOutgoingMessage = () => {
  const outgoingMessage = {
    recipient: {
      id: 'user_id',
    },
  };

  return new OutgoingMessage(outgoingMessage);
};

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
  // instance of OutgoingMessage with Object, which won't work!
  t.deepEqual(assign({}, outgoingMessage), message);
});

test(`${titleBase}'s #__addPropery throws error when trying to add property with falsy value`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();

  try {
    outgoingMessage.__addProperty('arbitrary', 'arbitrary', undefined);
  } catch (err) {
    t.is(err.message,
      'arbitrary must have a value. Can\'t be undefined');
  }
});

test(`${titleBase}'s #__addPropery throws error when trying to add property that already has a value`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.arbitrary = 'some value';

  try {
    outgoingMessage.__addProperty('arbitrary', 'arbitrary', 'some other value');
  } catch (err) {
    t.is(err.message,
      'Can\'t add arbitrary to outgoingMessage that already has arbitrary');
  }
});

test(`${titleBase}'s #__removePropery throws error when trying to remove property that doesn't have a value`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();

  try {
    outgoingMessage.__removeProperty('arbitrary.arb', 'arbitrary');
  } catch (err) {
    t.is(err.message,
      'Can\'t remove arbitrary from outgoingMessage that doesn\'t have any arbitrary');
  }
});

test(`${titleBase}'s #addText properly works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addText('Hello World!');

  t.deepEqual(assign({}, outgoingMessage), outgoingMessageFixtures.textMessage());
});

test(`${titleBase}'s #removeText properly works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addText('Hello World!').removeText();

  const expectedOutgoingMessage = createBaseOutgoingMessage();
  expectedOutgoingMessage.message = {};

  t.deepEqual(outgoingMessage, expectedOutgoingMessage);
});

test(`${titleBase}'s #addAttachment works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addAttachment(attachmentFixtures.audioAttachment());

  t.deepEqual(assign({}, outgoingMessage), outgoingMessageFixtures.audioMessage());
});

test(`${titleBase}'s #addAttachmentFromUrl throws error if not passed in strings'`, (t) => {
  t.plan(2);

  const outgoingMessage = createBaseOutgoingMessage();
  try {
    outgoingMessage.addAttachmentFromUrl({ type: 'audio' }, 'SOME_AUDIO_URL');
  } catch (err) {
    t.is(err.message,
      'addAttachmentFromUrl must be called with "type" and "url" arguments of type string');
  }

  try {
    outgoingMessage.addAttachmentFromUrl('audio', { url: 'SOME_AUDIO_URL' });
  } catch (err) {
    t.is(err.message,
      'addAttachmentFromUrl must be called with "type" and "url" arguments of type string');
  }
});

test(`${titleBase}'s #addAttachmentFromUrl throws error if not passed in both type and url'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  try {
    outgoingMessage.addAttachmentFromUrl('audio');
  } catch (err) {
    t.is(err.message,
      'addAttachmentFromUrl must be called with truthy "type" and "url" arguments');
  }
});

test(`${titleBase}'s #addAttachmentFromUrl works when using the right arguments'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addAttachmentFromUrl('audio', 'SOME_AUDIO_URL');

  t.deepEqual(assign({}, outgoingMessage), outgoingMessageFixtures.audioMessage());
});

test(`${titleBase}'s #removeAttachment works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage
    .addAttachment(attachmentFixtures.audioAttachment())
    .removeAttachment();

  const expectedOutgoingMessage = createBaseOutgoingMessage();
  expectedOutgoingMessage.message = {};

  t.deepEqual(outgoingMessage, expectedOutgoingMessage);
});

test(`${titleBase}'s #addQuickReplies properly works without settings text'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  const quickReplies = outgoingMessageFixtures.textOnlyQuickReplyMessage().message.quick_replies;
  outgoingMessage.addQuickReplies(quickReplies);

  t.deepEqual(assign({}, outgoingMessage), outgoingMessageFixtures.textOnlyQuickReplyMessage());
});

test(`${titleBase}'s #addQuickReplies properly works while settings text'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  const quickReplies = outgoingMessageFixtures.textOnlyQuickReplyMessage().message.quick_replies;
  const selectionText = 'Select one of the following:';
  outgoingMessage.addQuickReplies(quickReplies, selectionText);

  const expectedOutgoingMessage = outgoingMessageFixtures.textOnlyQuickReplyMessage();
  expectedOutgoingMessage.message.text = selectionText;

  t.deepEqual(assign({}, outgoingMessage), expectedOutgoingMessage);
});

test(`${titleBase}'s #addPayloadLessQuickReplies throws error if not passed in array of strings'`, (t) => {
  t.plan(2);

  const outgoingMessage = createBaseOutgoingMessage();
  try {
    outgoingMessage.addPayloadLessQuickReplies('not an array');
  } catch (err) {
    t.is(err.message,
      'addPayloadLessQuickReplies needs to be passed in an array of strings as first argument');
  }

  try {
    outgoingMessage.addPayloadLessQuickReplies(['not an array of strings', {}]);
  } catch (err) {
    t.is(err.message,
      'addPayloadLessQuickReplies needs to be passed in an array of strings as first argument');
  }
});

test(`${titleBase}'s #addPayloadLessQuickReplies properly works when passed array of strings'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addPayloadLessQuickReplies(['B1', 'B2']);

  const quickReplies = [
    {
      content_type: 'text',
      title: 'B1',
      payload: 'B1',
    },
    {
      content_type: 'text',
      title: 'B2',
      payload: 'B2',
    },
  ];

  const expectedOutgoingMessage = outgoingMessageFixtures.textOnlyQuickReplyMessage();
  expectedOutgoingMessage.message.quick_replies = quickReplies;

  t.deepEqual(assign({}, outgoingMessage), expectedOutgoingMessage);
});

test(`${titleBase}'s #addLocationQuickReply properly works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addLocationQuickReply();

  t.deepEqual(assign({}, outgoingMessage), outgoingMessageFixtures.locationQuickReplyMessage());
});

test(`${titleBase}'s #removeQuickReplies works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage
    .addLocationQuickReply()
    .removeQuickReplies();

  const expectedOutgoingMessage = createBaseOutgoingMessage();
  expectedOutgoingMessage.message = {};

  t.deepEqual(outgoingMessage, expectedOutgoingMessage);
});

test(`${titleBase}'s #addSenderAction properly works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addSenderAction('typing_on');

  t.deepEqual(assign({}, outgoingMessage), outgoingMessageFixtures.typingOnMessage());
});

test(`${titleBase}'s #removeSenderAction properly works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addSenderAction('some_action').removeSenderAction();

  const expectedOutgoingMessage = createBaseOutgoingMessage();

  t.deepEqual(outgoingMessage, expectedOutgoingMessage);
});

test(`${titleBase}'s #addTypingOnSenderAction properly works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addTypingOnSenderAction();

  t.deepEqual(assign({}, outgoingMessage), outgoingMessageFixtures.typingOnMessage());
});

test(`${titleBase}'s #addTypingOffSenderAction properly works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addTypingOffSenderAction();

  t.deepEqual(assign({}, outgoingMessage), outgoingMessageFixtures.typingOffMessage());
});

test(`${titleBase}'s #addMarkSeenSenderAction properly works'`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage();
  outgoingMessage.addMarkSeenSenderAction();

  t.deepEqual(assign({}, outgoingMessage), outgoingMessageFixtures.markSeenMessage());
});

test(`${titleBase} chaining of all methods works`, (t) => {
  t.plan(1);

  const outgoingMessage = createBaseOutgoingMessage()
    .addText('Hello')
    .removeText()
    .addAttachment({})
    .removeAttachment()
    .addAttachmentFromUrl('image', 'someUrl')
    .removeAttachment()
    .addQuickReplies([])
    .removeQuickReplies()
    .addPayloadLessQuickReplies(['B1', 'B2'], 'select one of')
    .removeQuickReplies()
    .addLocationQuickReply()
    .removeQuickReplies()
    .addSenderAction('some_abstract_action')
    .removeSenderAction()
    .addTypingOnSenderAction()
    .removeSenderAction()
    .addTypingOffSenderAction()
    .removeSenderAction()
    .addMarkSeenSenderAction()
    .removeSenderAction();

  const expectedOutgoingMessage = createBaseOutgoingMessage();
  expectedOutgoingMessage.message = {};

  t.deepEqual(outgoingMessage, expectedOutgoingMessage);
});
