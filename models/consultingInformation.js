var mongoose = require("mongoose");
//const { stringify } = require("querystring");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

function dateNow() {
    var date = new Date()
    var month = date.getMonth() + 1
    var lol = date.getFullYear() + "-" + month.toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0")
    return lol
}
const Schema = mongoose.Schema;
const consultingInformationSchema = new Schema({
    name: String,
    Email: String,
    phone: String,
    purpose: String,
    consultingTime: String,
    consultingVia: String,
    signTime: { type: String, default: dateNow() }
}, {
    collection: 'consultingInformation'
});

var consultingInformationModel = mongoose.model('consultingInformation', consultingInformationSchema);
module.exports = consultingInformationModel