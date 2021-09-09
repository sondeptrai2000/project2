const { JsonWebTokenError } = require('jsonwebtoken');
const AccountModel = require('../models/account');
const ClassModel = require('../models/class');
var jwt = require('jsonwebtoken');
const fs = require("fs")

var path = require('path');

var bcrypt = require('bcrypt');
const saltRounds = 10;
const { google } = require("googleapis")

//set up kết nối tới ggdrive
const KEYFILEPATH = path.join(__dirname, 'service_account.json')
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth(
    opts = {
        keyFile: KEYFILEPATH,
        scopes: SCOPES
    }
);
const driveService = google.drive(options = { version: 'v3', auth });


async function uploadFile(name, rootID, path) {
    var id = []
    id.push(rootID)
    var responese = await driveService.files.create(param = {
        resource: {
            "name": name,
            "parents": id
        },
        media: {
            body: fs.createReadStream(path = path)
        },
    })
    await driveService.permissions.create({
        fileId: responese.data.id,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });
    return responese.data.id
}
class studentController {
    studentHome(req, res) {
        res.json('Trang chủ student')
    }

    studentProfile(req, res) {
        let token = req.cookies.token
        let decodeAccount = jwt.verify(token, 'minhson')
        AccountModel.find({ _id: decodeAccount }).populate('classID').lean().exec((err, data) => {
            if (err) {
                res.json({ msg: 'error' });
            } else {
                res.cookie("username", data.username, { maxAge: 24 * 60 * 60 * 10000 });
                res.json({ msg: 'success', data: data });
            }
        })
    }

    async myAttended(req, res) {
        try {
            let token = req.cookies.token
            let decodeAccount = jwt.verify(token, 'minhson')
            console.log(req.query.classID)
            var data = await ClassModel.find({ _id: req.query.classID }, { schedule: 1, "studentID.absentRate": 1 }).populate({ path: "schedule.attend.studentID", select: { username: 1, avatar: 1 } }).lean();
            res.json({ msg: 'success', data: data, studentID: decodeAccount._id });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });

        }
    }




    allClass(req, res) {
        var params = req.params.id
        var studentName = req.cookies.username
        if (params != "0") res.render('student/allClass', { params, studentName })
        if (params == "0") res.render('student/allClass', { studentName })
    }


    async getClass(req, res) {
        try {
            let token = req.cookies.token
            let decodeAccount = jwt.verify(token, 'minhson')
            var classInfor = await AccountModel.find({ _id: decodeAccount._id }).populate({
                path: 'classID',
                populate: {
                    path: 'teacherID',
                    select: 'username',
                }
            }).lean()
            res.json({ msg: 'success', classInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }


    getTeacherProfile(req, res) {
        AccountModel.find({ _id: req.query.abc }, { username: 1, email: 1, avatar: 1 }).lean().exec(function(err, data) {
            if (err) {
                res.json({ msg: 'error' });
            } else {
                res.json({ msg: 'success', data: data });
            }
        })
    }

    allClassStudent(req, res) {
        var _id = req.query.abc
        ClassModel.find({ _id: _id }).populate('studentID.ID', { username: 1, email: 1, avatar: 1 }).lean().exec((err, selectedClassInfor) => {
            if (err) {
                res.json({ msg: 'error' });
            } else {
                res.json({ msg: 'success', data: selectedClassInfor });
            }
        })
    }

    async doeditAccount(req, res) {
        try {
            var check = await AccountModel.find({ email: req.body.formData1.email }).lean()
            var checkphone = await AccountModel.find({ phone: req.body.formData1.phone }).lean()
            if (check.length != 1) {
                res.json({ msg: 'Account already exists' })
            } else if (checkphone.length != 1) {
                res.json({ msg: 'Phone already exists' })
            } else {
                var password = req.body.password
                var formData1 = req.body.formData1
                if (password.length != 0) {
                    const salt = bcrypt.genSaltSync(saltRounds);
                    const hash = bcrypt.hashSync(password, salt);
                    formData1["password"] = hash
                }
                if (req.body.file != "none") {
                    var path = __dirname.replace("controller", "public/avatar") + '/' + req.body.filename;
                    var image = req.body.file;
                    var data = image.split(',')[1];
                    fs.writeFileSync(path, data, { encoding: 'base64' });
                    var response = await uploadFile(req.body.filename, "11B3Y7b7OJcbuqlaHPJKrsR2ow3ooKJv1", path)
                    if (!response) res.json({ msg: 'error' });
                    formData1["avatar"] = "https://drive.google.com/uc?export=view&id=" + response
                    var oldImg = req.body.oldLink
                    oldImg = oldImg.split("https://drive.google.com/uc?export=view&id=")[1]
                    await driveService.files.delete({ fileId: oldImg })
                }
                await AccountModel.findOneAndUpdate({ _id: req.body.id }, formData1)
                res.json({ msg: 'success', data: data });
            }
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }
    viewschedule(req, res) {
        res.render('student/schedule')
    }


    async getSchedule(req, res) {
        try {
            var token = req.cookies.token
            var decodeAccount = jwt.verify(token, 'minhson')
            var studentID = decodeAccount._id
                //lấy thời hiện tại để lấy khóa học đang hoạt động trong thời gian hiện tại. 
            var sosanh = new Date(req.query.dauTuan)
            var data = await AccountModel.findOne({ _id: decodeAccount }, { classID: 1 }).lean()
            var classInfor = await ClassModel.find({ _id: { $in: data.classID }, startDate: { $lte: new Date(req.query.dauTuan) }, endDate: { $gte: sosanh } }).lean()
            res.json({ msg: 'success', classInfor, studentID });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }


    allextracurricularActivities(req, res) {
        res.json('Trang xem tất cả các hoạt động ngoại khóa mà con đã tham gia + đánh giá')
    }

    allChat(req, res) {
        res.json('Tất cả những cuộc trò chuyện')
    }

    connectToChat(req, res) {
        res.json('chọn người để trò chuyện')
    }

    chatConversation(req, res) {
        res.json('Thực hiện cuộc trò chuyện')
    }


}
module.exports = new studentController