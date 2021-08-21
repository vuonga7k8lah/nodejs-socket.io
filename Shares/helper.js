let UserModel = require('../Models/UsersModel');

function getListUser() {
    let aData = [];
    UserModel.find({}, function(err, data) {

        if (err) {
            console.log(err);
        } else {
            data.forEach(user => {
                aData.push({
                    'username': user.Username,
                    'email': user.Email,
                    'isOnline': false,
                });
            });
            console.log(aData)
            return aData;
        }
    });

}

module.exports = {
    getListUser
}