const crypto = require('crypto');

const generateApiKey = () => {
    return 'apikey_' + crypto.randomBytes(16).toString('hex');
};

module.exports = generateApiKey;