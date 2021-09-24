var express = require('express');
var studentRouter = express.Router();
var studentController = require('../controller/student.controller')


//Student Home page
studentRouter.get('/', studentController.studentHome)

studentRouter.get('/getSchedule', studentController.getSchedule)

//All class
studentRouter.get('/getClass', studentController.getClass)
studentRouter.get('/myAttended', studentController.myAttended)
studentRouter.get('/getTeacherProfile', studentController.getTeacherProfile)
studentRouter.get('/allClassStudent', studentController.allClassStudent)
studentRouter.get('/allClass/:id', studentController.allClass)



module.exports = studentRouter