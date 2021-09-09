var express = require('express');
const ClassModel = require('../models/class');
var messRoute = express.Router();
const messController = require('../controller/mess.controller');
messRoute.post('/makeConnection', messController.makeConnection, messController.chatForm)
messRoute.get('/getMessenger', messController.getMessenger)
messRoute.get('/chatForm', messController.chatForm)
messRoute.post('/addChat', messController.addChat)

module.exports = messRoute