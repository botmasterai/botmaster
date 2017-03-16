'use strict';

const Botmaster = require('botmaster');
const express = require('express');

// this assumes you have your credentials in a "config" file.
const config = require('./config');

const slackSettings = {
  credentials: config.slackCredentials,
  webhookEndpoint: '/webhookd24sr34se',
  storeTeamInfoInFile: true,
}

const botsSettings = [{ slack: slackSettings }];

const botmaster = new Botmaster({ botsSettings });
botmaster.app.use('/slack', express.static(__dirname + '/views'));

botmaster.on('update', (bot, update) => {
  bot.reply(update, 'yo back')
});

botmaster.on('listening', (message) => {
  console.log(message);
});

botmaster.on('error', (bot, err) => {
  console.log(err.stack);
  console.log('there was an error');
});

botmaster.on('warning', (bot, warning) => {
  console.log(warning);
});
