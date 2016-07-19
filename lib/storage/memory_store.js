'use strict';

class MemoryStore {
  constructor(settings) {
    this.keepAlive = settings.keepAlive;
    this.sessions = {};
  }



}


module.exports = MemoryStore;
