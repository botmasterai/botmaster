---
date: 2016-10-31T22:33:42Z
next: /getting-started/messenger-setup
prev: /getting-started/quickstart
title: Getting set up
toc: true
weight: 30
---

In order to instantiate a `Botmaster` object, you need to pass it some settings in the form of an object. These settings look like this.

```js
const botmasterSettings = {
  botsSettings: botsSettings, // see below for a definition of botsSettings
  app: app, // optional, an express app object if you are running your own server
  server: server, // optional, an http server object (used if using socket.io)
  port: port, // optional, only used if "app" is not defined. Defaults t0 3000 in that case
  sessionStore: sessionStore // optional. Define if you will be dealing with sessions
}
```
See [Working with Botmaster](/working-with-botmaster) for a more formal definition

`botsSettings` look something like this:

```js
const botsSettings = [{ messenger: messengerSettings },
                      { twitter: twitterSettings },
                      { twitter: otherTwitterSettings }];
```

I.e. it is an array of single key objects. Where you specify the **type as the key** of each object and the **settings as the value**. Here I show that you can define multiple bots of the same type at once (twitter ones in this example). As you surely guessed, each different platform will expect different credentials. So platform specific settings will differ.


Once you have those `botmasterSettings`, you can go on and instantiate a `Botmaster` object. This looks something like this:

```js
const botmaster = new Botmaster(botmasterSettings);
```

Now, I know what you're thinking: "but how do I get these `messengerSettings` and `twitterSettings` or other ones?" Well, I cover all of those in the following pages.
