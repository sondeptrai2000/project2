class indexController {
    home(req, res) {
        return res.render('index/SownEnglish')
            // res.json('Trang chủ của trung tâm')
    }
}
module.exports = new indexController