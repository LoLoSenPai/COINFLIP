const mongoose = require('mongoose');
const { Schema } = mongoose;

// Mongoose model for users
const userSchema = new Schema({
    userId: { type: String, unique: true },
    solanaWallet: String,
    privateKey: String,
    balance: { type: Number, default: 0 },
    externalWallet: String,
});
const User = mongoose.model('User', userSchema);

module.exports = User;