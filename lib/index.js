'use strict';

// just this code to make sure unhandled exceptions are printed to
// the console when developing.
process.on('unhandledRejection', (err, promise) => {
  console.error('UNHANDLED REJECTION', err.stack);
});

const Botmaster = require('./botmaster');
Botmaster.botTypes = require('./bot_types');
Botmaster.storage = require('./storage');

module.exports = Botmaster;
