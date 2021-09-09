var express = require('express');
var guardianRouter = express.Router();
var guardianController = require('../controller/guardian.controller')



guardianRouter.get('/',guardianController.guardianHome)

//liên quan đến  tài khoản
guardianRouter.get('/guardianProfile',guardianController.guardianProfile)

//liên quan đến lớp học
guardianRouter.get('/allClass',guardianController.allClass)
guardianRouter.get('/learningProgress',guardianController.learningProgress)


//liên quan đến hoạt động ngoại khóa
guardianRouter.get('/allextracurricularActivities',guardianController.allextracurricularActivities)

//chat
guardianRouter.get('/allChat',guardianController.allChat)
guardianRouter.get('/connectToChat',guardianController.connectToChat)
guardianRouter.get('/chatConversation',guardianController.chatConversation)


module.exports = guardianRouter