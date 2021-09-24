const express = require("express");
const app = express();
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')
var path = require('path');
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const chatModel = require('./models/messenger');
var hbs = require('hbs');
app.set('views', './views');
app.set('view engine', 'hbs');
app.set('view-engine', 'ejs');
app.use(cookieParser())
app.get('/', function(req, res) {
    res.clearCookie("token");
    res.clearCookie("username");
    res.render('index/SownEnglish')
});
var pathh = path.resolve(__dirname, 'public');
app.use(express.static(pathh));
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
hbs.registerPartials(__dirname + '/views/header');
//set the path of the jquery file to be used from the node_module jquery package  
app.use('/jquery', express.static(path.join(__dirname + '/node_modules/jquery/dist/')));

//set static folder(public) path  
app.use(express.static(path.join(__dirname + '/public')));
var index = require('./routes/index.route')
app.use('/', index);
var account = require('./routes/account.route')
app.use('/account', account);
var admin = require('./routes/admin.route')
app.use('/admin', admin);
var teacher = require('./routes/teacher.route')
app.use('/teacher', teacher);
var student = require('./routes/student.route')
app.use('/student', student);
var guardian = require('./routes/guardian.route')
app.use('/guardian', guardian);
var messenger = require('./routes/mess.route')
app.use('/messenger', messenger);


//tiến hành cài đặt cho chat box
const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);

//real-time in chat
io.on("connection", function(socket) {
    socket.on("tao-room", function(data) {
        data = data.idConversationList
        for (var i = 0; i < data.length; i++) {
            socket.Phong = data[i];
            socket.join(data[i]);
        }
    })

    socket.on("user-chat", async function(data) {
        try {
            await chatModel.findOneAndUpdate({ _id: data._idRoom }, {
                $push: { message: { ownermessengerID: data.senderID, ownermessenger: data.senderName, messContent: data.mess, time: new Date } },
                read: [data.senderID],
                updateTime: new Date,
            })
            socket.Phong = data._idRoom
            io.sockets.in(socket.Phong).emit("server-chat", data)
        } catch (e) {
            console.log(e)
        }
    })

    socket.on("typing", function(data) {
        socket.Phong = data._idRoom
        io.sockets.in(socket.Phong).emit("Typing", data)
    })

    socket.on("stopTyping", function(data) {
        socket.Phong = data._idRoom
        io.sockets.in(socket.Phong).emit("notTyping", data)
    })
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log(`Server is running on port ${PORT}.`) });