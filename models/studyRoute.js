var mongoose = require("mongoose");
//const { stringify } = require("querystring");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Schema = mongoose.Schema;
const studyRoute = new Schema({
    routeName: String,
    description: String,
    routeSchedual: [{
        stage: String,
        routeabcd: []
    }],
}, {
    collection: 'studyRoute'
});
var studyRouteModel = mongoose.model('studyRoute', studyRoute);
module.exports = studyRouteModel