const { JsonWebTokenError } = require('jsonwebtoken');
const AccountModel = require('../models/account');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
const { data } = require('jquery');
const saltRounds = 10;
const nodemailer = require('nodemailer');


const Crypto = require('crypto')

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

let getCode = async(req, res) => {
    try {
        var check = await AccountModel.findOne({ email: req.query.email }, { username: 1 })
        if (check) {
            var code = Crypto.randomBytes(21).toString('base64').slice(0, 21)
            var content = check.username + " mã code để làm mới mật khẩu của bạn là: " + code + ". Note: Mã này sẽ tồn tại trong 5p."
            var mainOptions = {
                from: 'fptedunotification@gmail.com',
                to: req.query.email,
                subject: 'Notification',
                text: content
            }
            await AccountModel.findOneAndUpdate({ email: req.query.email }, { codeRefresh: code })
            await transporter.sendMail(mainOptions)
            setTimeout(async function() {
                await AccountModel.findOneAndUpdate({ email: req.query.email }, { codeRefresh: "" })
            }, 600000)
            res.json({ msg: 'success' });
        }
        if (!check) res.json({ msg: 'email not found' });
    } catch (e) {
        console.log(e)
        res.json({ msg: 'error' });
    }
}


let confirmPass = async(req, res) => {
    try {
        var check = await AccountModel.findOne({ email: req.body.email }, { username: 1, codeRefresh: 1 })
        if (check) {
            if (check.codeRefresh == req.body.codeForgot) {
                const salt = bcrypt.genSaltSync(saltRounds);
                const hash = bcrypt.hashSync(req.body.newPass, salt);
                await AccountModel.findOneAndUpdate({ email: req.body.email }, { codeRefresh: "", password: hash })
                res.json({ msg: 'success' });
            } else { res.json({ msg: 'invalidCode' }); }
        }
        if (!check) res.json({ msg: 'email not found' });
    } catch (e) {
        console.log(e)
        res.json({ msg: 'error' });
    }
}


//ok
let homeAdmin = async(req, res) => {
    try {
        let token = req.cookies.token
        if (token) {
            let decodeAccount = jwt.verify(token, 'minhson')
            var data = await AccountModel.findOne({ _id: decodeAccount }).lean()
            if (data.role === 'admin') res.render('admin/adminHome')
        } else {
            res.redirect('/')
        }
    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
}

//ok
let homeTeacher = async(req, res) => {
    try {
        let token = req.cookies.token
        if (token) {
            let decodeAccount = jwt.verify(token, 'minhson')
            var data = await AccountModel.findOne({ _id: decodeAccount }).lean()
            if (data.role === 'teacher') res.render('teacher/teacherHome')
        } else {
            res.redirect('/')
        }
    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
}

//ok
let homeGuardian = async(req, res) => {
    try {
        let token = req.cookies.token
        if (token) {
            let decodeAccount = jwt.verify(token, 'minhson')
            var data = await AccountModel.findOne({ _id: decodeAccount }).lean()
            if (data.role === 'guardian') res.render('guardian/guardianHome')
        } else {
            res.redirect('/')
        }
    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
}


let homeStudent = async(req, res) => {
    try {
        let token = req.cookies.token
        if (token) {
            let decodeAccount = jwt.verify(token, 'minhson')
            var data = await AccountModel.findOne({ _id: decodeAccount }).lean()
            if (data.role === 'student') res.render('student/studentHome')
        } else {
            res.redirect('/')
        }
    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
}

let loginController = function(req, res) {
    bcrypt.compare(req.body.password, req.user.password, function(err, result) {
        if (err) res.json({ message: "error" })
        if (result) {
            let token = jwt.sign({ _id: req.user._id }, 'minhson', { expiresIn: '1d' })
            res.cookie("token", token, { maxAge: 24 * 60 * 60 * 10000 });
            let user = req.user
            if (user.role === "admin") res.json({ msg: 'success', data: "./homeAdmin" });
            if (user.role === "student") res.json({ msg: 'success', data: "./homeStudent" });
            if (user.role === "guardian") res.json({ msg: 'success', data: "./homeGuardian" });
            if (user.role === "teacher") res.json({ msg: 'success', data: "./homeTeacher" });
        } else {
            res.json({ msg: 'invalid_Info', message: "Username or password is invalid" });
        }
    })
}


module.exports = {
    homeAdmin,
    homeGuardian,
    homeStudent,
    homeTeacher,
    loginController,
    getCode,
    confirmPass
}