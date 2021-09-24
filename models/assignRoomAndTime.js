var mongoose = require("mongoose");
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, result) { if (err) console.log('assignRoomAndTime lỗi') });
const Schema = mongoose.Schema;
const assignRoomAndTime = new Schema({
    dayOfWeek: String,
    room: [{
        room: String,
        time: String,
        status: String,
    }],
    listRoom: [{ type: String }]
}, { collection: 'assignRoomAndTime' });

var assignRoomAndTimeModel = mongoose.model('assignRoomAndTime', assignRoomAndTime);
module.exports = assignRoomAndTimeModel
    // assignRoomAndTimeModel.insertMany([
    //     { dayOfWeek: "02" },
    //     { dayOfWeek: "03" },
    //     { dayOfWeek: "04" },
    //     { dayOfWeek: "05" },
    //     { dayOfWeek: "06" },
    //     { dayOfWeek: "07" },
    //     { dayOfWeek: "08" },
    // ]).then(function() {
    //     console.log("Data inserted") // Success 
    // }).catch(function(error) {
    //     console.log(error) // Failure 
    // });