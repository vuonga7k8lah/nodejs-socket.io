const express = require('express');
const app = express();
const db = require('./Database/connect');
const cookieParser = require('cookie-parser')
let server = require('http').Server(app);
const io = require('socket.io')(server);
const Port = process.env.PORT || 3000;

//connect database
db.connect();

//multer
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/upload')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        console.log(file);
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/git") {
            cb(null, true)
        } else {
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("image");

//cookie parser
app.use(cookieParser());

//shares
let helper = require('./Shares/helper');


//config method- override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//config jwt
var jwt = require('jsonwebtoken');
const secretKey = 'vuong_kma';

// config bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//middleware
let middleware = require('./Middleware/Middleware');

//Models
var TestModel = require('./Models/TestModel');
let RegisterModel = require('./Models/UsersModel');
const { json } = require('body-parser');
const UsersModel = require('./Models/UsersModel');
let ContactModel = require('./Models/ContactModel');
let MessageModel = require('./Models/MessageModel');

// config theme plate
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
server.listen(Port);


//socket io
let aListUser = [];
UsersModel.find({}, function(err, data) {

    if (err) {
        console.log(err);
    } else {
        data.forEach(user => {
            aListUser.push({
                'username': user.Username,
                'email': user.Email,
                'status': 'Offline',
            });
        });
    }
});
let aMessage = [];



io.sockets.on('connection', function(socket) {

    socket.on("SEND DATA", function(data) {
        aMessage = [];
        MessageModel.find({}, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                data.forEach(message => {
                    let username = '';
                    let email = '';
                    UsersModel.findOne({ _id: message.UserID }, function(err, user) {
                        if (err) {
                            console.log(err);
                        } else {
                            username = user.Username;
                            email = user.Email;
                        }
                    })
                    aMessage.push({
                        'username': username,
                        'email': email,
                        'message': message.Message,
                    });
                });
            }
        });
        // data{
        //     "username": username,
        //     "id": id
        // }
        socket.Username = data.username;
        socket.UserID = data.id;
        aListUser.forEach(user => {
            if (Object.values(user).includes(data.username)) {
                user.status = 'Online';
            }
        });
        io.sockets.emit("list user active", aListUser);
        io.sockets.emit("addListMessage", aMessage);
    });
    socket.on("send massage", function(data) {

        const messageModel = new MessageModel({
            RoomID: '1',
            UserID: socket.UserID,
            Message: data.message
        });
        messageModel.save(function(err) {
            if (err) {
                res.json({
                    'status': 'error',
                    'message': 'update message error',
                });
            } else {
                aMessage.push({
                    "username": socket.Username,
                    "message": data.message
                });
                io.sockets.emit("addListMessage", aMessage);
            }
        });
    })
    socket.on("logout", function(data) {
        aListUser.forEach(user => {
            if (Object.values(user).includes(data.username)) {
                user.status = 'Offline';
            }
        });
        io.sockets.emit("list user active", aListUser);

    });
});

app.get('/me/profiles', middleware.isLogin, function(req, res) {
    res.render('profile/create');
});
app.post("/me/profiles", middleware.isLogin, function(req, res) {
    //upload file 
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            console.log("A Multer error occurred when uploading.");
        } else if (err) {
            console.log("An unknown error occurred when uploading." + err);
        } else {
            const test = new TestModel({
                "Name": req.body.name,
                "Level": req.body.level,
                "Image": req.file.filename,
            });
            test.save(function(err) {
                if (err) {
                    res.send('error create');
                } else {
                    res.redirect('/me/list');
                }
            });
        }
    });
});
app.get('/me/list', middleware.isLogin, function(req, res) {
    TestModel.find({}, function(err, data) {

        if (err) {
            res.send('error create');
        } else {
            res.render('profile/list', { "data": data });
        }
    });
});
app.get('/me/edit', middleware.isLogin, function(req, res) {
    TestModel.findOne({ "_id": req.query.id }, function(err, data) {
        if (err) {
            res.send('error update');
        } else {
            res.render('profile/edit', { "data": data });
        }
    });
});
app.put('/me/update/:id', middleware.isLogin, function(req, res) {
    //TestModel.findByIdAndUpdate()
    console.log(req.body);
    res.json({
        "name": req.body.name,
        "id": req.params.id,
        "level": req.body.level,
    });

});

app.get('/', middleware.isLogin, function(req, res) {
    res.render('socket.io/home');
});

app.get('/me/login', function(req, res) {
    res.render('account/login');
});
app.get('/me/register', function(req, res) {
    res.render('account/register');
});
app.get('/me/logout', function(req, res) {
    res.clearCookie('token');
    res.render('account/login');
});
app.post('/me/register', function(req, res, next) {
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
    if (password !== confirmPassword) {
        res.json({
            'status': 'error',
            'message': 'Passwords must be same',
        });
    }
    RegisterModel.findOne({ "email": req.body.email }).then(
        data => {
            if (data) {
                res.json({
                    'status': 'error',
                    'message': 'Sorry the email is exist',
                });
            } else {
                bcrypt.hash(password, saltRounds, function(err, hash) {
                    let passwordBcrypt = hash;
                    const registerUser = new UsersModel({
                        Username: username,
                        Email: email,
                        Password: passwordBcrypt
                    });
                    registerUser.save(function(err) {
                        if (err) {
                            res.json({
                                'status': 'error',
                                'message': 'create user successfully',
                            });
                        } else {
                            res.redirect('/me/login');
                        }
                    });
                });
            }
        }
    ).catch(next);
});
app.post('/me/login', function(req, res, next) {
    let email = req.body.email;
    let password = req.body.password;
    RegisterModel.findOne({
        Email: email,
    }).then(
        data => {
            bcrypt.compare(password, data.Password, function(err, result) {
                if (result) {
                    let token = jwt.sign({ id: data._id }, secretKey, { expiresIn: '1h' });
                    res.cookie('token', token, { expires: new Date(Date.now() + 900000) });
                    res.render('chatRoom/chatRoom', { "data": data });
                } else {
                    res.json({
                        'status': 'error',
                        'message': 'sorry, login error',
                    });
                }
            });
        }
    ).catch(next);
});
app.get('/chatRoom', middleware.isLogin, function(req, res) {
    res.render('chatRoom/chatRoom');
});