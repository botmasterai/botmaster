'use strict';

class MemoryStore {
  constructor() {
    this.sessions = {};
  }

  /**
   * createOrUpdateSession(update) return a promise that resolves to a
   * session object that will be added to the coming update right before
   * emitting the update. I.e. 'update.session' will exist.
   *
   * @param {object} update
   * @return Promise which resolves to a session {object}
   */
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
        lastActive: update.timestamp,
      };

      if (update.message) {
        session.latestMid = update.message.mid;
        session.latestSeq = update.message.seq;
      }

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

      if (update.message) {
        session.latestMid = update.message.mid;
        session.latestSeq = update.message.seq;
      }

      resolve(session);
    });

    return promise;
  }

}

module.exports = MemoryStore;
