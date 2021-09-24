var express = require('express');
var adminRouter = express.Router();
var adminController = require('../controller/admin.controller')
adminRouter.get('/', adminController.createAccount)

//Manage account page
adminRouter.get('/createAccount', adminController.createAccount);

adminRouter.get('/getSchedule', adminController.getSchedule)
adminRouter.get('/getAccount', adminController.getAccount);
adminRouter.get('/countAccount', adminController.countAccount);
adminRouter.get('/search', adminController.search);
adminRouter.get('/getStage', adminController.getStage);
adminRouter.get('/getRoute', adminController.getRoute);
adminRouter.get('/editAccount', adminController.editAccount);
adminRouter.post('/doCreateAccount', adminController.doCreateAccount);
adminRouter.post('/doeditAccount', adminController.doeditAccount);

//Manage class page
adminRouter.get('/createClass', adminController.createClass);

adminRouter.get('/getTeacherAndClass', adminController.getTeacherAndClass);
adminRouter.get('/countClass', adminController.countClass);
adminRouter.post('/updateClass', adminController.updateClass);
adminRouter.get('/searchClass', adminController.searchClass);
adminRouter.get('/getAllClass', adminController.getAllClass);
adminRouter.get('/attendedList', adminController.attendedList);
adminRouter.get('/getThu', adminController.getThu);
adminRouter.post('/doupdateSchedule', adminController.doupdateSchedule);
adminRouter.get('/deleteClass', adminController.deleteClass);
adminRouter.get('/allClassStudent', adminController.allClassStudent);
adminRouter.get('/addStudentToClass', adminController.addStudentToClass);
adminRouter.post('/doaddStudentToClass', adminController.doaddStudentToClass);
adminRouter.post('/doremoveStudentToClass', adminController.doremoveStudentToClass);
adminRouter.get('/getTime', adminController.getTime);
adminRouter.post('/createClass', adminController.docreateClass);
adminRouter.get('/getStudent', adminController.getStudent);

//Manage Route page
adminRouter.get('/createRoute', adminController.createRoute);

adminRouter.get('/getAllRoute', adminController.getAllRoute);
adminRouter.get('/viewSchedule', adminController.viewSchedule);
adminRouter.post('/docreateRoute', adminController.docreateRoute);
adminRouter.post('/doUpdateRoute', adminController.doUpdateRoute);
adminRouter.delete('/deleteRoute', adminController.deleteRoute);

//Manage room and time
adminRouter.get('/assignRoomAndTime', adminController.assignRoomAndTime);
adminRouter.get('/getRoomAndTime', adminController.getRoomAndTime);
adminRouter.post('/addRoom', adminController.addRoom);
adminRouter.post('/deleteRoom', adminController.deleteRoom);

//xem các lớp mà học sinh đã học (studentClassDetail) quá trình học
adminRouter.get('/studentClass/:id', adminController.studentClass);



module.exports = adminRouter