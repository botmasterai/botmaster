'use strict'

// just this code to make sure unhandled exceptions are printed to
// the console when developing.
process.on('unhandledRejection', (err, promise) => {
  console.error('UNHANDLED REJECTION', err.stack);
});

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
require('chai').should();
const _ = require('lodash');
const Botmaster = require('../lib');
const config = require('./config.js')
const getMessengerSignatureHeader = require('./tests_utils').getMessengerSignatureHeader;

// describe('Botmaster', function() {
//   const settings = {
//     credentials,
//     webhookEndpoint: '/messenger/webhook'
//   };
// });