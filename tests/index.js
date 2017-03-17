'use strict';

const MockBot = require('./_mock_bot');

// if using MockBot in your library, just do a require('botmaster/tests').MockBot
// and make sure the following packages are either in your dependencies exports
// dev-dependencies:

/**
 * express
 * koa
 * body-parser
 */

module.exports = {
  MockBot,
};
