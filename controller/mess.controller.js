const AccountModel = require('../models/account')
const chatModel = require('../models/messenger');
var jwt = require('jsonwebtoken');

//tìm xem giữa 2 người đã từng chat hay chưa
function findChat(person1ListChat, person2ListChat) {
    var check = false
    var _id
    for (var i = 0; i < person1ListChat.length; i++) {
        for (var u = 0; u < person2ListChat.length; u++) {
            if (person1ListChat[i] == person2ListChat[u]) {
                _id = person1ListChat[i];
                check = true;
                break;
            }
        }
    }
    // trả về kết quả , nếu true thì sẽ trả về cả _id của cuộc trò chuyện
    return { check, _id };
};

class messtController {
    //ấn chat vào người bất kỳ r dẫn đến form chat và lịch sử
    async makeConnection(req, res, next) {
        try {
            let token = req.cookies.token
            let decodeAccount = jwt.verify(token, 'minhson')
            var sender = await AccountModel.findOne({ _id: decodeAccount }, { chat: 1 }).lean()
            var receiver = await AccountModel.findOne({ _id: req.body.studentID }, { chat: 1 }).lean()
            var person1ListChat = sender.chat;
            var person2ListChat = receiver.chat;
            //kiểm tra xem đã trò chuyện với nhau chưa
            var check = findChat(person1ListChat, person2ListChat);
            //chưa thì sẽ tạo mới cuộc trò chuyện
            if (check.check == false) {
                var createConnection = { person1: sender._id, person2: receiver._id, message: { ownermessenger: "Hệ thống", messContent: "Đã kết nối! Ấn vào để chat", } }
                var data = await chatModel.create(createConnection)
                await AccountModel.updateMany({ _id: { $in: [sender._id, receiver._id] } }, { $push: { chat: data._id } })
                next();
            } else { next(); }
        } catch (e) {
            console.log(e)
            return res.json({ msg: 'user not found' })
        }
    }


    //render giao diện chat cùng với lịch sử chat
    async chatForm(req, res) {
        try {
            let token = req.cookies.token
            let decodeAccount = jwt.verify(token, 'minhson')
            var sender = await AccountModel.findOne({ _id: decodeAccount._id }, { username: 1, chat: 1, role: 1 }).lean();
            //lấy list chat để join người user vào các phòng để nhận tin nhắn chat
            var listID = sender.chat;
            //lấy role để tùy biến cho header
            var role = sender.role;
            if (listID.length == 0) {
                return res.render("message/emptyChat.ejs", { role, senderName: sender.username, senderAvatar: sender.avatar, senderID: sender._id })
            } else {
                // lấy tin nhắn cuối cùng trong mảng message để hiển thị trong lịch sử chat
                var data1 = await chatModel.find({ _id: { $in: listID } }, { message: { $slice: -1 }, }).populate({ path: 'person1', select: ' username avatar' }).populate({ path: 'person2', select: ' username avatar' }).sort({ updateTime: -1 }).lean();
                //xác định người gửi trong đoạn chat đầu tiên để hiển thị
                if (sender._id.toString() == data1[0].person1._id.toString()) {
                    var formData = { senderID: data1[0].person1._id, senderName: data1[0].person1.username, receiverID: data1[0].person2._id, receiverName: data1[0].person2.username }
                } else { var formData = { senderID: data1[0].person2._id, senderName: data1[0].person2.username, receiverID: data1[0].person1._id, receiverName: data1[0].person1.username } }
                return res.render("message/chatBoxHistory.ejs", { data1, formData, listID, role })
            }
        } catch (e) {   
            console.log(e) 
            return res.json('error')

        }
    };

    //lấy cuộc hội thoại
    async getMessenger(req, res) {
        try {
            var token = req.cookies.token
            var decodeAccount = jwt.verify(token, 'minhson')
                //lấy trạng thái read của cuọc hồi thoại
            var chatInfor = await chatModel.findOne({ _id: req.query._idRoom }, { read: 1 }).lean();
            //lấy chưa read thì sẽ thêm id vào read để thành read (Note: cuộc trò chuyện có 2 người, nếu mảng read = 2 thì nghĩa là cả 2 đã đọc)
            if (!chatInfor.read.includes(decodeAccount._id)) await chatModel.findOneAndUpdate({ _id: req.query._idRoom }, { $push: { read: decodeAccount._id } });
            //trả về cuộc trò chuyện
            var data = await chatModel.findOne({ _id: req.query._idRoom }).populate({ path: 'person1', select: ' username avatar', }).populate({ path: 'person2', select: ' username avatar', }).lean()
            return res.json({ msg: 'success', data });
        } catch (e) {
            console.log(e);
            return res.json({ msg: 'error' });
        }
    };
    //gửi thông báo số tin nhắn chưa đọc
    async unreadMess(req, res) {
        try {
            var token = req.cookies.token
            var decodeAccount = jwt.verify(token, 'minhson')
                //lấy trạng thái read của cuọc hồi thoại
            var Account = await AccountModel.findOne({ _id: decodeAccount }, { chat: 1 }).lean();
            var unReadMess = await chatModel.find({ _id: { $in: Account.chat }, read: { $nin: decodeAccount._id } }).lean().countDocuments()
            console.log(unReadMess)
            return res.json({ msg: 'success', unReadMess });
        } catch (e) {
            console.log(e);
            return res.json({ msg: 'error' });
        }
    }

    async addChat(req, res) {
        try {
            //lấy thông tin người muốn kết nối
            var condition = req.body.condition
            var receiver = await AccountModel.findOne(condition, { username: 1, avatar: 1, chat: 1 }).lean()
            let token = req.cookies.token
            let decodeAccount = jwt.verify(token, 'minhson')
            var sender = await AccountModel.findOne({ _id: decodeAccount }, { username: 1, avatar: 1, chat: 1 }).lean()
            if (receiver && receiver._id.toString() != sender._id.toString()) {
                var person1ListChat = sender.chat
                var person2ListChat = receiver.chat
                    //tìm kiếm xem đã từng chat vs nhau chưa
                var check = findChat(person1ListChat, person2ListChat)
                    //nếu chưa sẽ tạo cuộc trò chuyện mới
                if (check.check == false) {
                    var createConnection = { person1: sender._id, person2: receiver._id, message: { ownermessenger: "Hệ thống", messContent: "Đã kết nối! Ấn vào để chat" } }
                    var data = await chatModel.create(createConnection);
                    //thêm id cuộc trò chuyện vào lịch sử trò chuyển ở thông tin người dùng
                    await AccountModel.updateMany({ _id: { $in: [receiver._id, sender._id] } }, { $push: { chat: data._id } })
                    var idRoom = data._id
                    return res.json({ msg: 'createSuccess', receiver, idRoom });
                } else {
                    //nếu đã chat vs nhau rồi sẽ trả về cuộc trò chuyện
                    var data = await chatModel.findOne({ _id: check._id }).lean()
                    var receiverID = receiver._id
                    var idRoom = data._id
                    return res.json({ msg: 'conversation is already exist ', receiverID, idRoom });
                }
            } else { return res.json({ msg: 'user not found' }) }
        } catch (error) {
            console.log(error)
            return res.json({ msg: 'error' })
        }
    }
}

module.exports = new messtController;