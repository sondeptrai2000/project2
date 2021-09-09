var mongoose = require("mongoose");
//const { stringify } = require("querystring");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const Schema = mongoose.Schema;
const room = new Schema({
    dayOfWeek: String,
    room: [{
        roomName: String,
        time: String,
        status: { type: String, default: "None" }
    }],
}, {
    collection: 'room'
});

var roomModel = mongoose.model('room', room);
roomModel.insertMany([
    { dayOfWeek: "02" },
    { dayOfWeek: "03" },
    { dayOfWeek: "04" },
    { dayOfWeek: "05" },
    { dayOfWeek: "06" },
    { dayOfWeek: "07" },
    { dayOfWeek: "08" },
]).then(function() {
    console.log("Data inserted") // Success 
}).catch(function(error) {
    console.log(error) // Failure 
});
module.exports = roomModel