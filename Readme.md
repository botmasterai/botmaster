Bot framework
---

This is a lightweight bot framework that can be used for creating bots on a variety of different platforms. 

## Then just:

```bash
npm install
npm start
```

## You will need to set up the a bot on telegram. See this page:
https://core.telegram.org/bots for an intro;
https://core.telegram.org/bots/api for all the doc.
Then edit your telegramKey in api_integrations/telegram_api_integration.

## For the facebook Messenger bot, follow this guide to set up the bot:
https://developers.facebook.com/docs/messenger-platform/quickstart
Then edit the verifyToken and pageToken in api_integrations/facebook_messenger_api_integration.


## Dealing with webhooks on local machine:

Simply install localtunnel on local machine

```bash
npm install -g localtunnel
```

Then run the localtunnel with a predetermined subdomain. e.g:

```bash
lt -p 3000 -s botmastersubdomain //for example
```

-l is for the localhost we want to point to. -p is the port and -s is the subdomain we want.
In this case, your url will be: http://botmastersubdomain.localtunnel.me.

So if you specified messenger's webhook endpoint to, say, /messenger/webhook1234/, you will have to 
set up the webhook for your demo app at:

http://botmastersubdomain.localtunnel.me/messenger/webhook1234/
