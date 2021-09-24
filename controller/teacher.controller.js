const AccountModel = require('../models/account');
const ClassModel = require('../models/class');
const assignRoomAndTimeModel = require('../models/assignRoomAndTime');
const studyRouteModel = require('../models/studyRoute');
const nodemailer = require('nodemailer');
var jwt = require('jsonwebtoken');

// set up mail sever
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: 'sownenglishedu@gmail.com', pass: 'son123@123' },
    tls: { rejectUnauthorized: false }
});

class teacherController {
    async teacherHome(req, res) {
        try {
            res.render('teacher/teacherHome')
        } catch (e) {
            console.log(e)
            res.json("lỗi")
        }
    }

    async allClass(req, res) {
        try {
            var params = req.params.id
            var teacherName = req.cookies.username
            if (params != "0") return res.render('teacher/allClass', { params, teacherName })
            if (params == "0") return res.render('teacher/allClass', { teacherName })
        } catch (e) {
            console.log(e)
            res.json("lỗi")
        }
    };
    //đếm số lượng account dựa trên trạng thái của lớp học
    async countClass(req, res) {
        try {
            var token = req.cookies.token;
            var decodeAccount = jwt.verify(token, 'minhson');
            //số lớp hiển thị trên 1 trang
            var classPerPage = 20
            var numberOfClass = await ClassModel.find({ teacherID: decodeAccount, classStatus: req.query.status }, { _id: 1 }).lean().countDocuments()
            var soTrang = numberOfClass / classPerPage + 1
            res.json({ msg: 'success', soTrang, numberOfClass });
        } catch (e) {    
            console.log(e)
            res.json({ msg: 'error' });
        }
    };

    //lấy tất cả cacs lớp đang hoạt động
    //Note: Chỉnh thành số trang
    async getAllClass(req, res) {
        try {
            var token = req.cookies.token
            var decodeAccount = jwt.verify(token, 'minhson')
            var classPerPage = 20
            var skip = classPerPage * parseInt(req.query.page)
            var classInfor = await ClassModel.find({ teacherID: decodeAccount, classStatus: req.query.status }, { schedule: 0, studentID: 0, classStatus: 0 }).skip(skip).limit(classPerPage).lean();
            res.json({ msg: 'success', classInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    };

    async getSchedule(req, res) {
        try {
            var token = req.cookies.token
            var decodeAccount = jwt.verify(token, 'minhson');
            //lấy thời điểm đầu tuần để lấy khóa học đang hoạt động trong khoảng thời gian đó. 
            var sosanh = new Date(req.query.dauTuan)
            var classInfor = await ClassModel.find({ teacherID: decodeAccount, startDate: { $lte: sosanh }, endDate: { $gte: sosanh } }, { className: 1, schedule: 1 });
            res.json({ msg: 'success', classInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async attendedListStudent(req, res) {
        try {
            var data = await ClassModel.find({ _id: req.query.idClass }, { schedule: { $elemMatch: { _id: req.query.idattend } } }, { schedule: 1 }).populate({ path: "schedule.attend.studentID", select: "username avatar" }).lean();
            res.json({ msg: 'success', data: data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async doTakeAttended(req, res) {
        try {
            var now = new Date();
            //cập nhật điểm danh cho học sinh
            await ClassModel.updateOne({ _id: req.body.idClass, "schedule._id": req.body.schedule }, { $set: { "schedule.$.attend": req.body.attend, "schedule.$.status": "success" } });
            //tính số buổi học sinh đã nghỉ
            var data = await ClassModel.find({ _id: req.body.idClass }, { schedule: 1, studentID: 1 }).lean();
            var student1 = data[0].studentID;
            student1.forEach((student, index) => { student1[index].absentRate = 0 });
            data[0].schedule.forEach((e) => {
                e.attend.forEach((e) => {
                    student1.forEach((student, index) => { if (e.attended == "absent" && e.studentID.toString() == student.ID.toString()) student1[index].absentRate++; })
                })
            });
            //cập nhật % số lần học sinh nghỉ học
            await ClassModel.updateOne({ _id: req.body.idClass }, { studentID: student1 });
            //nếu là lịch học đã được update (giáo viên bận và đã được chuyển lịch dạy sang ngày khác thì chuyển trạng thái của phòng đó thành none để thành phòng trống)
            if (req.body.scheduleStatus == 'update') await assignRoomAndTimeModel.updateOne({ dayOfWeek: req.body.scheduleDay, room: { $elemMatch: { room: req.body.scheduleRoom, time: req.body.scheduleTime } } }, { $set: { "room.$.status": "None" } });
            //nếu đó là buổi học cuối cùng (so sánh time) thì sẽ chuyển trạng thái các phòng của lớp đó thành none 
            var theLastCourse = new Date(req.body.lastDate.split("T00:00:00.000Z")[0]);
            if (now >= theLastCourse) {
                //chuyển phòng thành none 
                for (var i = 0; i < req.body.time.length; i++) { assignRoomAndTimeModel.updateOne({ dayOfWeek: req.body.day[i], room: { $elemMatch: { room: req.body.room[i], time: req.body.time[i] } } }, { $set: { "room.$.status": "None" } }) }
                //cập nhật trạng thái của lớp là đã kết thúc
                await ClassModel.updateOne({ _id: req.body.idClass }, { classStatus: 'Finished' });
            }
            res.json({ msg: 'success' });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async studentAssessment(req, res) {
        try {
            // cập nhật điểm, đánh giá của giáo viên về học sinh trong lớp
            var classInfor = await ClassModel.findOneAndUpdate({ _id: req.body.classID, 'studentID.ID': req.body.studentId }, {
                $set: { "studentID.$.grade": req.body.grade, "studentID.$.feedBackContent": req.body.comment }
            });
            // cập nhật thông tin về tiến độ của học sinh trong bảng thông tin cá nhân
            await AccountModel.updateOne({ _id: req.body.studentId }, { "$set": { "progess.$[progess].stageClass.$[stageClass].status": req.body.grade } }, {
                "arrayFilters": [{ "progess.stage": classInfor.stage }, { "stageClass.classID": req.body.classID }]
            });
            // lấy tiến độ học tập của học sinh từ bảng thông tin cá nhân
            var progess = await AccountModel.findOne({ _id: req.body.studentId }, { progess: 1, aim: 1, email: 1, username: 1, stage: 1 });
            //lấy số lượng pass các khóa học để so sánh với số lượng class trong giai đoạn. == thì đã hoàn thành hết các lớp trong giai đoạn đó và sẽ tiến hành chuyển tiépe giai đoạn 
            var Passed = 0
            progess.progess.forEach((e, index) => {
                //đếm số môn đã Pass để xét chuyển giai đoạn
                if (e.stage == classInfor.stage) e.stageClass.forEach((check, index) => { if (check.status != "Restudy") Passed++ })
            });
            // lấy lộ trình mà học sinh đang theo học để xem xét chuyển giai đoạn
            var route = await studyRouteModel.findOne({ routeName: classInfor.routeName }, { routeSchedual: 1 })
            var indexOfNextClass;
            //số môn học trong 1 giai đoạn
            var numberOfSubject
            route.routeSchedual.forEach((e, index) => {
                if (e.stage == classInfor.stage) {
                    numberOfSubject = e.routeabcd
                    indexOfNextClass = index + 1
                }
            });
            //Nếu học sinh trượt môn mà trước đó giáo viên đã chấm qua môn, chức năng update grade
            if (req.body.grade == "Restudy") {
                if (progess.stage != classInfor.stage) {
                    // cập nhật lại thông tin về các giao đoạn trước đó
                    var preStage = route.routeSchedual[indexOfNextClass - 1].stage;
                    //xóa classID vào bảng thông tin lộ trình của các học sinh ( progess)
                    await AccountModel.findOneAndUpdate({ _id: req.body.studentId }, { $pull: { progess: { stage: progess.stage } } });
                    await AccountModel.findOneAndUpdate({ _id: req.body.studentId }, { stage: preStage });
                }
            } else {
                //xem xét chuyển giai đoạn hoặc tiếp tục các môn tiếp theo
                //check xem học sinh đã hoàn thành các lớp của giai đoạn hiện tại chưa
                if (Passed == numberOfSubject.length + 1) {
                    //kiểm tra xem lộ trình học của học sinh đã kết thúc chưa. Check theo aim mà học sinh đã đăng ký.
                    if (classInfor.stage == progess.aim) {
                        var content = progess.username + " đã hoàn thành khóa học đăng ký: Lộ trình: " + classInfor.routeName + ".  Giai đoạn: " + progess.aim + ". Vui lòng đến trung tâm để xác thực và trao chứng chỉ."
                        var mainOptions = { from: 'fptedunotification@gmail.com', to: progess.email, subject: 'Notification', text: content }
                        await transporter.sendMail(mainOptions)
                    } else {
                        // chuyển giai đoạn tiếp theo
                        var nextStage = route.routeSchedual[indexOfNextClass].stage
                        await AccountModel.findOneAndUpdate({ _id: req.body.studentId }, { $push: { progess: { stage: nextStage, stageClass: [{ classID: "", name: "", status: "Pass" }] } } })
                        await AccountModel.findOneAndUpdate({ _id: req.body.studentId }, { stage: nextStage })
                    }
                }
            }
            res.json({ msg: 'success' });
        } catch (e) {
            res.json({ msg: 'error' });
        }
    }

    async allClassStudent(req, res) {
        try {
            var selectedClassInfor = await ClassModel.find({ _id: req.query.abc }, { studentID: 1 }).populate('studentID.ID', { avatar: 1, username: 1, aim: 1, email: 1 }).lean();
            res.json({ msg: 'success', data: selectedClassInfor });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

    async attendedList(req, res) {
        try {
            var data = await ClassModel.find({ _id: req.query.id }, { "schedule.date": 1, "schedule._id": 1, "schedule.day": 1, "schedule.room": 1, "schedule.status": 1, "schedule.time": 1 }).lean();
            res.json({ msg: 'success', data: data });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }
}



module.exports = new teacherController