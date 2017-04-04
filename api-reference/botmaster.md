<a name="Botmaster"></a>

## Botmaster
The Botmaster class to rule them all

**Kind**: global class  

* [Botmaster](#Botmaster)
    * [new Botmaster(settings)](#new_Botmaster_new)
    * [.addBot(bot)](#Botmaster+addBot) ⇒ <code>[Botmaster](#Botmaster)</code>
    * [.getBot(options)](#Botmaster+getBot) ⇒ <code>BaseBot</code>
    * [.getBots(botType)](#Botmaster+getBots) ⇒ <code>Array</code>
    * [.removeBot(bot)](#Botmaster+removeBot) ⇒ <code>[Botmaster](#Botmaster)</code>
    * [.use(middleware)](#Botmaster+use) ⇒ <code>[Botmaster](#Botmaster)</code>
    * [.useWrapped(incomingMiddleware, outgoingMiddleware)](#Botmaster+useWrapped) ⇒ <code>[Botmaster](#Botmaster)</code>

<a name="new_Botmaster_new"></a>

### new Botmaster(settings)
sets up a botmaster object attached to the correct server if one is set
as a parameter. If not, it creates its own http server


| Param | Type |
| --- | --- |
| settings | <code>object</code> | 

**Example**  
```js
// attach the botmaster generated server to port 5000 rather than the default 3000
const botmaster = new Botmaster({
  port: 5000,
});
```
**Example**  
```js
const http = require('http');

const myServer = http.createServer()
// use my own server rather than letting botmaster creat its own.
const botmaster = new Botmaster({
  server: myServer,
});
```
<a name="Botmaster+addBot"></a>

### botmaster.addBot(bot) ⇒ <code>[Botmaster](#Botmaster)</code>
Add an existing bot to this instance of Botmaster

**Kind**: instance method of <code>[Botmaster](#Botmaster)</code>  
**Returns**: <code>[Botmaster](#Botmaster)</code> - returns the botmaster object for chaining  

| Param | Type | Description |
| --- | --- | --- |
| bot | <code>BaseBot</code> | the bot object to add to botmaster. Must be from a subclass of BaseBot |

<a name="Botmaster+getBot"></a>

### botmaster.getBot(options) ⇒ <code>BaseBot</code>
Extract First bot of given type or provided id.

**Kind**: instance method of <code>[Botmaster](#Botmaster)</code>  
**Returns**: <code>BaseBot</code> - The bot found of a class that inherits of BaseBot  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | must be { type: 'someBotType} or { id: someBotId }. |

<a name="Botmaster+getBots"></a>

### botmaster.getBots(botType) ⇒ <code>Array</code>
Extract all bots of given type.

**Kind**: instance method of <code>[Botmaster](#Botmaster)</code>  
**Returns**: <code>Array</code> - Array of bots found  

| Param | Type | Description |
| --- | --- | --- |
| botType | <code>string</code> | (there can be multiple bots of a same type) |

<a name="Botmaster+removeBot"></a>

### botmaster.removeBot(bot) ⇒ <code>[Botmaster](#Botmaster)</code>
Remove an existing bot from this instance of Botmaster

**Kind**: instance method of <code>[Botmaster](#Botmaster)</code>  
**Returns**: <code>[Botmaster](#Botmaster)</code> - returns the botmaster object for chaining  

| Param | Type |
| --- | --- |
| bot | <code>Object</code> | 

<a name="Botmaster+use"></a>

### botmaster.use(middleware) ⇒ <code>[Botmaster](#Botmaster)</code>
Add middleware to this botmaster object
This function is just sugar for `middleware.__use` in them

**Kind**: instance method of <code>[Botmaster](#Botmaster)</code>  
**Returns**: <code>[Botmaster](#Botmaster)</code> - returns the botmaster object so you can chain middleware  

| Param | Type |
| --- | --- |
| middleware | <code>object</code> | 

**Example**  
```js
// The middleware param object is something that looks like this for incoming:
{
 type: 'incoming',
 name: 'my-incoming-middleware',
 controller: (bot, update, next) => {
   // do stuff with update,
   // call next (or return a promise)
 },
 // includeEcho: true (defaults to false), opt-in to get echo updates
 // includeDelivery: true (defaults to false), opt-in to get delivery updates
 // includeRead: true (defaults to false), opt-in to get user read updates
}

// and like this for outgoing middleware

{
 type: 'outgoing',
 name: 'my-outgoing-middleware',
 controller: (bot, update, message, next) => {
   // do stuff with message,
   // call next (or return a promise)
 }
}
```
<a name="Botmaster+useWrapped"></a>

### botmaster.useWrapped(incomingMiddleware, outgoingMiddleware) ⇒ <code>[Botmaster](#Botmaster)</code>
Add wrapped middleware to this botmaster instance. Wrapped middleware
places the incoming middleware at beginning of incoming stack and
the outgoing middleware at end of outgoing stack.
This function is just sugar `middleware.useWrapped`.

**Kind**: instance method of <code>[Botmaster](#Botmaster)</code>  
**Returns**: <code>[Botmaster](#Botmaster)</code> - returns the botmaster object so you can chain middleware  

| Param | Type | Description |
| --- | --- | --- |
| incomingMiddleware | <code>object</code> |  |
| outgoingMiddleware | <code>object</code> | The middleware objects are as you'd expect them to be (see use) |

