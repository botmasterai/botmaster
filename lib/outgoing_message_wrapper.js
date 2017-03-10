'use strict';

class OugtoingMessageWrapper {

  constructor(message) {
    // that's wrong. I want the object to basically be like a plain message
    // object but with added methods. I.e. the stuff inside message has to
    // be added to this! (probably a lodash thing to do here);
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
