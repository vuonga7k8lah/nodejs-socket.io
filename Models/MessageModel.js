const mongoose = require('mongoose');

const messageModel = mongoose.Schema({
    RoomID: String,
    UserID: String,
    Message: String
}, {
    timestamps: true,
});

module.exports = mongoose.model('Message', messageModel);