const mongoose = require('mongoose');

const LoginModel = new mongoose.Schema({
    Email: String,
    Password: String
});

module.exports = mongoose.model('Login', LoginModel);