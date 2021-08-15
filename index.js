const express = require('express');
const app = express();
const db = require('./Database/connect');
let server = require('http').Server(app);
const io = require('socket.io')(server);

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
//config method- override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


// config theme plate
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
server.listen(3000);
io.sockets.on('connection', function(socket) {
    console.log('connect co id: ' + socket.id);

    socket.on("SEND DATA", function(data) {
        console.log('id ' + socket.id + 'voi message la: ' + data);
        io.sockets.emit("server-send-data", "Day la sever 111");
    });

});


// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//Models
var TestModel = require('./Models/TestModel');

app.get('/me/profiles', function(req, res) {
    res.render('profile/create');
});
app.post("/me/profiles", function(req, res) {
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
app.get('/me/list', function(req, res) {
    TestModel.find({}, function(err, data) {

        if (err) {
            res.send('error create');
        } else {
            res.render('profile/list', { "data": data });
        }
    });
});
app.get('/me/edit', function(req, res) {
    TestModel.findOne({ "_id": req.query.id }, function(err, data) {
        if (err) {
            res.send('error update');
        } else {
            res.render('profile/edit', { "data": data });
        }
    });
});
app.put('/me/update/:id', function(req, res) {
    //TestModel.findByIdAndUpdate()
    console.log(req.body);
    res.json({
        "name": req.body.name,
        "id": req.params.id,
        "level": req.body.level,
    });

});

app.get('/', function(req, res) {
    res.render('socket.io/home');
});