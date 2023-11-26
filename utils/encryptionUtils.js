const crypto = require('crypto');
require('dotenv').config();

const algorithm = 'aes-256-ctr';
const secretKey = process.env.ENCRYPTION_KEY;
const iv = crypto.randomBytes(16);

const encrypt = (buffer) => {
    const keyBuffer = Buffer.from(secretKey, 'hex');
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hashString) => {
    const hash = JSON.parse(hashString);
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), Buffer.from(hash.iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return Array.from(new Uint8Array(decrypted));
};

module.exports = {
    encrypt,
    decrypt
};
