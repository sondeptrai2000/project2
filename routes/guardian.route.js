var express = require('express');
var guardianRouter = express.Router();
var guardianController = require('../controller/guardian.controller')



guardianRouter.get('/', guardianController.guardianHome)

guardianRouter.get('/getSchedule', guardianController.getSchedule)

//All class
guardianRouter.get('/getClass', guardianController.getClass)
guardianRouter.get('/myAttended', guardianController.myAttended)
guardianRouter.get('/getTeacherProfile', guardianController.getTeacherProfile)
guardianRouter.get('/allClassStudent', guardianController.allClassStudent)
guardianRouter.get('/allClass/:id', guardianController.allClass)



module.exports = guardianRouter