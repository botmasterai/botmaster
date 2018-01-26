<a name="OutgoingMessage"></a>

## OutgoingMessage
This class will help you compose sendable message objects.

**Kind**: global class  

* [OutgoingMessage](#OutgoingMessage)
    * [new OutgoingMessage([message])](#new_OutgoingMessage_new)
    * [.addRecipientById(id)](#OutgoingMessage+addRecipientById) ⇒ <code>OutgoinMessage</code>
    * [.addRecipientByPhoneNumber(phoneNumber)](#OutgoingMessage+addRecipientByPhoneNumber) ⇒ <code>OutgoinMessage</code>
    * [.removeRecipient()](#OutgoingMessage+removeRecipient) ⇒ <code>OutgoinMessage</code>
    * [.addText(text)](#OutgoingMessage+addText) ⇒ <code>OutgoinMessage</code>
    * [.removeText()](#OutgoingMessage+removeText) ⇒ <code>OutgoinMessage</code>
    * [.addAttachment(attachment)](#OutgoingMessage+addAttachment) ⇒ <code>OutgoinMessage</code>
    * [.addAttachmentFromUrl(type, url)](#OutgoingMessage+addAttachmentFromUrl) ⇒ <code>OutgoinMessage</code>
    * [.removeAttachment()](#OutgoingMessage+removeAttachment) ⇒ <code>OutgoinMessage</code>
    * [.addQuickReplies(quickReplies)](#OutgoingMessage+addQuickReplies) ⇒ <code>OutgoinMessage</code>
    * [.addPayloadLessQuickReplies(quickRepliesTitles)](#OutgoingMessage+addPayloadLessQuickReplies) ⇒ <code>OutgoinMessage</code>
    * [.addLocationQuickReply()](#OutgoingMessage+addLocationQuickReply) ⇒ <code>OutgoinMessage</code>
    * [.removeQuickReplies()](#OutgoingMessage+removeQuickReplies) ⇒ <code>OutgoinMessage</code>
    * [.addSenderAction(senderAction)](#OutgoingMessage+addSenderAction) ⇒ <code>OutgoinMessage</code>
    * [.addTypingOnSenderAction()](#OutgoingMessage+addTypingOnSenderAction) ⇒ <code>OutgoinMessage</code>
    * [.addTypingOffSenderAction()](#OutgoingMessage+addTypingOffSenderAction) ⇒ <code>OutgoinMessage</code>
    * [.addMarkSeenSenderAction()](#OutgoingMessage+addMarkSeenSenderAction) ⇒ <code>OutgoinMessage</code>
    * [.removeSenderAction()](#OutgoingMessage+removeSenderAction) ⇒ <code>OutgoinMessage</code>

<a name="new_OutgoingMessage_new"></a>

### new OutgoingMessage([message])
Constructor to the OutgoingMessage class. Takes in an optional
message object that it will use as its base to add the OutgoingMessage
methods to. This constructor is not actually exposed in the public API.
In order to instantiate an OutgoingMessage object, you'll need to use the
createOutgoingMessage and createOutgoingMessageFor methods provided with
all classes that inherit from BaseBot. There are static and non-static
versions of both methods to make sure you can do so wherever as you wish


| Param | Type | Description |
| --- | --- | --- |
| [message] | <code>object</code> | the base object to convert into an OutgoingMessage object |

<a name="OutgoingMessage+addRecipientById"></a>

### outgoingMessage.addRecipientById(id) ⇒ <code>OutgoinMessage</code>
Adds `recipient.id` param to the OutgoingMessage object. This is most
likely what you will want to do to add a recipient. Alternatively, you Can
use addRecipientByPhoneNumber if the platform you are sending the message to
supports that.

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | the id to add to the OutgoingMessage object |

<a name="OutgoingMessage+addRecipientByPhoneNumber"></a>

### outgoingMessage.addRecipientByPhoneNumber(phoneNumber) ⇒ <code>OutgoinMessage</code>
Adds `recipient.phone_number` param to the OutgoingMessage object.
You might prefer to add a recipient by id rather. This is achieved via
addRecipientById

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  

| Param | Type | Description |
| --- | --- | --- |
| phoneNumber | <code>string</code> | the phone number to add to the OutgoingMessage object |

<a name="OutgoingMessage+removeRecipient"></a>

### outgoingMessage.removeRecipient() ⇒ <code>OutgoinMessage</code>
removes the `recipient` param from the OutgoingMessage object.
This will remove the object wether it was set with a phone number or an id

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  
<a name="OutgoingMessage+addText"></a>

### outgoingMessage.addText(text) ⇒ <code>OutgoinMessage</code>
Adds `message.text` to the OutgoingMessage

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | the text to add to the OutgoingMessage object |

<a name="OutgoingMessage+removeText"></a>

### outgoingMessage.removeText() ⇒ <code>OutgoinMessage</code>
Removes the `message.text` param from the OutgoingMessage object.

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  
<a name="OutgoingMessage+addAttachment"></a>

### outgoingMessage.addAttachment(attachment) ⇒ <code>OutgoinMessage</code>
Adds `message.attachment` to the OutgoingMessage. If you want to add
an attachment simply from a type and a url, have a look at:
addAttachmentFromUrl

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  

| Param | Type | Description |
| --- | --- | --- |
| attachment | <code>object</code> | valid messenger type attachment that can be formatted by the platforms your bot uses |

<a name="OutgoingMessage+addAttachmentFromUrl"></a>

### outgoingMessage.addAttachmentFromUrl(type, url) ⇒ <code>OutgoinMessage</code>
Adds `message.attachment` from a type and url without requiring you to
provide the whole attachment object. If you want to add an attachment using
a full object, use addAttachment.

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | the attachment type (audio, video, image, file) |
| url | <code>string</code> | the url of the attachment. |

<a name="OutgoingMessage+removeAttachment"></a>

### outgoingMessage.removeAttachment() ⇒ <code>OutgoinMessage</code>
Removes `message.attachment` param from the OutgoingMessage object.

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  
<a name="OutgoingMessage+addQuickReplies"></a>

### outgoingMessage.addQuickReplies(quickReplies) ⇒ <code>OutgoinMessage</code>
Adds `message.quick_replies` to the OutgoinMessage object. Use
addPayloadLessQuickReplies if you just want to add quick replies from an
array of titles

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  

| Param | Type | Description |
| --- | --- | --- |
| quickReplies | <code>Array</code> | The quick replies objects to add to the OutgoingMessage |

<a name="OutgoingMessage+addPayloadLessQuickReplies"></a>

### outgoingMessage.addPayloadLessQuickReplies(quickRepliesTitles) ⇒ <code>OutgoinMessage</code>
Adds `message.quick_replies` to the OutgoinMessage object from a simple array
of quick replies titles.Use addQuickReplies if want to add quick replies
from an quick reply objects

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  

| Param | Type | Description |
| --- | --- | --- |
| quickRepliesTitles | <code>Array</code> | The titles of the quick replies objects to add to the OutgoingMessage |

<a name="OutgoingMessage+addLocationQuickReply"></a>

### outgoingMessage.addLocationQuickReply() ⇒ <code>OutgoinMessage</code>
Adds a `content_type: location` message.quick_replies to the OutgoingMessage.
Use this if the platform the bot class you are using is based on supports
asking for the location to its users.

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  
<a name="OutgoingMessage+removeQuickReplies"></a>

### outgoingMessage.removeQuickReplies() ⇒ <code>OutgoinMessage</code>
Removes `message.quick_replies` param from the OutgoingMessage object.

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  
<a name="OutgoingMessage+addSenderAction"></a>

### outgoingMessage.addSenderAction(senderAction) ⇒ <code>OutgoinMessage</code>
Adds an arbitrary `sender_action` to the OutgoinMessage

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  

| Param | Type | Description |
| --- | --- | --- |
| senderAction | <code>string</code> | Arbitrary sender action (typing_on, typing_off or mark_seens) |

<a name="OutgoingMessage+addTypingOnSenderAction"></a>

### outgoingMessage.addTypingOnSenderAction() ⇒ <code>OutgoinMessage</code>
Adds `sender_action: typing_on` to the OutgoinMessage

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  
<a name="OutgoingMessage+addTypingOffSenderAction"></a>

### outgoingMessage.addTypingOffSenderAction() ⇒ <code>OutgoinMessage</code>
Adds `sender_action: typing_off`  to the OutgoinMessage

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  
<a name="OutgoingMessage+addMarkSeenSenderAction"></a>

### outgoingMessage.addMarkSeenSenderAction() ⇒ <code>OutgoinMessage</code>
Adds `sender_action: mark_seen`  to the OutgoinMessage

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  
<a name="OutgoingMessage+removeSenderAction"></a>

### outgoingMessage.removeSenderAction() ⇒ <code>OutgoinMessage</code>
Removes `sender_action` param from the OutgoingMessage object.

**Kind**: instance method of [<code>OutgoingMessage</code>](#OutgoingMessage)  
**Returns**: <code>OutgoinMessage</code> - returns this object to allow for chaining of methods.  
