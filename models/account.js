var mongoose = require("mongoose");
//const { stringify } = require("querystring");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Schema = mongoose.Schema;
const AccountSchema = new Schema({
    avatar: String,
    username: String,
    password: String,
    email: String,
    aim: String,
    startStage: String,
    achive: String,
    routeName: String,
    stage: String,
    chat: [{ type: String, }],
    relationship: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
    role: String,
    classID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'class' }],
    progess: [{
        stage: String,
        stageClass: [{ classID: String, name: String, status: String }]
    }],
    sex: String,
    phone: String,
    address: String,
    birthday: String,
    codeRefresh: String,
}, {
    collection: 'account'
});

var AccountModel = mongoose.model('account', AccountSchema);
module.exports = AccountModel