var express = require('express');
var teacherRouter = express.Router();
var teacherController = require('../controller/teacher.controller')



teacherRouter.get('/', teacherController.teacherHome)

//TeacherHome page
teacherRouter.get('/getSchedule', teacherController.getSchedule)

//All class page
teacherRouter.get('/allClass/:id', teacherController.allClass)

teacherRouter.get('/countClass', teacherController.countClass);
teacherRouter.get('/getAllClass', teacherController.getAllClass);
teacherRouter.get('/allClassStudent', teacherController.allClassStudent)
teacherRouter.post('/studentAssessment', teacherController.studentAssessment)
teacherRouter.get('/attendedList', teacherController.attendedList)
teacherRouter.get('/attendedListStudent', teacherController.attendedListStudent)
teacherRouter.post('/doTakeAttended', teacherController.doTakeAttended)



module.exports = teacherRouter