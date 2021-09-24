var mongoose = require('mongoose');
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, }, function(err, result) { if (err) console.log('chatSchema lỗi') });
var chatSchema = new mongoose.Schema({
    person1: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
    person2: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
    read: [{ type: String }],
    message: [{
        ownermessengerID: String,
        ownermessenger: String,
        messContent: String,
        time: { type: Date, default: Date.now }
    }],
    updateTime: { type: Date, default: Date.now }
}, { collection: 'chats' });

var chatModel = mongoose.model('chats', chatSchema);

module.exports = chatModel