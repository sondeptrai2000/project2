// let { checkEmail} = require('../service/auth')
// let accountmodel = require('../models/account');
let AccountModel = require('../models/account');
var jwt = require('jsonwebtoken');

let checkLogin = async(req, res, next) => {
    try {
        let user = req.body.username;
        await AccountModel.findOne({
            username: user
        }).then(user => {
            if (!user) {
                res.json({ msg: 'invalid_Info', message: "Username or password is invalid" });
            } else {
                req.user = user
                next();
            }
        })
    } catch (error) {
        console.log(error)
        res.json({ message: "error" })
    }
}


let checkAuth = async(req, res, next) => {
    try {
        var token = req.cookies.token
        let decodeAccount = jwt.verify(token, 'minhson')
        let user = await AccountModel.findOne({ _id: decodeAccount._id })
        if (user) {
            next();
        } else {
            res.redirect('/')
        }
    } catch (error) {
        res.redirect('/')
    }
}

let checkAdmin = (req, res, next) => {
    if (req.userLocal.role === "admin") {
        next()
    } else {
        res.redirect('/')
    }
}
let checkCoordinator = (req, res, next) => {
    if (req.userLocal.role === "coordinator") {
        next()
    } else {
        res.redirect('/')
    }
}
let checkStudent = (req, res, next) => {
    if (req.userLocal.role === "student") {
        next()
    } else {
        res.redirect('/')
    }
}
module.exports = {
    checkLogin,
    checkAdmin,
    checkAuth,
    checkCoordinator,
    checkStudent,
    checkAuth
}