const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://vuonga7k8lnc:Vuonga7k8kma@cluster0.fybal.mongodb.net/test1?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connect successfully !!');
    } catch (error) {
        console.log(error)
    }
}
module.exports = { connect };