const AccountModel = require('../models/account')
const ClassModel = require('../models/class');
const chatModel = require('../models/messenger');

const { data, param, css } = require('jquery')
var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt');
const mongodb = require("mongodb");
const sizeof = require('object-sizeof');


function findChat(person1ListChat, person2ListChat) {
    var check = false
    var _id
    for (var i = 0; i < person1ListChat.length; i++) {
        for (var u = 0; u < person2ListChat.length; u++) {
            if (person1ListChat[i] == person2ListChat[u]) {
                _id = person1ListChat[i]
                check = true;
                break;
            }
        }
    }
    return { check, _id };
}

class messtController {
    //ấn chat vào người bất kỳ r dẫn đến form chat và lịch sử
    async makeConnection(req, res, next) {
        try {
            let token = req.cookies.token
            let decodeAccount = jwt.verify(token, 'minhson')
            var sender = await AccountModel.findOne({ _id: decodeAccount }, { username: 1, avatar: 1, chat: 1 }).lean()
            var receiver = await AccountModel.findOne({ username: req.body.studentName }, { avatar: 1, chat: 1 }).lean()
            var receiverName = req.body.studentName
            var senderName = sender.username
            var person1ListChat = sender.chat
            var person2ListChat = receiver.chat
                //kiểm tra xem đã trò chuyện với nhau chưa
            var check = findChat(person1ListChat, person2ListChat)
                //chưa thì sẽ tạo mới cuộc trò chuyện
            if (check.check == false) {
                var createConnection = {
                    person1: sender.username,
                    person1Ava: sender.avatar,
                    person2: req.body.studentName,
                    person2Ava: receiver.avatar,
                    message: {
                        ownermessenger: "Hệ thống",
                        messContent: "Đã kết nối! Ấn vào để chat",
                    }
                }
                var data = await chatModel.create(createConnection)
                await AccountModel.updateMany({ username: { $in: [senderName, receiverName] } }, { $push: { chat: data._id } })
                next();
            } else {
                next();
            }
        } catch (e) {
            console.log(e)
            res.json({ msg: 'user not found' })
        }
    }


    //render giao diện chat cùng với lịch sử chat
    async chatForm(req, res) {
            try {
                let token = req.cookies.token
                let decodeAccount = jwt.verify(token, 'minhson')
                var sender = await AccountModel.findOne({ _id: decodeAccount }, { username: 1, chat: 1, role: 1 }).lean()
                var role = sender.role
                var data1 = await chatModel.find({ _id: { $in: sender.chat } }, {
                    // lấy tin nhắn cuối cùng trong mảng message
                    message: { $slice: -1 },
                }).sort({ updateTime: -1 }).lean()
                if (data1.length == "0") {
                    res.render("message/chatTrong.ejs", { role })
                } else {
                    if (sender.username != data1[0].person1) {
                        var formData = {
                            sender: data1[0].person2,
                            senderAva: data1[0].person2Ava,
                            receiver: data1[0].person1,
                            receiverAva: data1[0].person1Ava,
                        }
                    }
                    if (sender.username != data1[0].person2) {
                        var formData = {
                            sender: data1[0].person1,
                            senderAva: data1[0].person1Ava,
                            receiver: data1[0].person2,
                            receiverAva: data1[0].person2Ava,
                        }
                    }
                    var listID = sender.chat
                    var data = await chatModel.findOne({ _id: data1[0]._id }, { message: 1 }).lean()
                    res.render("message/chatBoxHistory.ejs", { data1, data, formData, listID, role })
                }
            } catch (e) {    
                if (e) {
                    res.json('error')
                }
            }
        }
        //lấy cuộc hội thoại
    getMessenger(req, res) {
        chatModel.findOne({ _id: req.query._idRoom }).lean().exec(function(err, data) {
            if (err) {
                res.json({ msg: 'error' });
            } else {
                res.json({ msg: 'success', data });
            }
        })
    }


    async addChat(req, res) {
        try {
            var receiverName = req.body.receiver
            var data = await AccountModel.findOne({ username: receiverName }, { username: 1, avatar: 1, chat: 1 }).lean()
            var receiverAva = data.avatar
            let token = req.cookies.token
            let decodeAccount = jwt.verify(token, 'minhson')
            var sender = await AccountModel.findOne({ _id: decodeAccount }, { username: 1, avatar: 1, chat: 1 }).lean()
            var senderName = sender.username
            var senderAva = sender.avatar
            var person1ListChat = sender.chat
            var person2ListChat = data.chat
                //tìm kiếm xem đã từng chat vs nhau chưa
            var check = findChat(person1ListChat, person2ListChat)
                //nếu chưa sẽ tạo cuộc trò chuyện mới
            if (check.check == false) {
                var createConnection = {
                    person1: senderName,
                    person1Ava: senderAva,
                    person2: receiverName,
                    person2Ava: receiverAva,
                    message: {
                        ownermessenger: "Hệ thống",
                        messContent: "Đã kết nối! Ấn vào để chat",
                    }
                }
                var data = await chatModel.create(createConnection)
                await AccountModel.updateMany({ username: { $in: [senderName, receiverName] } }, { $push: { chat: data._id } })
                var _idRoom = data._id
                res.json({ msg: 'tạo cuộc hội thoại thành công', senderName, _idRoom, receiverName, senderAva, receiverAva });
            } else {
                //nếu đã chat vs nhau rồi sẽ trả về cuộc trò chuyện
                var data = await chatModel.findOne({ _id: check._id }).lean()
                res.json({ msg: 'cuộc hội thoại đã được tạo', senderName, data, receiverName, senderAva, receiverAva });
            }
        } catch (error) {
            console.log(error)
            res.json({ msg: 'user not found' })
        }
    }
}

module.exports = new messtController;