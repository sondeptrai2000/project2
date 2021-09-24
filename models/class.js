var mongoose = require('mongoose')
var url = "mongodb+srv://minhson123:minhson123@cluster0.v0phx.mongodb.net/project?retryWrites=true&w=majority";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, result) { if (err) console.log('class lỗi') });
const Schema = mongoose.Schema;
const classSchema = new Schema({
    className: String,
    routeName: String,
    stage: String,
    subject: String,
    description: String,
    timeToStudy: [{ type: String }],
    studentID: [{
        ID: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
        grade: { type: String, default: "Has not been commented yet" },
        feedBackContent: { type: String, default: "Has not been commented yet" },
        absentRate: Number,
    }],
    teacherID: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
    schedule: [{
        commonPoint: { type: String, default: "schedule" },
        date: Date,
        day: String,
        time: String,
        room: String,
        status: String,
        attend: [{
            studentID: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
            attended: { type: String, }
        }]
    }],
    uploadDate: String,
    endDate: Date,
    startDate: Date,
    classStatus: { type: String, default: "Processing" },
}, { collection: 'class', timestamps: true });

var classModel = mongoose.model('class', classSchema)
module.exports = classModel