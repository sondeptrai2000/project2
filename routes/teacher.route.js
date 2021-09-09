var express = require('express');
var teacherRouter = express.Router();
var teacherController = require('../controller/teacher.controller')



teacherRouter.get('/', teacherController.teacherHome)

//Account
teacherRouter.get('/teacherProfile', teacherController.teacherProfile)
teacherRouter.post('/doeditAccount', teacherController.doeditAccount)

//liên quan đến lớp học
teacherRouter.get('/allClass/:id', teacherController.allClass)
teacherRouter.get('/getClass', teacherController.getClass)
teacherRouter.get('/allClassStudent', teacherController.allClassStudent)


teacherRouter.get('/addStudentToClass', teacherController.addStudentToClass)
teacherRouter.post('/doaddStudentToClass', teacherController.doaddStudentToClass)
teacherRouter.post('/doremoveStudentToClass', teacherController.doremoveStudentToClass)
teacherRouter.post('/studentAssessment', teacherController.studentAssessment)


//lịch học
teacherRouter.get('/schedule', teacherController.schedule)
teacherRouter.get('/getSchedule', teacherController.getSchedule)





//takeAttend
teacherRouter.get('/attendedList', teacherController.attendedList)
teacherRouter.get('/attendedListStudent', teacherController.attendedListStudent)
teacherRouter.post('/doTakeAttended', teacherController.doTakeAttended)


module.exports = teacherRouter