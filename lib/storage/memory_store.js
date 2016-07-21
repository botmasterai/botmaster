'use strict';

class MemoryStore {
  constructor() {
    this.sessions = {};
  }

  createOrUpdateSession(update) {
    if (!this.sessions[update.sender.id]) {
      return this.createSession(update);
    }
    return this.updateSession(update);
  }

  // using promises here because dbs would typically usually work like that
  createSession(update) {
    const promise = new Promise((resolve) => {
      const id = update.sender.id;
      const session = {
        id: update.sender.id,
        botId: update.recipient.id,
        latestMid: update.message.mid,
        latestSeq: update.message.seq,
        lastActive: update.timestamp,
      };
      this.sessions[id] = session;
      resolve(session);
    });

    return promise;
  }

  updateSession(update) {
    const promise = new Promise((resolve) => {
      const id = update.sender.id;
      const session = this.sessions[id];

      session.latestMid = update.message.mid;
      session.latestSeq = update.message.seq;
      session.lastActive = update.timestamp;

      resolve(session);
    });

    return promise;
  }

}


module.exports = MemoryStore;
