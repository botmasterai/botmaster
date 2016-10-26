'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');
const JsonFileStore = require('jfs');
const BaseBot = require('./base_bot');

const webAPIURL = 'https://slack.com/api/';

class SlackBot extends BaseBot {

  constructor(settings) {
    super(settings);
    this.type = 'slack';
    this.requiresWebhook = true;
    this.requiredCredentials = ['clientId',
                                'clientSecret',
                                'verificationToken'];

    this.__applySettings(settings);

    this.__createMountPoints();
    // this is the id that will be set after the first message is sent by
    // this bot. It will be this bot's user value as defined by Slack,
    // and not its bot_id value which is a different thing.
    // See the difference between app/bots and bot_users in Slack.
    this.id = null;
  }

  __applySettings(settings) {
    super.__applySettings(settings);

    if (settings.landingPageURL) {
      this.landingPageURL = settings.landingPageURL;
    }

    if ((!settings.storeTeamInfoInFile && !settings.storeTeamInfoHooks) ||
        (settings.storeTeamInfoInFile && settings.storeTeamInfoHooks)) {
      throw new Error(`ERROR: bots of type '${this.type}' must be defined with exactly one of storeTeamInfoInFile set to true or storeTeamInfoHooks defined`);
    }

    if (settings.storeTeamInfoInFile) {
      this.storeTeamInfoInFile = settings.storeTeamInfoInFile;
    } else {
      this.storeTeamInfoHooks = settings.storeTeamInfoHooks;
    }

    if (this.storeTeamInfoInFile) {
      this.jsonFileStoreLocation = 'slack_teams_info';
      const jsonFileStoreDB = new JsonFileStore(this.jsonFileStoreLocation);

      this.storeTeamInfoHooks = {};
      this.storeTeamInfoHooks.storeTeamInfo = function storeTeamInfo(bot, teamInfo) {
        return new Promise((resolve, reject) => {
          jsonFileStoreDB.save(teamInfo.team_id, teamInfo, (err) => {
            if (err) {
              return reject(err);
            }
            return resolve(teamInfo);
          });
        });
      };

      this.storeTeamInfoHooks.getTeamInfo = function getTeamInfo(bot, teamId) {
        return new Promise((resolve, reject) => {
          jsonFileStoreDB.get(teamId, (err, teamInfo) => {
            if (err) {
              return reject(`An error occurred trying to get info for: ${teamId}`);
            }

            return resolve(teamInfo);
          });
        });
      };
    }
  }
  /**
   * sets up the app.
   * Adds an express Router to the mount point "/slack".
   * sub Router contains code for posting to wehook.
   */
  __createMountPoints() {
    this.app = express();
    // for parsing application/json
    this.app.use(bodyParser.json());
    // for parsing application/x-www-form-urlencoded
    this.app.use(bodyParser.urlencoded({ extended: true }));
    // just verify origin of any post requests using verificationToken
    this.app.post(this.webhookEndpoint, this.__verifyRequestOrigin.bind(this));
    // make sure Event's webhookEndpoint (Request URL) is valid
    this.app.post(this.webhookEndpoint,
                  this.__respondToVerificationHandshake.bind(this));
    // get code from Slack Button request and make oauth request
    this.app.get(this.webhookEndpoint,
                 this.__authorizeApplicationForTeam.bind(this));
    // finally, if it's a valid POST Events request, deal with it
    this.app.post(this.webhookEndpoint, (req, res) => {
      this.__emitUpdateFromEvent(req.body);
      // just letting Slack know we got the update
      res.sendStatus(200);
    });
  }

  __verifyRequestOrigin(req, res, next) {
    if (req.body.token !== this.credentials.verificationToken) {
      return res.sendStatus(403);
    }

    return next();
  }

  __respondToVerificationHandshake(req, res, next) {
    if (req.body.type === 'url_verification') {
      const challenge = req.body.challenge;
      return res.send({ challenge });
    }

    return next();
  }

  __authorizeApplicationForTeam(req, res) {
    if (req.query.code) {
      return this.__getOAuthAuthenticatedTeamInfo(req.query.code)

      .then(this.storeTeamInfoHooks.storeTeamInfo.bind(undefined, this))
      .then(() => res.redirect(this.landingPageURL || 'https://my.slack.com'))
      .catch((err) => {
        this.emit('error', err);
        return res.redirect('https://slack.com/400');
      });
    }

    return res.sendStatus(400);
  }

  __getOAuthAuthenticatedTeamInfo(code) {
    const requestOptions = {
      mehod: 'GET',
      uri: `${webAPIURL}/oauth.access`,
      qs: {
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        code,
      },
      json: true,
    };

    // this request/promise/function responds/resolves/returns with teamInfo
    return request(requestOptions);
  }

  __emitUpdateFromEvent(event) {
    if (event.event && event.event.type === 'message' &&
        event.event.user !== this.id) {
      const update = this.__formatUpdate(event);
      if (update) {
        this.__emitUpdate(update);
      }
    }
    // TODO emit slack specific events otherwise
  }

  __formatUpdate(rawUpdate) {
    const senderId = `${rawUpdate.team_id}.${rawUpdate.event.channel}.${rawUpdate.event.user}`;
    const formattedUpdate = {
      raw: rawUpdate,
      sender: {
        id: senderId,
      },
      recipient: {
        id: `${rawUpdate.team_id}.${rawUpdate.event.channel}`,
      },
      timestamp: parseInt(rawUpdate.event.ts.split('.')[0]) * 1000,
      message: {
        mid: `${senderId}.${rawUpdate.event.ts}`,
        seq: rawUpdate.event.ts.split('.')[1],
      },
    };

    if (!rawUpdate.event.subType === 'message_changed') {
      // ignore message_changed events for now. Not too sure what
      // people will want in the future with those.
      return false;
    } else if (!rawUpdate.event.subType === 'file_share') {
      // TODO: allow file Sending. See if it makes sense to get the public url
      // there or if people would hate that
    }

    if (rawUpdate.event.text) {
      formattedUpdate.message.text = rawUpdate.event.text;
    }

    return formattedUpdate;
  }

  __sendMessage(message) {
    const teamId = message.recipient.id.split('.')[0];
    const channel = message.recipient.id.split('.')[1];

    const options = {
      method: 'POST',
      uri: `${webAPIURL}/chat.postMessage`,
      json: true,
    };

    return this.__formatOutgoingMessage(message)

    .then((outgoingMessage) => {
      options.qs = outgoingMessage;
      return request(options);
    })

    .then((body) => {
      if (!body.ok) {
        throw new Error(JSON.stringify(body));
      }

      const recipientId = `${teamId}.${channel}`;
      const messageId = `${recipientId}.${body.message.user}.${body.message.ts}`;
      const standardizedBody = {
        raw: body,
        recipient_id: recipientId,
        message_id: messageId,
      };
      // this is the bot user_id (if sender has this id, it is definitely this bot)
      this.id = body.message.user;

      return standardizedBody;
    });
  }

  __formatOutgoingMessage(message) {
    const teamId = message.recipient.id.split('.')[0];
    const channel = message.recipient.id.split('.')[1];

    return this.storeTeamInfoHooks.getTeamInfo(this, teamId)

    .then((teamInfo) => {
      const formattedMessage = {
        token: teamInfo.bot.bot_access_token,
        channel,
        unfurl_links: true,
        as_user: true, // makes request as bot user rather than just bot(App)
      }

      if (message.message.text) {
        formattedMessage.text = message.message.text;
      }
      if (message.message.attachment) {
        const attachment = message.message.attachment;
        if (attachment.type === 'image') {
          let text;
          if (formattedMessage.text) {
            text = formattedMessage.text;
            delete formattedMessage.text;
          }
          const attachments = [
            {
              image_url: attachment.payload.url,
              text: text || 'image:',
            },
          ];

          formattedMessage.attachments = JSON.stringify(attachments);
        } else {
          formattedMessage.text += `\n${attachment.payload.url}`;
        }
      }

      if (message.message.quick_replies) {
        // TODO add support for sending default buttons/and quick_replies
      }

      return formattedMessage;
    });
  }

  sendIsTypingMessageTo(recipientId, cb) {
    return this.sendTextMessageTo('...typing...', recipientId, cb);
  }

  // _sendSlackFormattedMessage(slackMessage) {
  //
  // }

}

module.exports = SlackBot;
