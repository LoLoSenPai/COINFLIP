const { encrypt, decrypt } = require('./utils/encryptionUtils');

const originalPrivateKeyArray = [
    200, 110, 10, 232, 240, 29, 104, 60, 3, 85, 122,
    89, 231, 245, 95, 59, 27, 6, 33, 67, 186, 234,
    121, 137, 226, 46, 35, 42, 87, 78, 195, 176, 81,
    51, 37, 183, 120, 177, 124, 198, 174, 226, 236, 157,
    225, 52, 212, 139, 204, 221, 217, 248, 3, 213, 202,
    198, 32, 140, 194, 175, 177, 238, 116, 82
];
console.log(`Original private key (Array) : ${originalPrivateKeyArray}`);

const originalPrivateKeyBuffer = Buffer.from(originalPrivateKeyArray);
const encryptedKey = encrypt(originalPrivateKeyBuffer);
console.log(`Encrypted private key: ${JSON.stringify(encryptedKey)}`);

const decryptedKeyArray = decrypt(JSON.stringify(encryptedKey));
console.log(`Decrypted private key (Array) : ${decryptedKeyArray}`);

console.log(`Are they equal ? ${JSON.stringify(originalPrivateKeyArray) === JSON.stringify(decryptedKeyArray)}`);