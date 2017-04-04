<a name="BaseBot"></a>

## BaseBot
The class from which all Bot classes mus inherit. It contains all the base
methods that are accessible via all bot classes. Classes that inherit from
BaseBot and want to make implementation specific methods available have to
prepend the method name with an underscore; e.g. in botmaster-messenger:
_getGetStartedButton

**Kind**: global class  

* [BaseBot](#BaseBot)
    * [new BaseBot(settings)](#new_BaseBot_new)
    * _instance_
        * [.sendMessage(message, [sendOptions])](#BaseBot+sendMessage) ⇒ <code>Promise</code>
        * [.sendMessageTo(message, recipientId, [sendOptions])](#BaseBot+sendMessageTo) ⇒ <code>Promise</code>
        * [.sendTextMessageTo(text, recipientId, [sendOptions])](#BaseBot+sendTextMessageTo) ⇒ <code>Promise</code>
        * [.reply(incomingUpdate, text, [sendOptions])](#BaseBot+reply) ⇒ <code>Promise</code>
        * [.sendAttachmentTo(attachment, recipientId, [sendOptions])](#BaseBot+sendAttachmentTo) ⇒ <code>Promise</code>
        * [.sendAttachmentFromUrlTo(type, url, recipientId, [sendOptions])](#BaseBot+sendAttachmentFromUrlTo) ⇒ <code>Promise</code>
        * [.sendDefaultButtonMessageTo(buttonTitles, textOrAttachment,, recipientId, [sendOptions])](#BaseBot+sendDefaultButtonMessageTo) ⇒ <code>Promise</code>
        * [.sendIsTypingMessageTo(recipientId, [sendOptions])](#BaseBot+sendIsTypingMessageTo) ⇒ <code>Promise</code>
        * [.sendCascade(messageArray)](#BaseBot+sendCascade) ⇒ <code>Promise</code>
        * [.sendTextCascadeTo(textArray, recipientId)](#BaseBot+sendTextCascadeTo) ⇒ <code>Promise</code>
        * [.sendRawMessage(rawMessage)](#BaseBot+sendRawMessage) ⇒ <code>Promise</code>
        * [.getUserInfo(userId)](#BaseBot+getUserInfo) ⇒ <code>Promise</code>
    * _static_
        * [.createOutgoingMessage(message)](#BaseBot.createOutgoingMessage) ⇒ <code>OutgoingMessage</code>
        * [.createOutgoingMessageFor(recipientId)](#BaseBot.createOutgoingMessageFor) ⇒ <code>OutgoingMessage</code>

<a name="new_BaseBot_new"></a>

### new BaseBot(settings)
Constructor to the BaseBot class from which all the bot classes inherit.
A set a basic functionalities are defined here that have to be implemented
in the subclasses in order for them to work.


| Param | Type | Description |
| --- | --- | --- |
| settings | <code>object</code> | inheritors of BaseBot take a settings object as first param. |

**Example**  
```js
// In general however, one can instantiate a bot object like this:
const bot = new BaseBotSubClass({ // e.g. MessengerBot
  credentials: <my_base_bot_sub_class_credentials>,
  webhookEnpoint: 'someEndpoint' // only if class requires them
})
```
<a name="BaseBot+sendMessage"></a>

### baseBot.sendMessage(message, [sendOptions]) ⇒ <code>Promise</code>
sendMessage() falls back to the sendMessage implementation of whatever
subclass inherits form BaseBot. The expected format is normally any type of
message object that could be sent on to messenger

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> |  |
| [sendOptions] | <code>boolean</code> | options used for sending the message. e.g. ignoreMiddleware |

**Example**  
```js
// The returned promise for all sendMessage type events resolves with
// a body that looks something like this:
 {
  raw: rawBody, // can be undefined (e.g. if rawBody is directly returned)
  recipient_id: <id_of_user>,
  message_id: <message_id_of_what_was_just_sent>
  sentMessage: <sent_message_object>
 }

// Some platforms may not have either of these parameters. If that's the case,
// the value assigned will be null or some other suitable value as the
// equivalent to Messenger's seq in Telegram.
```
<a name="BaseBot+sendMessageTo"></a>

### baseBot.sendMessageTo(message, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendMessageTo() Just makes it easier to send a message without as much
structure.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | NOT an instance of OutgoingMessage. Use #sendMessage if you want to send instances of OutgoingMessage |
| recipientId | <code>string</code> |  |
| [sendOptions] | <code>object</code> | just options for sending. |

**Example**  
```js
// message object can look something like this:

message: {
 text: 'Some random text'
}
```
<a name="BaseBot+sendTextMessageTo"></a>

### baseBot.sendTextMessageTo(text, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendTextMessageTo() Just makes it easier to send a text message with
minimal structure.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> |  |
| recipientId | <code>string</code> |  |
| [sendOptions] | <code>object</code> | just options for sending. |

<a name="BaseBot+reply"></a>

### baseBot.reply(incomingUpdate, text, [sendOptions]) ⇒ <code>Promise</code>
reply() Another way to easily send a text message. In this case,
we just send the update that came in as is and then the text we
want to send as a reply.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise  

| Param | Type | Description |
| --- | --- | --- |
| incomingUpdate | <code>object</code> |  |
| text | <code>string</code> |  |
| [sendOptions] | <code>object</code> | just options for sending. |

<a name="BaseBot+sendAttachmentTo"></a>

### baseBot.sendAttachmentTo(attachment, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendAttachmentTo() makes it easier to send an attachment message with
less structure.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise  

| Param | Type | Description |
| --- | --- | --- |
| attachment | <code>object</code> |  |
| recipientId | <code>string</code> |  |
| [sendOptions] | <code>object</code> | just options for sending. |

**Example**  
```js
// attachment object typically looks something like this:

const attachment = {
  type: 'image',
  payload: {
    url: "some_valid_url_of_some_image"
  },
};
```
<a name="BaseBot+sendAttachmentFromUrlTo"></a>

### baseBot.sendAttachmentFromUrlTo(type, url, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendAttachmentFromUrlTo() makes it easier to send an attachment message with
minimal structure.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> |  |
| url | <code>string</code> |  |
| recipientId | <code>string</code> |  |
| [sendOptions] | <code>object</code> | just options for sending. |

<a name="BaseBot+sendDefaultButtonMessageTo"></a>

### baseBot.sendDefaultButtonMessageTo(buttonTitles, textOrAttachment,, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendDefaultButtonMessageTo() makes it easier to send a default set of
buttons. The default button type is the Messenger quick_replies, where
the payload is the same as the button title and the content_type is text.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise  

| Param | Type | Description |
| --- | --- | --- |
| buttonTitles | <code>Array</code> |  |
| textOrAttachment, | <code>string</code> \| <code>object</code> | if falsy, will be set to a default text of "Please select one of:" |
| recipientId | <code>string</code> |  |
| [sendOptions] | <code>object</code> |  |

<a name="BaseBot+sendIsTypingMessageTo"></a>

### baseBot.sendIsTypingMessageTo(recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendIsTypingMessageTo() just sets the is typing status to the platform
if available.
based on the passed in update


i.e. it has no message_id (or it is null/undefined)

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise  

| Param | Type |
| --- | --- |
| recipientId | <code>string</code> | 
| [sendOptions] | <code>object</code> | 

**Example**  
```js
// the returned value is different from the standard one. It looks something
//like this in this case:

{
  recipient_id: <id_of_user>
}
```
<a name="BaseBot+sendCascade"></a>

### baseBot.sendCascade(messageArray) ⇒ <code>Promise</code>
sendCascadeTo() allows developers to send a cascade of messages
in a sequence. All types of messages can be sent (including raw messages).

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise
The returned value an in-place array of bodies received from the client platform
The objects of the array are of the same format as for standard messages  

| Param | Type | Description |
| --- | --- | --- |
| messageArray | <code>Array</code> | of messages in a format as such: [{raw: someRawObject}, {message: some valid outgoingMessage}] |

<a name="BaseBot+sendTextCascadeTo"></a>

### baseBot.sendTextCascadeTo(textArray, recipientId) ⇒ <code>Promise</code>
sendTextCascadeTo() is simply a helper function around sendCascadeTo.
It allows developers to send a cascade of text messages more easily.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise
The returned value an in-place array of bodies received from the client platform
The objects of the array are of the same format as for standard messages  

| Param | Type | Description |
| --- | --- | --- |
| textArray | <code>Array</code> | of messages in a format as such: ['message1', 'message2'] |
| recipientId | <code>string</code> | just the id of the recipient to send the messages to. |

<a name="BaseBot+sendRawMessage"></a>

### baseBot.sendRawMessage(rawMessage) ⇒ <code>Promise</code>
sendRawMessage() simply sends a raw platform dependent message. This method
calls __sendMessage in each botClass without calling formatOutgoingMessage
before. It's really just sugar around __sendMessage which shouldn't be used
directly.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise  

| Param | Type |
| --- | --- |
| rawMessage | <code>Object</code> | 

<a name="BaseBot+getUserInfo"></a>

### baseBot.getUserInfo(userId) ⇒ <code>Promise</code>
Retrieves the basic user info from a user if platform supports it

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves into the user info or an empty
object by default  

| Param | Type |
| --- | --- |
| userId | <code>string</code> | 

<a name="BaseBot.createOutgoingMessage"></a>

### BaseBot.createOutgoingMessage(message) ⇒ <code>OutgoingMessage</code>
#createOutgoingMessage exposes the OutgoingMessage constructor
via BaseBot. This simply means one can create their own
OutgoingMessage object using any bot object. They can then compose
it with all its helper functions

**Kind**: static method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>OutgoingMessage</code> - outgoingMessage. The same object passed in with
all the helper functions from OutgoingMessage  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | base object that the outgoing Message should be based on |

<a name="BaseBot.createOutgoingMessageFor"></a>

### BaseBot.createOutgoingMessageFor(recipientId) ⇒ <code>OutgoingMessage</code>
same as #createOutgoingMessage, creates empty outgoingMessage with
id of the recipient set. Again, this is jut sugar syntax for creating a
new outgoingMessage object

**Kind**: static method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>OutgoingMessage</code> - outgoingMessage. A valid OutgoingMessage object with recipient set.  

| Param | Type | Description |
| --- | --- | --- |
| recipientId | <code>string</code> | id of the recipient the message is for |

