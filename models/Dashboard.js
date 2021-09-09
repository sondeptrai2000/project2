var mongoose = require("mongoose");
//const { stringify } = require("querystring");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

const Schema = mongoose.Schema;
const DashboardSchema = new Schema({
    soHocsinhnopbai:  {
        type : String,
        default : "0"
    },
    tongbaidanop:  {
        type : String,
        default : "0"
    },
    sobaidapass:  {
        type : String,
        default : "0"
    },
    hocsinhcuakhoa:  {
        type : String,
        default : "0"
    },
    fail:  {
        type : String,
        default : "0"
    },

    facultyID: String
},
{
    collection: 'Dashboard'
});

var DashboardtModel = mongoose.model('Dashboard', DashboardSchema);
module.exports = DashboardtModel