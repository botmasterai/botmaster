'use strict'

const app = require('express')();
const assert = require('chai').assert;
const expect = require('chai').expect;
const request = require('request-promise');
const req = require('request');
require('chai').should();
const _ = require('lodash');
const TelegramBot = require('../../lib/bot_types/telegram_bot');

const TOKEN = process.env.TELEGRAM_TEST_TOKEN;
if (TOKEN === undefined) {
  throw new Error('Telegram Bot token must be defined. See Readme.md in ./test');
}
const USERID = process.env.TELEGRAM_TEST_USER_ID;
if (USERID == undefined) {
  throw new Error('Telegram test user must be defined. See Readme.md in ./test');
}

describe('Telegram Bot', function() {
  /*
  * Before all tests, create an instance of the bot which is
  * accessible in the following tests.
  * And also set up the mountpoint to make the calls.
  */
  const telegramSettings = {
    credentials: {
      authToken: TOKEN
    },
    webhookEndpoint: '/telegram/webhook'
    // sessionStore, // optional
  };

  let telegramBot= null;

  before(function(){
    telegramBot = new TelegramBot(telegramSettings);
    app.use('/', telegramBot.app);
  });

  const baseIncommingMessage = { 
    message_id: 1,
    from: {id: USERID, first_name: 'Biggie', last_name: 'Smalls'},
    chat: { 
      id: USERID,
      first_name: 'Biggie',
      last_name: 'Smalls',
      type: 'private' 
    },
    date: 1468325836
  }

  const incommingTextMessage = _.cloneDeep(baseIncommingMessage);
  incommingTextMessage.text = "Party & Bullshit";

  const baseUpdateData = { 
    update_id: '466607164'
  };

  describe('#constructor()', function() {
    it('should throw an error when authToken credential is missing', function(done) {
      const badSettings = _.cloneDeep(telegramSettings);
      badSettings.credentials.authToken = undefined;
      expect(() => new TelegramBot(badSettings)).to.throw(
        'Credentials must have authToken');
      done();
    });
  });

  describe('/webhook endpoint works', function() {
    const requestOptions = {
      method: 'POST',
      uri: 'http://localhost:3000/telegram/webhook',
      body: {},
      json: true,
      resolveWithFullResponse: true
    };

    /*
    * just start a server listening on port 3000 locally
    * then close connection
    */
    let server = null
    before(function(done) {
      server = app.listen(3000, function() {
        console.log('test app listening on port 3000');
        done();
      })
    })

    after(function(done) {
      server.close(function() {
        console.log('test app closing and not listening anymore');
        done();
      });
    })

    it('should return a 200 statusCode when doing a standard request', function() {
      return request(requestOptions)
      .then(function(res) {
        assert.equal(200, res.statusCode);
      });
    })

    it('should emit a known event to the bot object when ' +
       'update is badly formatted', function(done) {

      telegramBot.on('error', function(err) {
        err.message.should.equal(`Error in __formatUpdate "Cannot read property 'from' of undefined". Please report this.`);
        done();
      })

      const options = _.cloneDeep(requestOptions);
      options.body = baseUpdateData;

      request(options);
    })

    it('should emit an update event to the bot object when ' +
       'update is well formatted', function(done) {

      telegramBot.on('update', function(update) {
        done();
      })

      const updateData = _.cloneDeep(baseUpdateData);
      updateData.message = incommingTextMessage;

      const options = _.cloneDeep(requestOptions);
      options.body = updateData;

      request(options);
    })

    it.only('should emit a standard error event to the bot object when ' +
       'developer codes error in on("update") block', function(done) {

      telegramBot.on('update', function(update) {
        telegramBot.blob(); // this is not an actual funcion => error expected
      })

      telegramBot.on('error', function(err) {
        err.message.should.equal(`Uncaught error: "telegramBot.blob is not a function". This is most probably on your end.`);
        done();
      })

      const updateData = _.cloneDeep(baseUpdateData);
      updateData.message = incommingTextMessage;

      const options = _.cloneDeep(requestOptions);
      options.body = updateData;

      request(options);
    })

  })

  describe('#__formatUpdate(rawUpdate)', function() {
    it('should format a text message update in the expected way', function() {
      const rawUpdate = _.cloneDeep(baseUpdateData);
      rawUpdate.message = incommingTextMessage;

      return telegramBot.__formatUpdate(rawUpdate)
      .then(function(update) {
        const expectedUpdate = {
          'raw': rawUpdate,
          'sender': {
            'id': rawUpdate.message.from.id
          },
          'recipient': {
            'id': TOKEN
          },
          'timestamp': rawUpdate.message.date * 1000,
          'message': {
            'mid': rawUpdate.update_id,
            'seq': rawUpdate.message.message_id,
            'text': rawUpdate.message.text
          }
        };
        expect(update).to.deep.equal(expectedUpdate);
      });

    })

    it('should format an audio message update in the expected way', function() {
      this.skip();
    })

    it('should format a voice message update in the expected way', function() {
      this.skip();
    })

    it('should format a document message update in the expected way', function() {
      this.skip();
    })

    it('should format a photo message update in the expected way', function() {
      this.skip();
    })

    it('should format a sticker message update in the expected way', function() {
      this.skip();
    })

    it('should format a video message update in the expected way', function() {
      this.skip();
    })

    it('should format a location message update in the expected way', function() {
      this.skip();
    })

    it('should format a photo with text message update in the expected way', function() {
      this.skip();
    })
  })

  // TODO: probably better off doing the messenger one tests before so I know
  // what the function looks like already and what to convert it to
  describe('#sendMessage(message)', function() {
    it('should succeed in sending a standard text message', function() {
      this.skip();
    })
  })

  // describe('Update Object upon receiving text only message from telegram', function() {

  //   const updateData

  //   beforeEach(function() {



  //   });

  //   it('should have the correct format', function(done) {
  //     const expectedUpdate = {
  //       'raw': {

  //       },
  //       'sender': {
  //         'id': USERID
  //       },
  //       'recipient': {
  //         'id': null
  //       },
  //       'timestamp': 1468325836000,
  //       'message': {
  //         'mid': '466607164',
  //         'seq': 1,
  //         'text': 'Hello World'
  //       }
  //     };

  //     telegramBot.on('update', function(update) {
  //       console.log(JSON.stringify(update, null, 2));
  //       // console.log(JSON.stringify(expectedUpdate, null, 2));

  //       const condition = _.isEqual(update, expectedUpdate);
  //       console.log(condition);

  //       // update.should.equal(expectedUpdate);
  //       expect(true).to.equal(true);
  //       // assert(_.isEqual(update, expectedUpdate));
  //       expect(expectedUpdate).to.deep.equal(update)
  //       // expect(1+1).to.equal(2)

  //       // assert.equal(update, expectedUpdate);
  //       // if (_.isEqual(update, expectedUpdate)) {
  //       //   console.log("how is that possible?")
  //       //   // throw new Error('Object is not as expected');
  //       // }
  //       // console.log("Well it isn't?")
  //       done();
  //     });

  //     // telegramBot.testSomething(function(update) {
  //     //   telegramBot.emit('update', update);
  //     // })

  //     // telegramBot.testSomething()
  //     // .then(function(update) {
  //     //   telegramBot.emit('update', update);
  //     // });

  //     // telegramBot.testSomething();

  //   })

  // })
});