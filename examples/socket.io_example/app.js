const Botmaster = require('../../lib');
// const Botmaster = require('botmaster');
const express = require('express');

const botmaster = new Botmaster();
botmaster.app.use(express.static(__dirname + '/public'));

const socketioSettings = {
  id: 'SOME_ID_OF_YOUR_CHOOSING',
  server: botmaster.server,
};

const socketioBot = new Botmaster.botTypes.SocketioBot(socketioSettings);
botmaster.addBot(socketioBot);

botmaster.on('update', (bot, update) => {
  bot.reply(update, 'Right back at you');
});

botmaster.use('outgoing', (bot, message, next) => {
  console.log(JSON.stringify(message, null, 2));

  message.message.text = "Hello you!";
  next();
})

botmaster.on('listening', (message) => {
  console.log(message);
});

botmaster.on('error', (bot, err) => {
  console.log(err);
});
