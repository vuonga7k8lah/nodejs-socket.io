const jwt = require('jsonwebtoken');

function isLogin(req, res, next) {
    let token = req.cookies['token'];
    jwt.verify(token, 'vuong_kma', function(err, decoded) {
        if (decoded) {
            next();
        } else {
            res.redirect('/me/login');
        }
    });
}

module.exports = {
    isLogin
}