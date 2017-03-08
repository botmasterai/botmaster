'use strict';

const Botmaster = require('./botmaster');
Botmaster.BaseBot = require('./base_bot');

// this exposes the test classes developers might want to have access to
// like MockBot
Botmaster.testing = require('../tests');

module.exports = Botmaster;
