---
date: 2016-10-31T23:01:53Z
next: /next/path
prev: /prev/path
title: Slack setup
toc: true
weight: 50
---

## Code

```js
const Botmaster = require('botmaster');

const slackSettings = {
  credentials: {
    clientId: 'YOUR app client ID',
    clientSecret: 'YOUR app client secret',
    verificationToken: 'YOUR app verification Token',
    landingPageURL: 'YOUR landing page URL' // users will be redirected there after adding your bot app to slack. If not set, they will be redirected to their standard slack chats.
  },
  webhookEndpoint: '/webhookd24sr34se',
  storeTeamInfoInFile: true,
};

const botsSettings = [{ slack: slackSettings }];

const botmaster = new Botmaster({ botsSettings });

botmaster.on('update', (bot, update) => {
  bot.reply(update, 'Right back at you');
});
```
## The Botmaster Slack bot

Because Slack works slightly differently from the other platforms covered in the core Botmaster package, I will briefly explain here what your botmaster Slack bot will be exactly.

As you surely know, Slack is a product that enables team members to communicate easily with one another. because of that, one team member can't just "add" a bot for herself in the same way one would in Facebook Messenger or Telegram or other.

Teams can either build a bot that will only live within their own slack team. Or they can package a bot in a Slack app that "packages" the bot.
Admin team members can add support for a bot (by installing an App that packages said bot) and then team members can start communicating with it as they would with another team member. At this point, they would be communicating with what is known as, in Slack semantics, a **bot user**.

The `slackSettings` object is required to allow us to communicate to end users via this **bot user** that needs to be set up on Slack's end.

## Credentials/Setting up the bot user

This should take you less than 10 minutes if you follow these steps correctly. Don't skip any unless you know what you are doing.

1. Navigate to: https://api.slack.com/apps and make sure you are signed in. If you aren't you will be redirected to your team's slack once logged in and will need to go back to the mentioned link.

2. Click the **create new App** button and enter an App Name when wanted. This won't be the name of the **bot user**. However, the name should ideally related to your bot user so as not to confuse your users. For instance, if your bot will be called *my_super_bot*, calling the app something like *My Super Bot App* would make sense.

3. In this page you see, you will see straight away in the *App credentials* section both your Client ID (`clientId` in Botmaster) and your Client Secret (`clientSecret` in Botmaster).

4. In the left panel, click on the **OAuth & Permissions** tab and enter your webhook in the **Redirect URL(s)** field as shown here: ![Slack Setup 1](/images/slack_setup_1.png?width=80%) This URL has to be of the form: **https://\<your_base_url\>/slack/\<webhookEndpoint\>**. For example, **if** I am using localtunnel to test the bot locally (see why you might want to use this and how to install and setup localtunnel for your botmaster project [here](/getting-started/webhooks#localtunnel)), and started localtunnel by running the following: `lt -p 3000 -s botmastersubdomain`. I would set my Redirect URL(s) to: `https://botmastersubdomain.localtunnel.me/slack/webhookd24sr34se` (based on the `webhookEnpoint` set in my `slackSettings`). Click on **Save Changes**.

5. Go to **Bot Users** and click on the **Add a Bot User** button. Select a name for your bot (e.g. my_super_bot) and click the **Add Bot User** button.

6. Navigate to the **Event Subscriptions** tab and click on the toggle button in the to right corner to **on**. Then in the **Request URL** field that pops up, enter the same URL as in step 4. It should look something like this: ![Slack Setup 2](/images/slack_setup_2.png?width=80%)

also, you'll need:

```html
<a href="https://slack.com/oauth/authorize?scope=bot&client_id=[YOUR_APP_CLIENT_ID]">
  <img alt="Add to Slack" height="40" width="139"
  src="https://platform.slack-edge.com/img/add_to_slack.png"
  srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x,
          https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
</a>
```

If you don't already have these, follow the steps **1-4** on the Facebook Messenger guide:
https://developers.facebook.com/docs/messenger-platform/quickstart

In **step 2**, where you setup your webhook, no need to code anything. Just specify the webhook, enter any secure string you want as a verify token(`verifyToken`) and copy that value in the settings object. Also, click on whichever message [those are "update"s using botmaster semantics] type you want to receive from Messenger (`message_deliveries`, `messages`, `message_postbacks` etc...).

To find your Facebook App Secret (`fbAppSecret`), navigate to your apps dashboard and under `App Secret` click show, enter your password if prompted and then there it is.

If you are not too sure how webhooks work and/or how to get them to run locally, go to [webhooks](/getting-started/webhooks) to read some more.
