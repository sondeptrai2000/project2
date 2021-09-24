var express = require('express');
var indexRouter = express.Router();
var indexController = require('../controller/index.controller')
var bodyParser = require('body-parser');
indexRouter.use(bodyParser.urlencoded({ extended: false }));


indexRouter.get('/', indexController.home)



module.exports = indexRouter