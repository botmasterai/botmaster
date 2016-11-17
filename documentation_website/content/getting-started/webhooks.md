---
date: 2016-11-17T15:28:40Z
next: /working-with-botmaster
prev: /getting-started/telegram-setup
title: Webhooks
toc: true
weight: 90
---
Most platforms rely on webhooks to work. As such, you are expected to setup webhooks on the various platforms that use them in order to use Botmaster with these platforms. In the 'Getting started' part of this documentation, we briefly touched onto that for Telegram and Messenger and more deeply for Slack.

If you are still unsure what webhooks are and how they work, within the context of chatbots, they are simply a URL provided by you pointing to where you expect messages and other updates to come in.

Any platform that requires webhooks won't work without a webhookEndpoint parameter in their settings. E.g. for Telegram:

```js
const telegramSettings = {
  credentials: {
    authToken: 'YOUR authToken',
  },
  webhookEndpoint: '/webhook1234/',
};
```

This will mount your telegram webhook on: `https://Your_Domain_Name/messenger/webhook1234`. And yes, you will need ssl in order to work with most platforms.

As an added layer of security, it is highly recommended that you include a sort of a code in your webhookEndpoint. I.e., rather that having this: `webhookEndpoint: '/webhook/'`, do something more like this: `webhookEndpoint: '/webhook92ywrnc9qm4qoiuthecvasdf42FG/'`. This will assure that you know where the request is coming from. It is more important on Telegram than on other platforms as Telegram doesn't give us any way to verify the source of the message.

Now we realize you will want to develop and test your code without always deploying to a server with a valid url that supports ssl.

### On a local machine:

We recommend using the great localtunnel tool that proxies one of your ports to their url (with a potential wanted subdomain) using ssh.

Simply install localtunnel on local machine:

```bash
npm install -g localtunnel
```

Then run the localtunnel with a predetermined subdomain. e.g:

```bash
lt -p 3000 -s botmastersubdomain //for example
```

`-p` is the port and `-s` is the subdomain we want.
`-l` is for the localhost we want to point to. This is useful is you are using botmaster inside of a container. For instance if using docker-machine, simply `-l` to your docker-machines ip and `-p` to the port that your container exposes.

In the example above, url will be: `http://botmastersubdomain.localtunnel.me`. Localtunnel is great and supports both ssl and non ssl request, which means we will actually wan to use: `https://botmastersubdomain.localtunnel.me`

So if you specified your messenger's bot webhook endpoint to, say, /webhook1234/, you will have to set up the webhook for your demo app at:

```
https://botmastersubdomain.localtunnel.me/messenger/webhook1234/
```

For Telegram, it would look something like this:

```
https://botmastersubdomain.localtunnel.me/telegram/webhook1234/
```

If you keep on getting an error that looks like this:

```bash
your url is: https://customname.localtunnel.me
/usr/local/lib/node_modules/localtunnel/bin/client:58
        throw err;
        ^

Error: connection refused: localtunnel.me:44404 (check your firewall settings)
    at Socket.<anonymous> (/usr/local/lib/node_modules/localtunnel/lib/TunnelCluster.js:47:32)
    at emitOne (events.js:96:13)
    at Socket.emit (events.js:188:7)
    at emitErrorNT (net.js:1272:8)
    at _combinedTickCallback (internal/process/next_tick.js:74:11)
    at process._tickCallback (internal/process/next_tick.js:98:9)
```

This is due to a bug in localtunnel. You can either go try out ngrok (which you will have to pay for), or try this workaround in the terminal:

```bash
(while true; do
  lt -p 3000 -s botmastersubdomain
done)
```

or:

```bash
( while true; do lt -p 3000 -s botmastersubdomain; done; )
```

If you prefer a one liner.

This will just restart the process whenever it crashes (which can happen very often...), making sure your webhook will always be up and listening for incoming requests.

What I do in my projects is the following:

Install localtunnel in the project and save to dev-dependencies
```js
npm install --save-dev localtunnel
```

Then in my `package.json`, add something like this in my 'scripts':

```json
"scripts": {
  .
  .
  "tunnel": "( while true; do lt -p 3000 -s botmastersubdomain; done; )",
  .
  .
},
```

I can then simply run the runnel as follows (most likely in another console tab):

```bash
npm run tunnel
```
