'use strict';

class OugtoingMessageWrapper {

  constructor(message) {
    this.message = message;
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

module.exports = OugtoingMessageWrapper;
