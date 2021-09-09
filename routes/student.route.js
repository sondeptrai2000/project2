var express = require('express');
var studentRouter = express.Router();
var studentController = require('../controller/student.controller')

//lịch học
studentRouter.get('/getSchedule', studentController.getSchedule)


studentRouter.get('/', studentController.studentHome)

//liên quan đến  tài khoản
studentRouter.get('/studentProfile', studentController.studentProfile)
studentRouter.get('/getTeacherProfile', studentController.getTeacherProfile)
studentRouter.post('/doeditAccount', studentController.doeditAccount)


//liên quan đến lớp học
studentRouter.get('/allClass/:id', studentController.allClass)
studentRouter.get('/getClass', studentController.getClass)
studentRouter.get('/viewschedule', studentController.viewschedule)
studentRouter.get('/myAttended', studentController.myAttended)


studentRouter.get('/allClassStudent', studentController.allClassStudent)

//liên quan đến hoạt động ngoại khóa
studentRouter.get('/allextracurricularActivities', studentController.allextracurricularActivities)

//chat
studentRouter.get('/allChat', studentController.allChat)
studentRouter.get('/connectToChat', studentController.connectToChat)
studentRouter.get('/chatConversation', studentController.chatConversation)


module.exports = studentRouter