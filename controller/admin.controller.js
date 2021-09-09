const { JsonWebTokenError } = require('jsonwebtoken');
const AccountModel = require('../models/account');
const studyRouteModel = require('../models/studyRoute');
const ClassModel = require('../models/class');
const consultingInformationModel = require('../models/consultingInformation');
const assignRoomAndTimeModel = require('../models/assignRoomAndTime');

const fs = require("fs")
const readline = require("readline")
const { google } = require("googleapis")
var path = require('path');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
const saltRounds = 10;

const { data } = require('jquery');
const { inflate } = require('zlib');
const nodemailer = require('nodemailer');


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

// set up mail sever
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'fptedunotification@gmail.com',
        pass: 'son@123a'
    },
    tls: {
        rejectUnauthorized: false
    }
});


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
class adminController {
    async adminHome(req, res) {
        // AccountModel.updateMany({}, { $set: { classID: [] } }, function(err, data) {
        //     if (err) {
        //         console.log("k ok")
        //     } else {
        //         console.log(" ok")
        //     }
        // })
        // assignRoomAndTimeModel.updateMany({}, {
        //     $set: { room: [] }
        // }, function(err, data) {
        //     if (err) {
        //         console.log("k ok 2")
        //     } else {
        //         console.log(" ok 2 ")
        //     }
        // })
        res.json(data)
            // res.render('admin/adminHome')
    }

    async assignRoomAndTime(req, res) {
        try {
            var data = await assignRoomAndTimeModel.find({})
            res.render('admin/assignRoomAndTime', { data })
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async addRoom(req, res) {
        try {
            await assignRoomAndTimeModel.updateMany({}, { $push: { room: { $each: req.body.roomName } } })
            res.json({ msg: 'success' });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async deleteClass(req, res) {
        try {
            var classInfor = await ClassModel.findOne({ _id: req.query.id })
            var listStudentID = []
            if (classInfor.studentID.length != 0) {
                classInfor.studentID.forEach((e) => {
                    listStudentID.push(e.ID)
                })
                await AccountModel.updateMany({ _id: { $in: listStudentID } }, { $pull: { classID: req.query.id } })
            }

            await ClassModel.deleteOne({ _id: req.query.id })
            res.json({ msg: 'success', data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async getThu(req, res) {
        try {
            var dayOfWeek = '0' + req.query.dayOfWeek
            var data = await assignRoomAndTimeModel.find({ dayOfWeek })
            res.json({ msg: 'success', data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async getTime(req, res) {
        try {
            var data = await ClassModel.find({ teacherID: req.query.teacherID, classStatus: "Processing" }, { schedule: { $elemMatch: { day: '0' + req.query.dayOfWeek } } })
            res.json({ msg: 'success', data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async doupdateSchedule(req, res) {
        try {
            var oldSchuedule = req.body.old
            var update = req.body.update
            update["schedule.$.date"] = new Date(req.body.date)
            await ClassModel.updateOne({ _id: req.body.classID, "schedule._id": req.body.scheduleID }, { $set: update })
            await assignRoomAndTimeModel.updateOne({ dayOfWeek: update['schedule.$.day'], room: { $elemMatch: { room: update['schedule.$.room'], time: update['schedule.$.time'] } } }, { $set: { "room.$.status": "Ok" } })
            var getListEmail = await ClassModel.find({ _id: req.body.classID }, { "studentID.ID": 1, className: 1 }).populate({ path: 'studentID.ID', select: 'email' }).lean()
            var listEmail = ""
            getListEmail[0].studentID.forEach(element => {
                listEmail = listEmail + element.ID.email + ', '
            })
            listEmail.slice(0, -2)
            var content = 'Do 1 số vấn đề giáo viên, buổi học của lớp ' + getListEmail[0].className + ' vào ngày ' + oldSchuedule[0] + ' từ ' + oldSchuedule[3] + " chuyển sang ngày " + update['schedule.$.date'] + ' từ ' + update['schedule.$.time'] + '.';
            var mainOptions = {
                from: 'fptedunotification@gmail.com',
                to: listEmail,
                subject: 'Notification',
                text: content
            }
            await transporter.sendMail(mainOptions)
            res.json({ msg: 'success' });
        } catch (e) {    
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    //lấy account ở trang ?
    async getAccount(req, res) {
        try {
            //số tài khoản hiển thị trên 1 trang
            var accountPerPage = 1
            var numberOfAccount = await AccountModel.find({ role: req.query.role }).lean().countDocuments()
            var skip = parseInt(req.query.sotrang) * accountPerPage
            var soTrang = numberOfAccount / accountPerPage + 1
            var data = await AccountModel.find({ role: req.query.role }).populate("relationship", { username: 1, email: 1, phone: 1 }).skip(skip).limit(1).lean()
            res.json({ msg: 'success', data, numberOfAccount, soTrang });
        } catch (e) {    
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    //đếm số lượng account dựa trên role
    async count(req, res) {
        try {
            //số tài khoản hiển thị trên 1 trang
            var accountPerPage = 1
            var numberOfAccount = await AccountModel.find({ role: req.query.role }).lean().countDocuments()
            var soTrang = numberOfAccount / accountPerPage + 1
            res.json({ msg: 'success', soTrang });
        } catch (e) {    
            console.log(e)
            res.json({ msg: 'error' });
        }

    }
    async studentClass(req, res) {
        try {
            var data = await AccountModel.findOne({ _id: req.params.id }).populate({
                path: 'classID',
                populate: {
                    path: 'teacherID',
                    select: 'username',
                }
            }).lean()
            res.render('admin/studentClassDetail', { data: [data] })
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async search(req, res) {
        try {
            var condition = req.query.condition
            var data = await AccountModel.findOne(condition).populate("relationship").lean()
            if (!data) res.json({ msg: 'none' });
            if (data) res.json({ msg: 'success', data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async createAccount(req, res) {
        try {
            var numberOfAccount = await AccountModel.find({ role: "teacher" }).lean().countDocuments()
            var targetxxx = await studyRouteModel.find({}).lean()
            var data = await AccountModel.find({ role: "teacher" }).lean()
            res.render('admin/createAccount', { data, targetxxx, numberOfAccount })
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async getRoute(req, res) {
        try {
            var data = await studyRouteModel.find({}).lean()
            res.json({ msg: 'success', data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async getStage(req, res) {
        try {
            var targetxxx = await studyRouteModel.find({ routeName: req.query.abc }).lean()
            var student = await AccountModel.find({ role: 'student', routeName: req.query.abc, stage: req.query.levelS }).lean()
            var data = await studyRouteModel.find({ routeName: req.query.abc }).lean()
            res.json({ msg: 'success', data, student, targetxxx });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async getStudent(req, res) {
        try {
            var student = await AccountModel.find({ role: 'student', routeName: req.query.abc, stage: req.query.levelS }).lean()
            res.json({ msg: 'success', student });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async createRoute(req, res) {
        try {
            res.render('admin/createRoute')
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async getAllRoute(req, res) {
        try {
            var data = await studyRouteModel.find({}, { _id: 1, routeName: 1, description: 1 }).lean()
            res.json({ msg: 'success', data })
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }


    async lol(req, res) {
        try {
            var data = await studyRouteModel.find({ _id: req.query._id }).lean()
            res.json({ msg: 'success', data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async docreateRoute(req, res) {
        try {
            await studyRouteModel.create({ routeName: req.body.routeName, description: req.body.description, routeSchedual: req.body.schedule, })
            res.json({ msg: 'success' })
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }


    async searchRoute(req, res) {
        // try {
        //     console.log(req.query.name)
        //     await studyRouteModel.find({ $text: { $search: "coffee" } } { routeName: { $regex: "/^doanh/" } })
        //     res.json({ msg: 'success' })
        // } catch (e) {
        //     console.log(e)
        //     res.json({ msg: 'error' });
        // }
    }

    async doUpdateRoute(req, res) {
        try {
            await studyRouteModel.findOneAndUpdate({ _id: req.body.id }, { routeName: req.body.routeName, description: req.body.description, routeSchedual: req.body.schedule, })
            res.json({ msg: 'success' })
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async deleteRoute(req, res) {
        try {
            await studyRouteModel.deleteOne({ _id: req.body.id })
            res.json({ msg: 'success' });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }


    async doCreateAccount(req, res) {
        try {
            var check = await AccountModel.find({ email: req.body.student.email }).lean()
            var check1 = await AccountModel.find({ email: req.body.phuhuynh.email }).lean()
            var checkphone = await AccountModel.find({ phone: req.body.student.phone }).lean()
            var checkphone1 = await AccountModel.find({ phone: req.body.phuhuynh.phone }).lean()
            if (check.length != 0 || check1.length != 0) {
                res.json({ msg: 'Account already exists' })
            } else if (checkphone.length != 0 || checkphone1.length != 0) {
                res.json({ msg: 'Phone already exists' })
            } else {
                var path = __dirname.replace("controller", "public/avatar") + '/' + req.body.filename;
                var image = req.body.file;
                var data = image.split(',')[1];
                fs.writeFileSync(path, data, { encoding: 'base64' });
                var response = await uploadFile(req.body.filename, "11B3Y7b7OJcbuqlaHPJKrsR2ow3ooKJv1", path)
                var fileLink = "https://drive.google.com/uc?export=view&id=" + response
                var student = req.body.student
                var phuhuynh = req.body.phuhuynh
                var role = student.role
                var password = req.body.password
                const salt = bcrypt.genSaltSync(saltRounds);
                const hash = bcrypt.hashSync(password, salt);
                student["avatar"] = fileLink
                student["password"] = hash
                if (role === "teacher") {
                    await AccountModel.create(student)
                    res.json({ msg: 'success' });
                }
                if (role === "student") {
                    var studentAcc = await AccountModel.create(student)
                    phuhuynh["relationship"] = studentAcc._id
                    var guardianAcc = await AccountModel.create(phuhuynh)
                    var relationship = guardianAcc._id
                    var studentAcc = await AccountModel.findOneAndUpdate({ _id: studentAcc._id }, { relationship: relationship, $push: { progess: { stage: student.stage, stageClass: [{ classID: "", name: "", status: "Pass" }] } } })
                    res.json({ msg: 'success' });
                }
            }
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async editAccount(req, res) {
        try {
            var targetxxx = await studyRouteModel.find({}).lean()
            res.json({ msg: 'success', targetxxx });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async doeditAccount(req, res) {
        try {
            var password = req.body.password
            var password1 = req.body.password + "phuhuynh"
            var formData1 = req.body.formData1
            var formData2 = req.body.formData2
            if (password.length != 0) {
                const salt = bcrypt.genSaltSync(saltRounds);
                const hash = bcrypt.hashSync(password, salt);
                const salt1 = bcrypt.genSaltSync(saltRounds);
                const hash1 = bcrypt.hashSync(password1, salt);
                formData1["password"] = hash
                formData2["password"] = hash1
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
            } else {
                formData1["avatar"] = req.body.oldLink
            }
            if (formData1.role == "teacher") {
                await AccountModel.findOneAndUpdate({ _id: req.body.id }, formData1)
            } else {
                await AccountModel.findOneAndUpdate({ _id: req.body.id }, formData1)
                await AccountModel.findOneAndUpdate({ relationship: req.body.id }, formData2)
            }
            res.json({ msg: 'success', data: data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async createClass(req, res) {
        try {
            var classInfor = await ClassModel.find({}).lean()
            var targetxxx = await studyRouteModel.find({}).lean()
            var teacher = await AccountModel.find({ role: 'teacher' }).lean()
            var email = teacher[0].email
            var _id = teacher[0]._id
            var avatar = teacher[0].avatar
            res.render('admin/createClass', { teacher, targetxxx, classInfor, email, avatar, _id })
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async getAllClass(req, res) {
        try {
            var classInfor = await ClassModel.find({ classStatus: "Processing" }).lean()
            res.json({ msg: 'success', classInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async docreateClass(req, res) {
        try {
            console.log(req.body.teacherID)
            var studentID = req.body.studentID
            var listStudent = req.body.listStudent
            var data = await ClassModel.create({
                className: req.body.className,
                subject: req.body.subject,
                routeName: req.body.routeName,
                stage: req.body.stage,
                description: req.body.description,
                teacherID: req.body.teacherID,
                endDate: new Date(req.body.endDate),
                startDate: new Date(req.body.startDate),
            })
            if (studentID && listStudent) {
                await AccountModel.updateMany({ _id: { $in: studentID } }, { $push: { classID: data._id } })
                await AccountModel.updateMany({ _id: { $in: studentID }, "progess.stage": req.body.stage }, { $push: { "progess.$.stageClass": { classID: data._id, name: req.body.subject, status: "studying" } } })
                await ClassModel.findOneAndUpdate({ _id: data._id }, {
                    $push: {
                        studentID: { $each: listStudent },
                        StudentIDoutdoor: { $each: listStudent },
                        schedule: { $each: req.body.schedual }
                    }
                })
            }
            for (var i = 0; i < req.body.time.length; i++) {
                var dayOfWeek = '0' + req.body.buoihoc[i]
                await assignRoomAndTimeModel.updateOne({ dayOfWeek: dayOfWeek, room: { $elemMatch: { room: req.body.room[i], time: req.body.time[i] } } }, { $set: { "room.$.status": "Ok" } })
            }
            res.json({ msg: 'success' });
        } catch (error) {
            console.log(err)
            res.json({ msg: 'error' });
        }
    }

    async searchClass(req, res) {
        try {
            console.log(req.query.className)
            var classInfor = await ClassModel.find({ className: req.query.className }).lean();
            if (classInfor.length == 0) {
                res.json({ msg: 'notFound' });
            } else {
                res.json({ msg: 'success', classInfor });
            }
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async getClass(req, res) {
        try {
            var time = new Date(req.query.time)
            var classInfor = await ClassModel.find({ startDate: { $lte: time }, endDate: { $gte: time }, classStatus: "finished" }).lean();
            res.json({ msg: 'success', classInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async allClassLevel(req, res) {
        try {
            var classInfor = await ClassModel.find({}).populate('studentID').populate('teacherID').lean()
            res.render('admin/allClassLevel.hbs', { classInfor })
        } catch (error) {
            console.log(err)
            res.json({ msg: 'error' });
        }
    }

    async allClassStudent(req, res) {
        try {
            var _id = req.query.abc
            var selectedClassInfor = await ClassModel.find({ _id: _id }).populate('studentID').populate('teacherID').lean()
            res.json({ msg: 'success', data: selectedClassInfor });
        } catch (error) {
            console.log(err)
            res.json({ msg: 'error' });
        }
    }


    dashboard(req, res) {
        res.render('admin/dashboard')
    }


    async consultingAll(req, res) {
        try {
            var month = req.query.month
            var data = await consultingInformationModel.find({ signTime: { $gt: req.query.start, $lt: req.query.end } }).lean()
            res.json({ msg: 'success', data, month });
        } catch (error) {
            console.log(err)
            res.json({ msg: 'error' });
        }
    }
}
module.exports = new adminController