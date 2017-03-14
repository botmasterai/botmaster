import test from 'ava';
import request from 'request-promise'; // just want to see if I can send an outgoingMessage
import express from 'express';
import expressBodyParser from 'body-parser';


import MockBot from '../_mock_bot';

const testTitleBase = 'BaseBot';

const createBaseOutgoingMessage = () => {
  const outgoingMessage = {
    recipient: {
      id: 'user_id',
    },
  };

  return new OutgoingMessage(outgoingMessage);
};

test.only(`${testTitleBase}'s #sendMessage' works`, (t) => {
  t.plan(3);

  const app = express();

  app.use(expressBodyParser.json());

  app.use('/', (req, res) => {
    console.log(req.body);
    console.log(typeof req.body);

    res.json({ message: 'all good' });
  });

  return new Promise((resolve) => {
    app.listen(3000, () => {
      // const bot = new MockBot();
      const outgoingMessage = createBaseOutgoingMessage().addText('someText');

      const options = {
        uri: '/',
        method: 'POST',
        json: outgoingMessage,
      };

      request(options)

      .then((body) => {
        console.log(body);
      });
    });
  });
});

//   describe('receiving messages', function() {
//     // TODO, do this using mock_bot_class
//   });

//   describe('sending messages', function() {
//     // Do this with mock_bot_class also
//     this.retries(4);
//     // botmaster.server stops listening onto port 3200 in the after hook
//     // of 'sending message'
//     const botmasterSettings = {
//       botsSettings: baseBotsSettings,
//       port: 3200
//     };
//     const botmaster = new Botmaster(botmasterSettings);

//     for (const bot of botmaster.bots) {
//       // if (bot.type !== 'socketio') continue; // for now
//       let recipientId = null;
//       let socket;

//       before(function(done) {
//         if (bot.type === 'telegram') {
//           recipientId = config.telegramUserId;
//           done();
//         } else if (bot.type === 'messenger') {
//           recipientId = config.messengerUserId;
//           done();
//         } else if (bot.type === 'twitter') {
//           recipientId = config.twitterUserId;
//           done();
//         } else if (bot.type === 'slack') {
//           const jsonFileStoreDB = new JsonFileStore('slack_teams_info');
//           const teamId = config.slackTeamInfo.team_id;
//           const channel = config.slackTestInfo.channel;
//           // write teamInfo data to file expected to be read
//           jsonFileStoreDB.saveSync(teamId, config.slackTeamInfo);
//           // extract recipientId from that data (and the one in config)
//           recipientId = `${teamId}.${channel}`;
//           done();
//         } else if (bot.type === 'socketio') {
//           socket = io('ws://localhost:3200');

//           socket.on('connect', function() {
//             recipientId = socket.id;
//             done();
//           });
//         }
//       });

//       describe(`to the ${bot.type} platform`, function() {

//         specify('using #sendMessage', function(done) {
//           const message = {
//             recipient: {
//               id: recipientId
//             },
//             message: {
//               text: 'Party & bullshit'
//             }
//           };

//           bot.sendMessage(message)

//           .then(function(body) {
//             expect(body.message_id).to.not.equal(undefined);
//             expect(body.recipient_id).to.not.equal(undefined);
//             done();
//           });
//         });

//         specify('using #sendMessageTo', function(done) {
//           const message = {
//             text: 'Party & bullshit'
//           };

//           bot.sendMessageTo(message, recipientId)

//           .then(function(body) {
//             expect(body.message_id).to.not.equal(undefined);
//             expect(body.recipient_id).to.not.equal(undefined);
//             done();
//           });
//         });

//         specify('using #sendTextMessageTo with callback (cb)', function(done) {
//           // using callback here
//           bot.sendTextMessageTo('Party & bullshit', recipientId, function(err, body) {
//             expect(body.message_id).to.not.equal(undefined);
//             expect(body.recipient_id).to.not.equal(undefined);
//             done();
//           });
//         });

//         specify('using #reply', function(done) {

//           // that's all that's needed for this test
//           const update = {};
//           update.sender = {};
//           update.sender.id = recipientId;

//           bot.reply(update, 'replying to update')

//           .then(function(body) {
//             expect(body.message_id).to.not.equal(undefined);
//             expect(body.recipient_id).to.not.equal(undefined);
//             done();
//           });
//         });

//         specify('using #sendDefaultButtonMessageTo with good arguments', function(done) {
//           const buttons = ['option One', 'Option Two', 'Option Three', 'Option Four'];

//           Promise.all([
//             bot.sendDefaultButtonMessageTo(buttons, recipientId),
//             bot.sendDefaultButtonMessageTo(buttons, recipientId, 'Don\'t select any of:')
//           ])
//           .then(function(bodies) {
//             expect(bodies[0].message_id).to.not.equal(undefined);
//             expect(bodies[0].recipient_id).to.not.equal(undefined);
//             expect(bodies[1].message_id).to.not.equal(undefined);
//             expect(bodies[1].recipient_id).to.not.equal(undefined);
//             done();
//           });
//         });

//         specify('using #sendDefaultButtonMessageTo with bad 3rd argument', function(done) {
//           const buttons = ['option One', 'Option Two', 'Option Three', 'Option Four'];

//           bot.sendDefaultButtonMessageTo(buttons, recipientId, bot)

//           .catch((err) => {
//             err.message.should.equal('ERROR: third argument must be a "String", an attachment "Object" or absent');
//             done();
//           });
//         });

//         specify('using #sendDefaultButtonMessageTo with bad 3rd argument callback', function(done) {
//           const buttons = ['option One', 'Option Two', 'Option Three', 'Option Four'];

//           bot.sendDefaultButtonMessageTo(buttons, recipientId, bot, function(err) {
//             err.message.should.equal('ERROR: third argument must be a "String", an attachment "Object" or absent');
//             done();
//           });
//         });

//         specify('using #sendDefaultButtonMessageTo with too many buttons', function(done) {
//           const tooManyButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

//           bot.sendDefaultButtonMessageTo(tooManyButtons, recipientId)

//           .catch(function(err) {
//             err.message.should.equal('ERROR: buttonTitles must be of length 10 or less');
//             done();
//           });
//         });

//         specify('using #sendAttachmentFromURLTo', function() {
//           this.timeout(3000);
//           const url = 'https://raw.githubusercontent.com/ttezel/twit/master/tests/img/bigbird.jpg';

//           return bot.sendAttachmentFromURLTo('image', url, recipientId)

//           .then(function(body) {
//             expect(body.message_id).to.not.equal(undefined);
//             expect(body.recipient_id).to.not.equal(undefined);
//           });
//         });

//         specify('using #sendIsTypingMessageTo', function(done) {

//           bot.sendIsTypingMessageTo(recipientId, function(err, body) {
//             expect(body.recipient_id).to.equal(recipientId);
//             done();
//           });
//         });

//         // specify('using #sendRaw', function(done) {
//         //   // if is here just for now
//         //   if (bot.type === 'socketio') {
//         //
//         //   } else {
//         //     done();
//         //   }
//         // });

//         // just execute those for socketio as all the underlying helper functionalities
//         // have been tested above
//         if (bot.type === 'socketio') {
//           specify('using #sendCascadeTo with no valid params in an object does not work', function(done) {
//             const messageArray = [
//               {},
//             ];

//             bot.sendCascadeTo(messageArray, recipientId, function(err) {
//               expect(err.message).to.equal('No valid message options specified');
//               done();
//             });
//           });

//           specify('using #sendCascadeTo a with a "raw" message works', function(done) {
//             const rawMessage1 = {
//               nonStandard: 'message1',
//               recipient: {
//                 id: recipientId,
//               },
//             };
//             const rawMessage2 = {
//               nonStandard: 'message2',
//               recipient: {
//                 id: recipientId,
//               },
//             };

//             const receivedMessageArray = [];
//             const messageArray = [{ raw: rawMessage1 }, { raw: rawMessage2 }];
//             let amDone = 0;

//             bot.sendCascadeTo(messageArray, recipientId)

//             .then((bodies) => {
//               assert(bodies.length === 2);
//               amDone += 1;
//               if (amDone === 2) {
//                 socket.removeAllListeners('message');
//                 done();
//               }
//             });

//             socket.on('message', (message) => {
//               receivedMessageArray.push(message);

//               if (receivedMessageArray.length === 2) {
//                 expect(receivedMessageArray[0].nonStandard).to.equal('message1');
//                 expect(receivedMessageArray[1].nonStandard).to.equal('message2');
//                 amDone += 1;
//                 if (amDone === 2) {
//                   socket.removeAllListeners('message');
//                   done();
//                 }
//               }
//             });
//           });

//           specify('using #sendCascadeTo with a valid botmaster "message" works', function(done) {
//             const message1 = {
//               recipient: {
//                 id: recipientId,
//               },
//               message : {
//                 text: 'message1',
//               }
//             };
//             const message2 = {
//               recipient: {
//                 id: recipientId,
//               },
//               message : {
//                 text: 'message2',
//               }
//             };

//             const receivedMessageArray = [];
//             const messageArray = [{ message: message1 }, { message: message2 }];

//             bot.sendCascadeTo(messageArray, recipientId);

//             socket.on('message', (message) => {
//               receivedMessageArray.push(message);

//               if (receivedMessageArray.length === 2) {
//                 expect(receivedMessageArray[0].message.text).to.equal('message1');
//                 expect(receivedMessageArray[1].message.text).to.equal('message2');
//                 socket.removeAllListeners('message');
//                 done();
//               }
//             });
//           });

//           specify('using #sendCascadeTo sending mixed "message" and "raw" works', function(done) {
//             const rawMessage1 = {
//               nonStandard: 'message1',
//               recipient: {
//                 id: recipientId,
//               },            };
//             const message2 = {
//               recipient: {
//                 id: recipientId,
//               },
//               message : {
//                 text: 'message2',
//               }
//             };

//             const receivedMessageArray = [];
//             const messageArray = [{ raw: rawMessage1 }, { message: message2 }];
//             let amDone = 0;

//             bot.sendCascadeTo(messageArray, recipientId, function(err, bodies) {
//               expect(bodies.length).to.equal(2);
//               amDone += 1;
//               if (amDone === 2) {
//                 socket.removeAllListeners('message');
//                 done();
//               }
//             });

//             socket.on('message', (message) => {
//               receivedMessageArray.push(message);

//               if (receivedMessageArray.length === 2) {
//                 expect(receivedMessageArray[0].nonStandard).to.equal('message1');
//                 expect(receivedMessageArray[1].message.text).to.equal('message2');
//                 amDone += 1;
//                 if (amDone === 2) {
//                   socket.removeAllListeners('message');
//                   done();
//                 }
//               }
//             });
//           });

//           specify('using #sendCascadeTo with text only works', function(done) {
//             const message1 = {
//               text: 'message1',
//             };

//             const message2 = {
//               text: 'message2',
//             };

//             const receivedMessageArray = [];
//             const messageArray = [message1, message2];

//             bot.sendCascadeTo(messageArray, recipientId);

//             socket.on('message', (message) => {
//               receivedMessageArray.push(message);

//               if (receivedMessageArray.length === 2) {
//                 expect(receivedMessageArray[0].message.text).to.equal('message1');
//                 expect(receivedMessageArray[1].message.text).to.equal('message2');
//                 socket.removeAllListeners('message');
//                 done();
//               }
//             });
//           });

//           specify('using #sendCascadeTo with typing indicators works', function(done) {
//             const message1 = {
//               isTyping: true,
//             };

//             const messageArray = [message1];

//             bot.sendCascadeTo(messageArray, recipientId);

//             socket.on('message', (message) => {
//               expect(message.sender_action).to.equal('typing_on');
//               socket.removeAllListeners('message');
//               done();
//             });
//           });

//           specify('using #sendCascadeTo with buttons throws error if both attachment and text are there', function(done) {
//             const messageArray = [
//               {
//                 text: 'message1',
//               },
//               {
//                 buttons: ['one', 'two'],
//                 text: 'Those are buttons',
//                 attachment: {},
//               },
//             ];

//             bot.sendCascadeTo(messageArray, recipientId)

//             .catch((err) => {
//               expect(err.message).to.equal('Please use either one of text or attachment with buttons');
//               done();
//             });
//           });

//           specify('using #sendCascadeTo with buttons works', function(done) {
//             const message1 = {
//               buttons: ['button1', 'button2'],
//             };

//             const message2 = {
//               text: 'message2',
//               buttons: ['button1', 'button90'],
//             };

//             const receivedMessageArray = [];
//             const messageArray = [message1, message2];

//             bot.sendCascadeTo(messageArray, recipientId);

//             socket.on('message', (message) => {
//               receivedMessageArray.push(message);

//               if (receivedMessageArray.length === 2) {
//                 expect(receivedMessageArray[0].message.text).to.equal('Please select one of:');
//                 expect(receivedMessageArray[0].message.quick_replies[0].title).to.equal('button1');
//                 expect(receivedMessageArray[1].message.text).to.equal('message2');
//                 expect(receivedMessageArray[1].message.quick_replies[1].title).to.equal('button90');
//                 socket.removeAllListeners('message');

//                 done();
//               }
//             });
//           });

//           specify('using #sendCascadeTo with attachments works', function(done) {
//             const message1 = {
//               attachment: {
//                 type: 'image',
//                 payload: {
//                   url: 'https://raw.githubusercontent.com/ttezel/twit/master/tests/img/bigbird.jpg',
//                 }
//               }
//             };

//             const message2 = {
//               attachment: {
//                 type: 'image',
//                 payload: {
//                   url: 'https://raw.githubusercontent.com/ttezel/twit/master/tests/img/bigbird.jpg',
//                 }
//               }
//             };

//             const receivedMessageArray = [];
//             const messageArray = [message1, message2];

//             bot.sendCascadeTo(messageArray, recipientId);

//             socket.on('message', (message) => {
//               receivedMessageArray.push(message);

//               if (receivedMessageArray.length === 2) {
//                 expect(receivedMessageArray[0].message.attachment.type).to.equal('image');
//                 expect(receivedMessageArray[1].message.attachment.type).to.equal('image');
//                 socket.removeAllListeners('message');

//                 done();
//               }
//             });
//           });

//           specify('using #sendTextCascadeTo works', function(done) {
//             const receivedMessageArray = [];
//             const messageArray = ['message1', 'message2'];
//             let amDone = 0;

//             bot.sendTextCascadeTo(messageArray, recipientId)

//             .then((bodies) => {
//               assert(bodies.length === 2);
//               amDone += 1;
//               if (amDone === 2) {
//                 socket.removeAllListeners('message');
//                 done();
//               }
//             });

//             socket.on('message', (message) => {
//               receivedMessageArray.push(message);

//               if (receivedMessageArray.length === 2) {
//                 expect(receivedMessageArray[0].message.text).to.equal('message1');
//                 expect(receivedMessageArray[1].message.text).to.equal('message2');
//                 amDone += 1;
//                 if (amDone === 2) {
//                   socket.removeAllListeners('message');
//                   done();
//                 }
//               }
//             });
//           });
//         }

//       });

//       // after each run of the loop (runs in parallel)
//       // so for each bot type, they will run after the tests in context,
//       // I.e. the after for slack will be run after all tests for, say, messenger
//       // are run ( but in context).
//       after(function() {
//         if (bot.type === 'slack') {
//           const jsonFileStoreDB = new JsonFileStore('slack_teams_info');
//           // delete teamInfo data
//           jsonFileStoreDB.delete(config.slackTeamInfo.team_id);
//         }

//         if (bot.type === 'socketio') {
//           socket.disconnect();
//         }
//       });
//     }

//     // close server after all single after blocks have run
//     after(function(done) {
//       this.retries(4);
//       botmaster.server.close(function() { done(); });
//     });
//   });
// });
