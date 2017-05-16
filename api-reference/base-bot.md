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
        * [.createOutgoingMessage(message)](#BaseBot+createOutgoingMessage) ⇒ <code>OutgoingMessage</code>
        * [.createOutgoingMessageFor(recipientId)](#BaseBot+createOutgoingMessageFor) ⇒ <code>OutgoingMessage</code>
        * [.sendMessage(message, [sendOptions])](#BaseBot+sendMessage) ⇒ <code>Promise</code>
        * [.sendMessageTo(message, recipientId, [sendOptions])](#BaseBot+sendMessageTo) ⇒ <code>Promise</code>
        * [.sendTextMessageTo(text, recipientId, [sendOptions])](#BaseBot+sendTextMessageTo) ⇒ <code>Promise</code>
        * [.reply(incomingUpdate, text, [sendOptions])](#BaseBot+reply) ⇒ <code>Promise</code>
        * [.sendAttachmentTo(attachment, recipientId, [sendOptions])](#BaseBot+sendAttachmentTo) ⇒ <code>Promise</code>
        * [.sendAttachmentFromUrlTo(type, url, recipientId, [sendOptions])](#BaseBot+sendAttachmentFromUrlTo) ⇒ <code>Promise</code>
        * [.sendDefaultButtonMessageTo(buttonTitles, textOrAttachment, recipientId, [sendOptions])](#BaseBot+sendDefaultButtonMessageTo) ⇒ <code>Promise</code>
        * [.sendIsTypingMessageTo(recipientId, [sendOptions])](#BaseBot+sendIsTypingMessageTo) ⇒ <code>Promise</code>
        * [.sendCascade(messageArray, [sendOptions])](#BaseBot+sendCascade) ⇒ <code>Promise</code>
        * [.sendTextCascadeTo(textArray, recipientId, [sendOptions])](#BaseBot+sendTextCascadeTo) ⇒ <code>Promise</code>
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
<a name="BaseBot+createOutgoingMessage"></a>

### baseBot.createOutgoingMessage(message) ⇒ <code>OutgoingMessage</code>
createOutgoingMessage exposes the OutgoingMessage constructor
via BaseBot. This simply means one can create their own
OutgoingMessage object using any bot object. They can then compose
it with all its helper functions

This is the instance version of this method

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>OutgoingMessage</code> - outgoingMessage. The same object passed in with
all the helper functions from OutgoingMessage  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | base object that the outgoing Message should be based on |

<a name="BaseBot+createOutgoingMessageFor"></a>

### baseBot.createOutgoingMessageFor(recipientId) ⇒ <code>OutgoingMessage</code>
same as #createOutgoingMessage, creates empty outgoingMessage with
id of the recipient set. Again, this is jut sugar syntax for creating a
new outgoingMessage object

This is the instance version of this method

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>OutgoingMessage</code> - outgoingMessage. A valid OutgoingMessage object with recipient set.  

| Param | Type | Description |
| --- | --- | --- |
| recipientId | <code>string</code> | id of the recipient the message is for |

<a name="BaseBot+sendMessage"></a>

### baseBot.sendMessage(message, [sendOptions]) ⇒ <code>Promise</code>
sendMessage() falls back to the sendMessage implementation of whatever
subclass inherits form BaseBot. The expected format is normally any type of
message object that could be sent on to messenger

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves with a body object (see example)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> |  |
| [sendOptions] | <code>boolean</code> | an object containing options regarding the sending of the message. Currently the only valid options is: `ignoreMiddleware`. |

**Example**  
```js
const outgoingMessage = bot.createOutgoingMessageFor(update.sender.id);
outgoingMessage.addText('Hello world');

bot.sendMessage(outgoingMessage);
```
**Example**  
```js
// The returned promise for all sendMessage type events resolves with
// a body that looks something like this:
 {
  sentOutgoingMessage: // the OutgoingMessage instance before being formatted
  sentRawMessage: // the OutgoingMessage object after being formatted for the platforms
  raw: rawBody, // the raw response from the platforms received from sending the message
  recipient_id: <id_of_user>,
  message_id: <message_id_of_what_was_just_sent>
 }

// Some platforms may not have either of these parameters. If that's the case,
// the value assigned will be a falsy value
```
<a name="BaseBot+sendMessageTo"></a>

### baseBot.sendMessageTo(message, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendMessageTo() Just makes it easier to send a message without as much
structure.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves with a body object
(see `sendMessage` example)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>object</code> | NOT an instance of OutgoingMessage. Use #sendMessage if you want to send instances of OutgoingMessage |
| recipientId | <code>string</code> | a string representing the id of the user to whom you want to send the message. |
| [sendOptions] | <code>object</code> | see `sendOptions` for `sendMessage` |

**Example**  
```js
// message object can look something like this:
// as you can see, this is not an OutgoingMessage instance
const message = {
 text: 'Some random text'
}

bot.sendMessageTo(message, update.sender.id);
```
<a name="BaseBot+sendTextMessageTo"></a>

### baseBot.sendTextMessageTo(text, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendTextMessageTo() Just makes it easier to send a text message with
minimal structure.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves with a body object
(see `sendMessage` example)  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> |  |
| recipientId | <code>string</code> | a string representing the id of the user to whom you want to send the message. |
| [sendOptions] | <code>object</code> | see `sendOptions` for `sendMessage` |

**Example**  
```js
bot.sendTextMessageTo('something super important', update.sender.id);
```
<a name="BaseBot+reply"></a>

### baseBot.reply(incomingUpdate, text, [sendOptions]) ⇒ <code>Promise</code>
reply() Another way to easily send a text message. In this case,
we just send the update that came in as is and then the text we
want to send as a reply.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves with a body object
(see `sendMessage` example)  

| Param | Type | Description |
| --- | --- | --- |
| incomingUpdate | <code>object</code> |  |
| text | <code>string</code> | text to send to the user associated with the received update |
| [sendOptions] | <code>object</code> | see `sendOptions` for `sendMessage` |

**Example**  
```js
bot.reply(update, 'something super important!');
```
<a name="BaseBot+sendAttachmentTo"></a>

### baseBot.sendAttachmentTo(attachment, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendAttachmentTo() makes it easier to send an attachment message with
less structure.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves with a body object
(see `sendMessage` example)  

| Param | Type | Description |
| --- | --- | --- |
| attachment | <code>object</code> | a valid Messenger style attachment. See [here](https://developers.facebook.com/docs/messenger-platform/send-api-reference) for more on that. |
| recipientId | <code>string</code> | a string representing the id of the user to whom you want to send the message. |
| [sendOptions] | <code>object</code> | see `sendOptions` for `sendMessage` |

**Example**  
```js
// attachment object typically looks something like this:
const attachment = {
  type: 'image',
  payload: {
    url: "some_valid_url_of_some_image"
  },
};

bot.sendAttachmentTo(attachment, update.sender.id);
```
<a name="BaseBot+sendAttachmentFromUrlTo"></a>

### baseBot.sendAttachmentFromUrlTo(type, url, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendAttachmentFromUrlTo() makes it easier to send an attachment message with
minimal structure.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves with a body object
(see `sendMessage` example)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | string representing the type of attachment (audio, video, image or file) |
| url | <code>string</code> | the url to your file |
| recipientId | <code>string</code> | a string representing the id of the user to whom you want to send the message. |
| [sendOptions] | <code>object</code> | see `sendOptions` for `sendMessage` |

**Example**  
```js
bot.sendAttachmentFromURLTo('image', "some image url you've got", update.sender.id);
```
<a name="BaseBot+sendDefaultButtonMessageTo"></a>

### baseBot.sendDefaultButtonMessageTo(buttonTitles, textOrAttachment, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendDefaultButtonMessageTo() makes it easier to send a default set of
buttons. The default button type is the Messenger quick_replies, where
the payload is the same as the button title and the content_type is text.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves with a body object
(see `sendMessage` example)  

| Param | Type | Description |
| --- | --- | --- |
| buttonTitles | <code>Array</code> | array of button titles (no longer than 10 in size). |
| textOrAttachment | <code>string_OR_object</code> | a string or an attachment object similar to the ones required in `bot.sendAttachmentTo`. This is meant to provide context to the buttons. I.e. why are there buttons here. A piece of text or an attachment could detail that. If falsy, text will be added that reads: 'Please select one of:'. |
| recipientId | <code>string</code> | a string representing the id of the user to whom you want to send the message. |
| [sendOptions] | <code>object</code> | see `sendOptions` for `sendMessage` |

**Example**  
```js
const buttonArray = ['button1', 'button2'];
bot.sendDefaultButtonMessageTo(buttonArray,
  'Please select "button1" or "button2"', update.sender.id,);
```
<a name="BaseBot+sendIsTypingMessageTo"></a>

### baseBot.sendIsTypingMessageTo(recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendIsTypingMessageTo() just sets the is typing status to the platform
if available.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves with a body object
(see `sendMessage` example)  

| Param | Type | Description |
| --- | --- | --- |
| recipientId | <code>string</code> | a string representing the id of the user to whom you want to send the message. |
| [sendOptions] | <code>object</code> | see `sendOptions` for `sendMessage` |

**Example**  
```js
bot.sendIsTypingMessageTo(update.sender.id);
// the returned value is different from the standard one. it won't have a message_id
```
<a name="BaseBot+sendCascade"></a>

### baseBot.sendCascade(messageArray, [sendOptions]) ⇒ <code>Promise</code>
sendCascade() allows developers to send a cascade of messages
in a sequence. All types of messages can be sent (including raw messages).

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves with an array of body objects
(see `sendMessage` example for one said object)  

| Param | Type | Description |
| --- | --- | --- |
| messageArray | <code>Array</code> | of messages in a format as such: [{raw: someRawObject}, {message: some valid outgoingMessage}] |
| [sendOptions] | <code>object</code> | see `sendOptions` for `sendMessage`. will only apply to non rawMessages. (remember that for rawMessages, outgoing middleware is bypassed anyways). |

**Example**  
```js
const rawMessage1 = {
  nonStandard: 'message1',
  recipient: {
    id: 'user_id',
  },
};
const message2 = bot.createOutgoingMessageFor(update.sender.id);
message2.addText('some text');

const messageArray = [{ raw: rawMessage1 }, { message: message2 }];

bot.sendCascade(messageArray);
```
<a name="BaseBot+sendTextCascadeTo"></a>

### baseBot.sendTextCascadeTo(textArray, recipientId, [sendOptions]) ⇒ <code>Promise</code>
sendTextCascadeTo() is simply a helper function around sendCascadeTo.
It allows developers to send a cascade of text messages more easily.

**Kind**: instance method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>Promise</code> - promise that resolves with an array of body objects
(see `sendMessage` example for one said object)  

| Param | Type | Description |
| --- | --- | --- |
| textArray | <code>Array</code> | of messages. |
| recipientId | <code>string</code> | a string representing the id of the user to whom you want to send the message. |
| [sendOptions] | <code>object</code> | see `sendOptions` for `sendMessage` |

**Example**  
```js
bot.sendTextCascadeTo(['message1', 'message2'], user.sender.id);
```
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
createOutgoingMessage exposes the OutgoingMessage constructor
via BaseBot. This simply means one can create their own
OutgoingMessage object using any bot object. They can then compose
it with all its helper functions

This is the static version of this method

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

This is the static version of this method

**Kind**: static method of <code>[BaseBot](#BaseBot)</code>  
**Returns**: <code>OutgoingMessage</code> - outgoingMessage. A valid OutgoingMessage object with recipient set.  

| Param | Type | Description |
| --- | --- | --- |
| recipientId | <code>string</code> | id of the recipient the message is for |

