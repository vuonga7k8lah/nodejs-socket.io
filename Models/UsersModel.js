const mongoose = require('mongoose');

const UsersModel = new mongoose.Schema({
    Username: String,
    Email: String,
    Password: String
}, {
    timestamps: true,
});

module.exports = mongoose.model('Users', UsersModel);