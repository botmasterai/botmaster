'use strict';

const EventEmitter = require('events');
const Twit = require('twit');

const twitterBot = new EventEmitter();

module.exports = twitterBot;
