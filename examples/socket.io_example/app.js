const Botmaster = require('botmaster');
const express = require('express');

const socketioSettings = {
  id: 'SOME_ID_OF_YOUR_CHOOSING',
};

const botsSettings = [{ socketio: socketioSettings }];

const botmaster = new Botmaster({ botsSettings });
botmaster.app.use(express.static(__dirname + '/public'));

botmaster.on('update', (bot, update) => {
  bot.reply(update, 'Right back at you');
});

botmaster.on('server running', (message) => {
  console.log(message);
});

botmaster.on('error', (bot, err) => {
  console.log(err);
});
