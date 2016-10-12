'use strict';

const crypto = require('crypto');

module.exports = {
  getMessengerSignatureHeader: function(updateData, fbAppSecret) {
    const hash = crypto.createHmac('sha1', fbAppSecret)
      .update(JSON.stringify(updateData))
      .digest('hex');

    return `sha1=${hash}`;
  }
};
