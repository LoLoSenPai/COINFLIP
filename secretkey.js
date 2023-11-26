const crypto = require('crypto');

// Generate a secret key for encrypting/decrypting data
const generateSecretKey = () => {
    return crypto.randomBytes(32).toString('hex');
};

console.log(generateSecretKey());