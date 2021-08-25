const mongoose = require('mongoose');

const contactModel = mongoose.Schema({
    Name: String,
    Email: String,
    Title: String,
    Content: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('ContactModel', contactModel);