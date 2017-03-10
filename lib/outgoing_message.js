'use strict';

const assign = require('lodash').assign;

class OugtoingMessage {

  constructor(message) {
    if (!message) {
      throw new Error('OutgoingMessage constructor needs to be initialised with a message object');
    } else if (typeof message !== 'object') {
      throw new TypeError('OutgoingMessage constructor takes in an object as param');
    }
    assign(this, message);
  }

  addText(text) {

  }

  removeText() {

  }

  addAttachment(attachment) {
    //
  }

  addAttachmentFromUrl(type, url) {
    //
  }

  removeAttachment() {

  }

  addQuickReplies() {

  }

  removeQuickReplies() {

  }

  addTextOnlyQuickReplies() {

  }

  addSenderAction() {

  }

  removeSenderAction() {

  }

  get() {
    return this.message;
  }
}

module.exports = OugtoingMessage;
