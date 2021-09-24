const AccountModel = require('../models/account');
const ClassModel = require('../models/class');
var jwt = require('jsonwebtoken');


class studentController {
    studentHome(req, res) {
        res.json('Trang chủ student')
    }

    async myAttended(req, res) {
        try {
            console.log(req.query.classID)
            let token = req.cookies.token
            let decodeAccount = jwt.verify(token, 'minhson')
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
        if (params != "0") return res.render('student/allClass', { params, studentName })
        if (params == "0") return res.render('student/allClass', { studentName })
    }


    async getClass(req, res) {
        try {
            let token = req.cookies.token
            let decodeAccount = jwt.verify(token, 'minhson')
            var classInfor = await AccountModel.find({ _id: decodeAccount._id }, { classID: 1 }).populate({
                path: 'classID',
                select: { 'schedule': 0 },
                populate: { path: 'teacherID', select: 'username' }
            }).lean()
            res.json({ msg: 'success', classInfor, studentID: decodeAccount._id });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }


    getTeacherProfile(req, res) {
        AccountModel.find({ _id: req.query.abc }, { username: 1, email: 1, avatar: 1 }).lean().exec(function(err, data) {
            if (err) {
                return res.json({ msg: 'error' });
            } else {
                return res.json({ msg: 'success', data: data });
            }
        })
    }

    allClassStudent(req, res) {
        ClassModel.find({ _id: req.query.abc }).populate('studentID.ID', { username: 1, email: 1, avatar: 1 }).lean().exec((err, selectedClassInfor) => {
            if (err) {
                return res.json({ msg: 'error' });
            } else {
                return res.json({ msg: 'success', data: selectedClassInfor });
            }
        })
    }

    async getSchedule(req, res) {
        try {
            var token = req.cookies.token
            var decodeAccount = jwt.verify(token, 'minhson')
            var studentID = decodeAccount._id
            var data = await AccountModel.findOne({ _id: decodeAccount }, { classID: 1 }).lean()
            var sosanh = new Date(req.query.dauTuan)
            var classInfor = await ClassModel.find({ _id: { $in: data.classID }, startDate: { $lte: sosanh }, endDate: { $gte: sosanh } }).lean()
            return res.json({ msg: 'success', classInfor, studentID });
        } catch (e) {
            console.log(e)
            res.json({ msg: 'error' });
        }
    }

}
module.exports = new studentController