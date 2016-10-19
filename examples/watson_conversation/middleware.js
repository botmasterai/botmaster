'use strict';

const watson = require('watson-developer-cloud');

const watsonConversation = watson.conversation();

class WatsonConversationMiddleware {
  constructor(settings) {
    this.watsonConversation = watson.conversation(settings);
    this.inMemoryContexts = {};
  }

  attach(bot, update) {
    update.context = inMemoryContexts[update.sender.id];
  }
}

module.exports = WatsonConversationMiddleware;
