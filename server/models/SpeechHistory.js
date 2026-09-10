const mongoose = require("mongoose");

const speechHistorySchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    voice: {
        type: String,
        required: true
    },
    audioUrl: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("SpeechHistory", speechHistorySchema);