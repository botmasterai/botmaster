'use strict';

const assign = require('lodash').assign;
const has = require('lodash').has;
const set = require('lodash').set;
const unset = require('lodash').unset;

class OutgoingMessage {

  constructor(message) {
    if (!message) {
      message = {};
    }
    if (typeof message !== 'object') {
      throw new TypeError('OutgoingMessage constructor takes in an object as param');
    }
    assign(this, message);

    return this;
  }

  __addProperty(path, nameForError, value) {
    if (!value) {
      throw new Error(`${nameForError} must have a value. Can't be ${value}`);
    } else if (has(this, path)) {
      throw new Error(`Can't add ${nameForError} to outgoingMessage that already has ${nameForError}`);
    }
    set(this, path, value);

    return this;
  }

  __removeProperty(path, nameForError) {
    if (!has(this, path)) {
      throw new Error(`Can't remove ${nameForError} from outgoingMessage that doesn't have any ${nameForError}`);
    }
    unset(this, path);

    return this;
  }

  addRecipientById(id) {
    const recipient = {
      id,
    };
    return this.__addProperty('recipient', 'recipient', recipient);
  }

  addRecipientByPhoneNumber(phoneNumber) {
    const recipient = {
      phone_number: phoneNumber,
    };
    return this.__addProperty('recipient', 'recipient', recipient);
  }

  removeRecipient() {
    return this.__removeProperty('recipient', 'recipient');
  }

  addText(text) {
    return this.__addProperty('message.text', 'text', text);
  }

  removeText() {
    return this.__removeProperty('message.text', 'text');
  }

  addAttachment(attachment) {
    return this.__addProperty('message.attachment', 'attachment', attachment);
  }

  addAttachmentFromUrl(type, url) {
    if (!type || !url) {
      throw new Error('addAttachmentFromUrl must be called with truthy "type" and "url" arguments');
    }
    if (typeof type !== 'string' || typeof url !== 'string') {
      throw new TypeError('addAttachmentFromUrl must be called with "type" and "url" arguments of type string');
    }
    const attachment = {
      type,
      payload: {
        url,
      },
    };

    return this.addAttachment(attachment);
  }

  removeAttachment() {
    return this.__removeProperty('message.attachment', 'attachment');
  }

  addQuickReplies(quickReplies, text) {
    if (!text) {
      text = 'Pick one of the following:';
    }
    this.__addProperty('message.text', 'text', text);

    return this.__addProperty('message.quick_replies', 'quick_replies', quickReplies);
  }


  addPayloadLessQuickReplies(quickRepliesTitles, text) {
    const errorText = 'addPayloadLessQuickReplies needs to be passed in an array of strings as first argument';
    if (!(quickRepliesTitles instanceof Array)) {
      throw new TypeError(errorText);
    }
    const quickReplies = [];
    for (const title of quickRepliesTitles) {
      if (typeof title !== 'string') {
        throw new TypeError(errorText);
      }
      const quickReply = {
        title,
        payload: title,
        content_type: 'text',
      };
      quickReplies.push(quickReply);
    }

    return this.addQuickReplies(quickReplies, text);
  }

  addLocationQuickReply(text) {
    if (!text) {
      text = 'Please share your location:';
    }
    const locationQuickReply = [
      {
        content_type: 'location',
      },
    ];

    return this.addQuickReplies(locationQuickReply, text);
  }

  removeQuickReplies() {
    this.__removeProperty('message.text', 'text');
    return this.__removeProperty('message.quick_replies', 'quick_replies');
  }

  addSenderAction(senderAction) {
    return this.__addProperty('sender_action', 'sender_action', senderAction);
  }

  removeSenderAction() {
    return this.__removeProperty('sender_action', 'sender_action');
  }

  addTypingOnSenderAction() {
    return this.__addProperty('sender_action', 'sender_action', 'typing_on');
  }

  addTypingOffSenderAction() {
    return this.__addProperty('sender_action', 'sender_action', 'typing_off');
  }

  addMarkSeenSenderAction() {
    return this.__addProperty('sender_action', 'sender_action', 'mark_seen');
  }
}

module.exports = OutgoingMessage;
