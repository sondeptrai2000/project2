var mongoose = require('mongoose');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);


var chatSchema = new mongoose.Schema({
    person1: String,
    person1Ava: String,
    person2: String,
    person2Ava: String,
    message: [{
        ownermessenger: String,
        messContent: String,
    }],
    updateTime: { type: Date, default: Date.now }
})

var chatModel = mongoose.model('chat', chatSchema);

module.exports = chatModel