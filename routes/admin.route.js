var express = require('express');
var adminRouter = express.Router();
var adminController = require('../controller/admin.controller')


adminRouter.get('/', adminController.adminHome)
adminRouter.get('/getAccount', adminController.getAccount)
adminRouter.get('/count', adminController.count)
adminRouter.get('/search', adminController.search);
//xem các lớp mà học sinh đã học
adminRouter.get('/studentClass/:id', adminController.studentClass)


adminRouter.get('/getStage', adminController.getStage)
adminRouter.get('/getStudent', adminController.getStudent)
adminRouter.get('/getRoute', adminController.getRoute)

//assignRoomAndTime
adminRouter.get('/assignRoomAndTime', adminController.assignRoomAndTime)
adminRouter.post('/addRoom', adminController.addRoom)
adminRouter.get('/getThu', adminController.getThu)
adminRouter.post('/doupdateSchedule', adminController.doupdateSchedule)



//tạo tài khoản
adminRouter.get('/createAccount', adminController.createAccount)
adminRouter.post('/doCreateAccount', adminController.doCreateAccount)
    //update account
adminRouter.get('/editAccount', adminController.editAccount)
adminRouter.post('/doeditAccount', adminController.doeditAccount)

//liên quan đến lộ trình học
adminRouter.get('/createRoute', adminController.createRoute)
adminRouter.get('/getAllRoute', adminController.getAllRoute)
adminRouter.get('/lol', adminController.lol)
adminRouter.post('/docreateRoute', adminController.docreateRoute)
adminRouter.post('/doUpdateRoute', adminController.doUpdateRoute)
adminRouter.delete('/deleteRoute', adminController.deleteRoute)
adminRouter.get('/searchRoute', adminController.searchRoute)

//liên quan đến lớp học
adminRouter.get('/createClass', adminController.createClass)
adminRouter.get('/getAllClass', adminController.getAllClass)
adminRouter.post('/createClass', adminController.docreateClass)

adminRouter.get('/deleteClass', adminController.deleteClass)
adminRouter.get('/getTime', adminController.getTime)


adminRouter.get('/getClass', adminController.getClass)
adminRouter.get('/searchClass', adminController.searchClass)


adminRouter.get('/allClassLevel', adminController.allClassLevel)
adminRouter.get('/allClassStudent', adminController.allClassStudent)



//liên quan đến dashboard
adminRouter.get('/dashboard', adminController.dashboard)



//Thông tin tư vấn
adminRouter.get('/consultingAll', adminController.consultingAll)


module.exports = adminRouter