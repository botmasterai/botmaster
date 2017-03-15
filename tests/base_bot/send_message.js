import test from 'ava';
import { outgoingMessageFixtures,
         incomingUpdateFixtures,
         attachmentFixtures } from 'botmaster-test-fixtures';
import { assign } from 'lodash';

import OutgoingMessage from '../../lib/outgoing_message';
import MockBot from '../_mock_bot';

const sendMessageMacro = (t, params) => {
  t.plan(6);

  return new Promise((resolve) => {
    // always run both with and without callback
    let cbPassCount = 0;
    const cb = (err, body) => {
      // This needs to be a promise based callback.
      if (!body) {
        body = err;
      }

      t.deepEqual(assign({}, body.sentMessage), params.expectedSentMessage,
        'sentMessage is not same as message');
      t.truthy(body.recipient_id);
      t.truthy(body.message_id);

      cbPassCount += 1;
      if (cbPassCount === 2) {
        resolve();
      }
    };

    // test using promises
    params.sendMessageMethod().then(cb);
    // and using standard callback function
    params.sendMessageMethod(cb);
  });
};

{
  const bot = new MockBot();
  const messageToSend = outgoingMessageFixtures.audioMessage();

  test('#sendMessage works', sendMessageMacro, {
    sendMessageMethod: bot.sendMessage.bind(bot, messageToSend),
    expectedSentMessage: outgoingMessageFixtures.audioMessage(),
  });
}

{
  const bot = new MockBot();
  const subMessagePart = {
    text: 'Hello World!',
  };

  test('#sendMessageTo works', sendMessageMacro, {
    sendMessageMethod: bot.sendMessageTo.bind(bot, subMessagePart, 'user_id'),
    expectedSentMessage: outgoingMessageFixtures.textMessage(),
  });
}

{
  const bot = new MockBot();

  test('#sendTextMessageTo works', sendMessageMacro, {
    sendMessageMethod: bot.sendTextMessageTo.bind(bot, 'Hello World!', 'user_id'),
    expectedSentMessage: outgoingMessageFixtures.textMessage(),
  });
}

{
  const bot = new MockBot();

  const updateToReplyTo = incomingUpdateFixtures.textUpdate();
  // patching bot just to see if that works too with callbacks
  const patchedBot = bot.__createBotPatchedWithUpdate(updateToReplyTo);

  test('#reply works', sendMessageMacro, {
    sendMessageMethod: patchedBot.reply.bind(patchedBot, updateToReplyTo, 'Hello World!'),
    expectedSentMessage: outgoingMessageFixtures.textMessage(),
  });
}

{
  const bot = new MockBot();

  const attachment = attachmentFixtures.audioAttachment();

  test('#sendAttachmentTo works', sendMessageMacro, {
    sendMessageMethod: bot.sendAttachmentTo.bind(bot, attachment, 'user_id'),
    expectedSentMessage: outgoingMessageFixtures.audioMessage(),
  });
}

{
  const bot = new MockBot();

  test('#sendAttachmentFromUrlTo works', sendMessageMacro, {
    sendMessageMethod: bot.sendAttachmentFromUrlTo.bind(bot,
      'audio', 'SOME_AUDIO_URL', 'user_id'),
    expectedSentMessage: outgoingMessageFixtures.audioMessage(),
  });
}

{
  const bot = new MockBot();

  test('#sendDefaultButtonMessageTo works', sendMessageMacro, {
    sendMessageMethod: bot.sendAttachmentFromUrlTo.bind(bot,
      'audio', 'SOME_AUDIO_URL', 'user_id'),
    expectedSentMessage: outgoingMessageFixtures.audioMessage(),
  });
}

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
