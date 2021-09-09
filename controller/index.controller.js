const consultingInformationModel = require('../models/consultingInformation');

class indexController {
    home(req, res) {
        res.render('index/login')
            // res.json('Trang chủ của trung tâm')
    }

    courseinformation(req, res) {
        res.json('Trang thông tin khóa học')
    }

    aboutus(req, res) {
        consultingInformationModel.find({}, function(err, data) {
                if (err) {
                    res.json({ msg: 'error' });
                } else {
                    res.json(data);
                }
            })
            // res.json('Trang thông tin trung tâm')
    }

    consulting(req, res) {
        consultingInformationModel.create({
            name: req.body.name,
            Email: req.body.Email,
            phone: req.body.phone,
            purpose: req.body.purpose,
            consultingTime: req.body.consultingTime,
            consultingVia: req.body.consultingVia,
        }, function(err, data) {
            if (err) {
                res.json({ msg: 'error' });
            } else {
                res.json({ msg: 'success' });
            }
        })
    }
}
module.exports = new indexController