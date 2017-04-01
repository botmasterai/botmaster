'use strict';

const assign = require('lodash').assign;
const has = require('lodash').has;
const set = require('lodash').set;
const unset = require('lodash').unset;

/**
 * This class will help you compose sendable message objects.
 */

class OutgoingMessage {

  /**
   * Constructor to the OutgoingMessage class. Takes in an optional
   * message object that it will use as its base to add the OutgoingMessage
   * methods to. This constructor is not actually exposed in the public API.
   * In order to instantiate an OutgoingMessage object, you'll need to use the
   * createOutgoingMessage and createOutgoingMessageFor methods provided with
   * all classes that inherit from BaseBot. There are static and non-static
   * versions of both methods to make sure you can do so wherever as you wish
   *
   * @private
   * @param {object} [message] the base object to convert into an OutgoingMessage object
   */
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

  /**
   * Adds recipient.id param to the OutgoingMessage object. This is most
   * likely what you will want to do to add a recipient. Alternatively, you Can
   * use addRecipientByPhoneNumber if the platform you are sending the message to
   * supports that.
   *
   * @param {string} id the id to add to the OutgoingMessage object
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addRecipientById(id) {
    const recipient = {
      id,
    };
    return this.__addProperty('recipient', 'recipient', recipient);
  }

  /**
   * Adds recipient.phone_number param to the OutgoingMessage object.
   * You might prefer to add a recipient by id rather. This is achieved via
   * addRecipientById
   *
   * @param {string} phoneNumber the phone number to add to the OutgoingMessage object
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addRecipientByPhoneNumber(phoneNumber) {
    const recipient = {
      phone_number: phoneNumber,
    };
    return this.__addProperty('recipient', 'recipient', recipient);
  }

  /**
   * removes the recipient param from the OutgoingMessage object.
   * This will remove the object wether it was set with a phone number or an id
   *
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  removeRecipient() {
    return this.__removeProperty('recipient', 'recipient');
  }

  /**
   * Adds message.text to the OutgoingMessage
   *
   * @param {string} text the text to add to the OutgoingMessage object
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addText(text) {
    return this.__addProperty('message.text', 'text', text);
  }

  /**
   * Removes the message.text param from the OutgoingMessage object.
   *
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  removeText() {
    return this.__removeProperty('message.text', 'text');
  }

  /**
   * Adds message.attachment to the OutgoingMessage. If you want to add
   * an attachment simply from a type and a url, have a look at:
   * addAttachmentFromUrl
   *
   * @param {object} attachment valid messenger type attachment that can be
   * formatted by the platforms your bot uses
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addAttachment(attachment) {
    return this.__addProperty('message.attachment', 'attachment', attachment);
  }

  /**
   * Adds message.attachment from a type and url without requiring you to
   * provide the whole attachment object. If you want to add an attachment using
   * a full object, use addAttachment.
   *
   * @param {string} type the attachment type (audio, video, image, file)
   * @param {string} url the url of the attachment.
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
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

  /**
   * Removes message.attachment param from the OutgoingMessage object.
   *
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  removeAttachment() {
    return this.__removeProperty('message.attachment', 'attachment');
  }

  /**
   * Adds message.quick_replies to the OutgoinMessage object. Use
   * addPayloadLessQuickReplies if you just want to add quick replies from an
   * array of titles
   *
   * @param {Array} quickReplies The quick replies objects to add to the
   * OutgoingMessage
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addQuickReplies(quickReplies) {
    return this.__addProperty('message.quick_replies', 'quick_replies', quickReplies);
  }

  /**
   * Adds message.quick_replies to the OutgoinMessage object from a simple array
   * of quick replies titles.Use addQuickReplies if want to add quick replies
   * from an quick reply objects
   *
   * @param {Array} quickRepliesTitles The titles of the quick replies objects to add to the
   * OutgoingMessage
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addPayloadLessQuickReplies(quickRepliesTitles) {
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

    return this.addQuickReplies(quickReplies);
  }

  /**
   * Adds a content_type: location message.quick_replies to the OutgoingMessage.
   * Use this if the platform the bot class you are using is based on supports
   * asking for the location to its users. 
   *
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addLocationQuickReply() {
    const locationQuickReply = [
      {
        content_type: 'location',
      },
    ];

    return this.addQuickReplies(locationQuickReply);
  }

  /**
   * Removes message.quick_replies param from the OutgoingMessage object.
   *
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  removeQuickReplies() {
    return this.__removeProperty('message.quick_replies', 'quick_replies');
  }

  /**
   * Adds an arbitrary sender_action to the OutgoinMessage
   * @param {string} senderAction Arbitrary sender action
   * (typing_on, typing_off or mark_seens)
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addSenderAction(senderAction) {
    return this.__addProperty('sender_action', 'sender_action', senderAction);
  }

  /**
   * Adds "typing_on" sender_action to the OutgoinMessage
   *
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addTypingOnSenderAction() {
    return this.__addProperty('sender_action', 'sender_action', 'typing_on');
  }

  /**
   * Adds "typing_off" sender_action to the OutgoinMessage
   *
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addTypingOffSenderAction() {
    return this.__addProperty('sender_action', 'sender_action', 'typing_off');
  }

  /**
   * Adds "mark_seen" sender_action to the OutgoinMessage
   *
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  addMarkSeenSenderAction() {
    return this.__addProperty('sender_action', 'sender_action', 'mark_seen');
  }

  /**
   * Removes sender_action param from the OutgoingMessage object.
   *
   * @return {OutgoinMessage} returns this object to allow for chaining of methods.
   */
  removeSenderAction() {
    return this.__removeProperty('sender_action', 'sender_action');
  }
}

module.exports = OutgoingMessage;
