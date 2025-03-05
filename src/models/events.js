const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    event: { type: String, required: true },
    url: { type: String, required: true },
    referrer: { type: String },
    device: { type: String, required: true },
    ipAddress: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: {
        browser: { type: String },
        os: { type: String },
        screenSize: { type: String },
    },
    userId: { type: String },
    appId: { type: String, required: true },
});

module.exports = mongoose.model('Event', eventSchema);
