---
date: 2016-10-25T22:21:38+01:00
title: index
---

## Getting set up

As you can see above, the Botmaster constructor takes a `botmasterSettings` argument.
This object is of the following form:

```js
botmasterSettings = {
  botsSettings: botsSettings, // see below for a definition of botsSettings
  app: app, // optional, an express app object if you are running your own server
  port: port, // optional, only used if "app" is not defined. Defaults t0 3000 in that case
  sessionStore: sessionStore // optional. Define if you will be dealing with sessions
}
```

[webhooks](/testing/one)
