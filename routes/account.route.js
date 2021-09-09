var express = require('express');
var accounRouter = express.Router();
// var accountController = require('../controller/account.controller')
const { checkLogin, checkAuth } = require('../middleware/index');
const { homeAdmin, homeGuardian, homeStudent, homeTeacher, loginController, getCode, confirmPass } = require('../controller/account.controller');
accounRouter.post('/dologin', checkLogin, loginController)
accounRouter.get('/homeAdmin', homeAdmin)
accounRouter.get('/homeGuardian', homeGuardian)
accounRouter.get('/homeStudent', homeStudent)
accounRouter.get('/homeTeacher', homeTeacher)
accounRouter.get('/getCode', getCode)
accounRouter.post('/confirmPass', confirmPass)
module.exports = accounRouter