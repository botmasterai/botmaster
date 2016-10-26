'use strict';

const store = {};

function retrieveSession(bot, update, next) {
  // try to retrieve the session object for a certain id
  // if no session is found, set the session to an empty object
  if (store[update.sender.id]) {
    update.session = store[update.sender.id];
  } else {
    // on the first pass, this will be our session object
    update.session = {};
  }
  next();
}

function updateSession(bot, message, next) {
  // update or store the session for the first time.
  // the update is expected to be found in the message object
  // for the platform. Because we don't need to send it over,
  // we delete it after saving the session.

  store[message.recipient.id] = message.session;
  delete message.session;
  next();
}

module.exports = {
  retrieveSession,
  updateSession,
};
