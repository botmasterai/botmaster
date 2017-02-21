'use strict';
const BotContext = require('../lib/BotContext');
const BaseBot = require('../lib/bot_types/base_bot');
const assert = require('chai').assert;


describe('BotContext', function() {
    it('is instantiable', function() {
        const botContext = new BotContext();
        assert(botContext);
    });

    it('sends the update through in sendExtraArgs', function(done) {
        const update = {justATest: true};
        const botContext = new BotContext(
            {
                sendMessage: function(message, sendOptions) {
                    assert(sendOptions.update === update);
                    done();
                },
                __getSendExtraArgs: BaseBot.prototype.__getSendExtraArgs
            },
            update
        );

        botContext.sendMessage({text: 'hi'});
    });
});
