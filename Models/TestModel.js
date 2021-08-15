const mongoose = require('mongoose');

const TestModel = new mongoose.Schema({
    Name: String,
    Image: String,
    Level: Number
}, {
    timestamps: true,
});
module.exports = mongoose.model('Test', TestModel);