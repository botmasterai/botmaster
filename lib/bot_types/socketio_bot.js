'use strict';

const _cloneDeep = require('lodash').cloneDeep;
const BaseBot = require('./base_bot');
const io = require('socket.io');

class SocketioBot extends BaseBot {

  constructor(settings) {
    super(settings);
    this.type = 'socketio';

    this.__applySettings(settings);
    this.__setupSocketioServer();
  }

  __applySettings(settings) {
    super.__applySettings(settings);

    if (!settings.id) {
      throw new Error('ERROR: bots of type \'socketio\' are expected to have \'id\' in their settings');
    }
    this.id = settings.id;

    if (!settings.server) {
      throw new Error('ERROR: bots of type \'socketio\' must be defined with \'server\' in their settings');
    }
    this.server = settings.server;
  }

  __setupSocketioServer() {
    this.ioServer = io(this.server);

    this.ioServer.on('connection', (socket) => {
      socket.on('message', (message) => {
        let rawUpdate;
        try {
          rawUpdate = JSON.parse(message);
        } catch (err) {
          err.message = `ERROR: "Expected stringified JSON object but got '${message}' instead"`;
          return this.emit('error', err);
        }
        const update = this.__formatUpdate(rawUpdate, socket.id);
        return this.__emitUpdate(update);
      });
    });
  }

  __formatUpdate(rawUpdate, socketId) {
    const timestamp = Math.floor(Date.now());

    const update = {
      raw: rawUpdate,
      sender: {
        id: rawUpdate.sender && rawUpdate.sender.id ? rawUpdate.sender.id : socketId,
      },
      recipient: {
        id: this.id,
      },
      timestamp,
      message: {
        mid: `${this.id}.${socketId}.${String(timestamp)}.`,
        seq: null,
      },
    };

    if (rawUpdate.text) {
      update.message.text = rawUpdate.text;
    }

    if (rawUpdate.attachments) {
      update.message.attachments = rawUpdate.attachments;
    }

    return update;
  }

  __sendMessage(message) {
    const socket = this.ioServer.sockets.connected[message.recipient.id];
    const outgoingMessage = _cloneDeep(message);
    // just remove recipient from it, the rest (anything the developer wishes) goes through
    delete outgoingMessage.recipient;

    socket.send(JSON.stringify(outgoingMessage));

    return new Promise((resolve) => {
      const timestamp = Math.floor(Date.now());
      resolve({
        recipient_id: message.recipient.id,
        message_id: `${this.id}.${socket.id}.${String(timestamp)}`,
      });
    });
  }

}

module.exports = SocketioBot;
