In order to run the tests, please create a config.js file in this folder
that looks like this:
---

```js

const config = {

  telegramCredentials: {
    authToken: 'YOUR_OWN_INFO_HERE',
  },

  telegramUserId: 'YOUR_OWN_INFO_HERE',

  messengerCredentials: {
    verifyToken: 'YOUR_OWN_INFO_HERE',
    pageToken: 'YOUR_OWN_INFO_HERE',
    fbAppSecret: 'YOUR_OWN_INFO_HERE',
  },

  twitterCredentials1: {
    // too_cool_for_you
    consumer_key: 'YOUR_OWN_INFO_HERE',
    consumer_secret: 'YOUR_OWN_INFO_HERE',
    access_token: 'YOUR_OWN_INFO_HERE',
    access_token_secret: 'YOUR_OWN_INFO_HERE',
  },
  .
  .
  .

}

module.exports = config;
```
