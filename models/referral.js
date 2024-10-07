// models/Referral.js
const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referralId: { type: String, required: true, unique: true },
    clickCount: { type: Number, default: 0 },
    userPoints: { type: Number, default: 10 },
    ipAddresses: { type: [String], default: [] } // Array of IP addresses
});


module.exports = mongoose.model('Referral', referralSchema);
