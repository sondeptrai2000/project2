const AccountModel = require('../models/account');
const ClassModel = require('../models/class');
const assignRoomAndTimeModel = require('../models/assignRoomAndTime');
const studyRouteModel = require('../models/studyRoute');
const nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
const saltRounds = 10;
const { JsonWebTokenError } = require('jsonwebtoken');
var jwt = require('jsonwebtoken');
const fs = require("fs")
const readline = require("readline")
const { google } = require("googleapis")
var path = require('path');

// set up mail sever
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'fptedunotification@gmail.com',
        pass: 'son@1234'
    },
    tls: {
        rejectUnauthorized: false
    }
});
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

class teacherController {
    teacherHome(req, res) {
        res.render('teacher/teacherHome')
    }

    async teacherProfile(req, res) {
        try {
            var token = req.cookies.token
            var decodeAccount = jwt.verify(token, 'minhson')
            var data = await AccountModel.findOne({ _id: decodeAccount }).lean();
            res.cookie("username", data.username, { maxAge: 24 * 60 * 60 * 10000 });
            res.json({ msg: 'success', data: data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    allClass(req, res) {
        var params = req.params.id
        var teacherName = req.cookies.username
        if (params != "0") res.render('teacher/allClass', { params, teacherName })
        if (params == "0") res.render('teacher/allClass', { teacherName })
    }

    async getClass(req, res) {
        try {
            var token = req.cookies.token
            var decodeAccount = jwt.verify(token, 'minhson')
            if (req.query.time) {
                var time = new Date(req.query.time)
                var classInfor = await ClassModel.find({ teacherID: decodeAccount, startDate: { $lte: time }, endDate: { $gte: time } }).lean();
                res.json({ msg: 'success', classInfor });
            } else {
                var classInfor = await ClassModel.find({ teacherID: decodeAccount }, { StudentIDoutdoor: 0 }).lean();
                res.json({ msg: 'success', classInfor });
            }
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    schedule(req, res) {
        res.render('teacher/schedule')
    }

    async getSchedule(req, res) {
        try {
            var token = req.cookies.token
            var decodeAccount = jwt.verify(token, 'minhson');
            //lấy thời điểm đầu tuần để lấy khóa học đang hoạt động trong khoảng thời gian đó. 
            var sosanh = new Date(req.query.dauTuan)
            var classInfor = await ClassModel.find({ teacherID: decodeAccount, startDate: { $lte: sosanh }, endDate: { $gte: sosanh } }).lean();
            res.json({ msg: 'success', classInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }



    async attendedList(req, res) {
        try {
            var data = await ClassModel.find({ _id: req.query.id }, { schedule: 1 }).lean();
            res.json({ msg: 'success', data: data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async attendedListStudent(req, res) {
        try {
            var data = await ClassModel.find({ _id: req.query.idClass }, { schedule: { $elemMatch: { _id: req.query.idattend } } }).populate({ path: "schedule.attend.studentID", select: "username avatar" }).lean();
            res.json({ msg: 'success', data: data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async doTakeAttended(req, res) {
        try {
            var now = new Date()
            var theLastCourse = new Date(req.body.lastDate.split("T00:00:00.000Z")[0]);
            //cập nhật điểm danh cho học sinh
            await ClassModel.updateOne({ _id: req.body.idClass, "schedule._id": req.body.schedule }, { $set: { "schedule.$.attend": req.body.attend } });
            //tính số buổi học sinh đã nghỉ
            var data = await ClassModel.find({ _id: req.body.idClass }, { schedule: 1, studentID: 1 }).lean();
            var student1 = data[0].studentID
            student1.forEach((student, index) => { student1[index].absentRate = 0 });
            data[0].schedule.forEach((e) => {
                e.attend.forEach((e) => {
                    student1.forEach((student, index) => {
                        if (e.attended == "absent" && e.studentID.toString() == student.ID.toString()) student1[index].absentRate++;
                    })
                })
            });
            //cập nhật % số lần học sinh nghỉ học
            await ClassModel.updateOne({ _id: req.body.idClass }, { studentID: student1 });
            //nếu là lịch học đã được update (giáo viên bận và đã được chuyển lịch dạy sang ngày khác thì chuyển trạng thái của phòng đó thành none để thành phòng trống)
            if (req.body.scheduleStatus == 'update') await assignRoomAndTimeModel.updateOne({ dayOfWeek: req.body.scheduleDay, room: { $elemMatch: { room: req.body.scheduleRoom, time: req.body.scheduleTime } } }, { $set: { "room.$.status": "None" } })
                //nếu đó là buổi học cuối cùng (so sánh time) thì sẽ chuyển trạng thái các phòng của lớp đó thành none 
            if (now >= theLastCourse) {
                //chuyển phòng thành none 
                for (var i = 0; i < req.body.time.length; i++) { assignRoomAndTimeModel.updateOne({ dayOfWeek: req.body.day[i], room: { $elemMatch: { room: req.body.room[i], time: req.body.time[i] } } }, { $set: { "room.$.status": "None" } }) }
                //cập nhật trạng thái của lớp là đã kết thúc
                await ClassModel.updateOne({ _id: req.body.idClass }, { classStatus: 'Finished' });
                res.json({ msg: 'success' });
            } else { res.json({ msg: 'success' }); }
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }



    async allClassStudent(req, res) {
        try {
            var _id = req.query.abc
            var selectedClassInfor = await ClassModel.find({ _id: _id }).populate('studentID.ID', { avatar: 1, username: 1, aim: 1, email: 1 }).lean();
            res.json({ msg: 'success', data: selectedClassInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async addStudentToClass(req, res) {
        try {
            var condition = req.query.condition
            var data = await AccountModel.find(condition, { avatar: 1, username: 1, subject: 1, routeName: 1, stage: 1, email: 1, classID: 1, progess: 1 }).lean();
            res.json({ msg: 'success', data: data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async doaddStudentToClass(req, res) {
        try {
            //lấy dữ liệu của lớp
            var data = await ClassModel.findOne({ _id: req.body.classID }).lean()
                //thêm classID vào bảng thông tin của các học sinh
            await AccountModel.updateMany({ _id: { $in: req.body.studentlistcl } }, { $push: { classID: req.body.classID } })
                //thêm classID vào bảng thông tin lộ trình của các học sinh ( progess)
            await AccountModel.updateMany({ _id: { $in: req.body.studentlistcl }, "progess.stage": data.stage }, { $push: { "progess.$.stageClass": { classID: data._id, name: data.subject, status: "studying" } } })
                //Thêm học sinh vào danh sách học sinh trong bảng thông tin lớp
            await ClassModel.findOneAndUpdate({ _id: req.body.classID }, { $push: { studentID: { $each: req.body.studentlist }, } })
                //thêm trong danh sáhc điểm danh
            await ClassModel.updateOne({ _id: req.body.classID }, { $push: { "schedule.$[].attend": { $each: req.body.studentlistAttend } } })
            res.json({ msg: 'success' });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async doremoveStudentToClass(req, res) {
        try {
            //xóa classID vào bảng thông tin của các học sinh
            await AccountModel.updateMany({ _id: { $in: req.body.studentlistcl } }, { $pull: { classID: req.body.classID } });
            //xóa classID vào bảng thông tin lộ trình của các học sinh ( progess)
            await AccountModel.updateMany({ _id: { $in: req.body.studentlistcl }, "progess.stageClass.classID": req.body.classID }, {
                $pull: { "progess.$.stageClass": { classID: req.body.classID } }
            });
            //xóa học sinh vào danh sách học sinh trong bảng thông tin lớp
            await ClassModel.findOneAndUpdate({ _id: req.body.classID }, { $pull: { studentID: { ID: { $in: req.body.studentlistcl } } } });
            //xóa trong danh sáhc điểm danh
            await ClassModel.updateOne({ _id: req.body.classID }, {
                $pull: { "schedule.$[].attend": { studentID: { $in: req.body.studentlistcl } } }
            });
            res.json({ msg: 'success' });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async studentAssessment(req, res) {
        try {
            //cập nhật điểm, đánh giá của giáo viên về học sinh trong lớp
            var classInfor = await ClassModel.findOneAndUpdate({ _id: req.body.classID, 'studentID.ID': req.body.studentId }, {
                $set: {
                    "studentID.$.grade": req.body.grade,
                    "studentID.$.feedBackContent": req.body.comment
                }
            });
            if (req.body.grade != "Restudy") {
                //cập nhật thông tin về tiến độ của học sinh trong bảng thông tin cá nhân
                var status = "Pass"
                await AccountModel.updateOne({ _id: req.body.studentId }, {
                    "$set": { "progess.$[progess].stageClass.$[stageClass].status": status }
                }, { "arrayFilters": [{ "progess.stage": classInfor.stage }, { "stageClass.classID": req.body.classID }] });
                //lấy tiến độ học tập của học sinh từ bảng thông tin cá nhân
                var studentProgress
                var progess = await AccountModel.findOne({ _id: req.body.studentId }, { progess: 1, aim: 1, email: 1, username: 1 });
                //lấy số lượng pass các khóa học để so sánh với số lượng class trong giai đoạn. == thì đã hoàn thành hết các lớp trong giai đoạn đó và sẽ tiến hành chuyển tiépe giai đoạn 
                var Passed = 0
                progess.progess.forEach((e, index) => {
                    if (e.stage == classInfor.stage) {
                        studentProgress = e.stageClass
                        e.stageClass.forEach((check, index) => {
                            if (check.status == "Pass") {
                                Passed++
                            }
                        })
                    }
                });
                //lấy lộ trình mà học sinh đang theo học để xem xét chuyển giai đoạn
                var route = await studyRouteModel.findOne({ routeName: classInfor.routeName }, { routeSchedual: 1 })
                var indexOfNextClass
                var routeClass
                route.routeSchedual.forEach((e, index) => {
                    if (e.stage == classInfor.stage) {
                        routeClass = e.routeabcd
                        indexOfNextClass = index + 1
                    }
                });
                //check xem học sinh đã hoàn thành các lớp của giai đoạn hiện tại chưa
                if (Passed == routeClass.length + 1) {
                    //kiểm tra xem lộ trình học của học sinh đã kết thúc chưa. Check theo aim mà học sinh đã đăng ký.
                    if (classInfor.stage == progess.aim) {
                        var content = progess.username + " đã hoàn thành khóa học đăng ký: Lộ trình: " + classInfor.routeName + ".  Giai đoạn: " + progess.aim + ". Vui lòng đến trung tâm để xác thực và trao chứng chỉ."
                        var mainOptions = {
                            from: 'fptedunotification@gmail.com',
                            to: progess.email,
                            subject: 'Notification',
                            text: content
                        }
                        await transporter.sendMail(mainOptions)
                        res.json({ msg: 'success' });
                    } else {
                        // chuyển giai đoạn tiếp theo
                        var nextStage = route.routeSchedual[indexOfNextClass].stage
                        await AccountModel.findOneAndUpdate({ _id: req.body.studentId }, { $push: { progess: { stage: nextStage, stageClass: [] } } })
                        await AccountModel.findOneAndUpdate({ _id: req.body.studentId }, { stage: nextStage })
                        res.json({ msg: 'success' });
                    }
                } else {
                    res.json({ msg: 'success' });
                }
            } else {
                //cập nhật thông tin về tiến độ của học sinh trong bảng thông tin cá nhân nếu học sinh fail 
                var status = "Fail"
                await AccountModel.updateOne({ _id: req.body.studentId }, {
                    "$set": { "progess.$[progess].stageClass.$[stageClass].status": status }
                }, { "arrayFilters": [{ "progess.stage": classInfor.stage }, { "stageClass.classID": req.body.classID }] })
                res.json({ msg: 'success' });
            }
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
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
                    console.log(oldImg)
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
}



module.exports = new teacherController