$(document).ready(function() {
    countClass()
        //lấy các lớp mà giáo viên đang dạy
    unReadMess();

});

//hiệu ứng menu
$('header li').hover(function() {
    $(this).find("div").slideDown()
}, function() {
    $(this).find("div").hide(500)
});
let username = Cookies.get('username'); // => 'value'
$("#welcome").html("Welcome " + username)

//thoát modal box
$(window).on('click', function(e) {
    if ($(e.target).is('.attendedListOut')) $('.attendedListOut').slideUp(1500);
    if ($(e.target).is('.attendedOutDoorOut')) $('.attendedOutDoorOut').slideUp(1500);
    if ($(e.target).is('.studentListContentOut')) $('.studentListContentOut').slideUp(1500);
    if ($(e.target).is('.studentAssessmentOut')) $('.studentAssessmentOut').slideUp(1500);
    if ($(e.target).is('.studentAssessmentUpdateOut')) $('.studentAssessmentUpdateOut').slideUp(1500);
    if ($(e.target).is('.takeAttendFormOut')) $('.takeAttendFormOut').slideUp(1500);
});


//đếm số lớp để hiển thị theo danh sachs trang
function countClass() {
    $.ajax({
        url: '/teacher/countClass',
        method: 'get',
        dataType: 'json',
        data: { status: $("#typeClass").val() },
        success: function(response) {
            if (response.msg == 'success') {
                $("#soTrang").html("Page:<select onchange=getAllClass()></select>");
                $("#number").html("Total: " + response.numberOfClass)
                    //hiển thị số trang vào thẻ select cho dễ chọn trang
                for (let i = 1; i < response.soTrang; i++) { $("#soTrang select").append("<option value='" + (i - 1) + "'>" + i + "</option>") }
                //hiển thị thông tin các tài khoản theo role và số trang.
                getAllClass();
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}

//lấy số tin nhắn chưa đọc
function unReadMess() {
    $.ajax({
        url: '/messenger/unreadMess',
        method: 'get',
        dataType: 'json',
        data: {},
        success: function(response) {
            if (response.msg == 'success') {
                $("#UnreadMessages").html(response.unReadMess)
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}

//lấy danh sách các lớp đang dạy
function getAllClass() {
    $.ajax({
        url: '/teacher/getAllClass',
        method: 'get',
        dataType: 'json',
        data: { status: $("#typeClass").val(), page: $("#soTrang select").val() },
        success: function(response) {
            if (response.msg == 'success') {
                $("#tableClass").html('')
                $("#tableClass").append("<div class='tr'><div class='td'>Class name</div><div class='td'>routeName</div><div class='td'>stage</div><div class='td'>subject</div><div class='td'>Description</div><div class='td'>Start date</div><div class='td'>End date</div><div class='td'>Student List</div><div class='td'>Take attended</div></div>")
                response.classInfor.forEach((e) => {
                    $("#tableClass").append(" <div class='tr' id=" + e._id + "><div class='td'>" + e.className + "</div><div class='td'>" + e.routeName + "</div><div class='td'>" + e.stage + "</div><div class='td'>" + e.subject + "</div><div class='td'>" + e.description + "</div><div class='td'>" + e.startDate.replace("T00:00:00.000Z", "") + "</div><div class='td'>" + e.endDate.replace("T00:00:00.000Z", "") + "</div><div class='td'><button onclick=sendData('" + e._id + "')>View</button></div><div class='td'><button onclick=attendedList('" + e._id + "')>attended </button></div></div>")
                })
                var getClassID = $("#getClassID").val()
                if (getClassID) {
                    $("#" + getClassID).css("text-decoration-line", 'underline');
                    $("#" + getClassID).css("font-size", '20px');
                    setTimeout(function() {
                        $("#" + getClassID).css("text-decoration-line", 'none');
                        $("#" + getClassID).css("font-size", '18px');
                    }, 5000)
                }
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}


//lấy danh sách học sinh trong lớp
function sendData(id) {
    var _id = id
    $.ajax({
        url: '/teacher/allClassStudent',
        method: 'get',
        dataType: 'json',
        data: { abc: _id },
        success: function(response) {
            if (response.msg == 'success') {
                $(".studentListContent").html('<div class="tr"><div class="td">avatar</div><div class="td">username</div><div class="td">Aim</div><div class="td">email</div><div class="td">grade</div><div class="td">feedBackContent</div><div class="td">Chat</div><div class="td">Grade</div></div>')
                $.each(response.data, function(index, data) {
                    if (data.studentID.length == 0) {
                        alert('No student in class')
                    } else {
                        $.each(data.studentID, function(index, studentID) {
                            if (studentID.grade === "Has not been commented yet") {
                                $(".studentListContent").append("<div class='tr'><div class='td'><img style ='max-width:150px;max-height:200px' src='" + studentID.ID.avatar + "'></div><div class='td'>" + studentID.ID.username + "</div><div class='td'>" + studentID.ID.aim + "</div><div class='td'>" + studentID.ID.email + "</div><div class='td'>" + studentID.grade + "</div><div class='td' id = '" + studentID.ID._id + "'>" + studentID.feedBackContent + "</div><div class='td'>" + "<button onclick =studentAssessmentForm('" + _id + "','" + studentID.ID._id + "','" + studentID.ID.username + "','" + studentID.ID.email + "')> Grade </button>" + "</div><div class='td'><form action='/messenger/makeConnection' method='post'><input type='hidden' name='studentID' value='" + studentID.ID._id + "'><button>Chat</button></form></div></div>");
                            } else {
                                $(".studentListContent").append("<div class='tr'><div class='td'><img style ='max-width:150px;max-height:200px' src='" + studentID.ID.avatar + "'></div><div class='td'>" + studentID.ID.username + "</div><div class='td'>" + studentID.ID.aim + "</div><div class='td'>" + studentID.ID.email + "</div><div class='td'>" + studentID.grade + "</div><div class='td' id = '" + studentID.ID._id + "'>" + studentID.feedBackContent + "</div><div class='td'>" + "<button onclick =updateStudentAssessmentForm('" + _id + "','" + studentID.ID._id + "','" + studentID.ID.username + "','" + studentID.grade + "')> Edit grade</button>" + "</div><div class='td'><form action='/messenger/makeConnection' method='post'><input type='hidden' name='studentID' value='" + studentID.ID._id + "'><button>Chat</button></form></div></div>");
                            }
                        });
                    }
                });
                $(".studentListContentOut").fadeIn(500);
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}

//đưa thông tin cũ vào form đnash giá
function studentAssessmentForm(classID, studentid, username, email) {
    $("#classID").val(classID);
    $("#studentID").val(studentid);
    $("#name").html(username);
    $("#email").html(email);
    $(".studentAssessmentOut").fadeIn(2000);
}
//đưa thông tin cũ vào form cập nhật đnash giá
function updateStudentAssessmentForm(classID, studentID, name, grade) {
    $("#updateclassID").val(classID);
    $("#updatestudentID").val(studentID);
    $("#updatename").html(name);
    $('#updategrade option:selected').removeAttr('selected');
    $("#updategrade option[value='" + grade + "']").attr('selected', 'selected');
    var content = '#' + studentID
    $("#updatecomment").val($(content).text())
    $(".studentAssessmentUpdateOut").fadeIn(2000);
}
//tiến hành Grade
function takeFeedBack() {
    var formData = {
        classID: $("#classID").val(),
        studentId: $("#studentID").val(),
        grade: $("#grade").val(),
        comment: $("#comment").val(),
    };
    $.ajax({
        url: '/teacher/studentAssessment',
        method: 'post',
        dataType: 'json',
        data: formData,
        success: function(response) {
            if (response.msg == 'success') {
                $(".studentListContentOut").hide();
                sendData($("#classID").text());
                alert("take feedback success")
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}
//tiến hành cập nhật thôn tin Grade
function updateFeekBack() {
    var formData = {
        classID: $("#updateclassID").val(),
        studentId: $("#updatestudentID").val(),
        grade: $("#updategrade").val(),
        comment: $("#updatecomment").val(),
    };
    $.ajax({
        url: '/teacher/studentAssessment',
        method: 'post',
        dataType: 'json',
        data: formData,
        success: function(response) {
            if (response.msg == 'success') {
                $(".studentListContentOut").hide();
                sendData($("#updateclassID").text());
                alert("update feedback success")
            }
        },
        error: function(response) {
            alert('server error');
        }
    });

}


var room = [];
var day = [];
var time = [];
//đưa ra list các ngày để trọn điểm danh
function attendedList(id) {
    var idClass = id
    $.ajax({
        url: '/teacher/attendedList',
        method: 'get',
        dataType: 'json',
        data: { id: id },
        success: function(response) {
            if (response.msg == 'success') {
                room = []
                day = []
                time = []
                $("#attendedList").html('<div class="tr"><div class="td">Date</div><div class="td">Day of week</div><div class="td">Status</div><div class="td">Action</div></div>')
                $("#loladate4").val(response.data[0].schedule[response.data[0].schedule.length - 1].date)
                $.each(response.data[0].schedule, function(index, data) {
                    //lấy các ngày giờ học để tiện cho việc xét tragnj thái cho phòng nếu đó là ngày cuối cùng của khóa học
                    //không bao gồm những lịch học đã update vì chúng đã được chuyển trạng thái ở 1 câu lệnh riêng
                    if (data.status != 'update') {
                        if (!room.includes(data.room)) room.push(data.room)
                        if (!day.includes(data.day)) day.push(data.day)
                        if (!time.includes(data.time)) time.push(data.time)
                    }
                    if (data.status == 'success') {
                        $("#attendedList").append('<div class="tr"><div class="td">' + data.date.split("T00:00:00.000Z")[0] + '</div><div class="td">' + data.day + '</div><div class="td"><i style="color:green;" class="far fa-check-circle"></i></div><div class="td"><button onclick=takeAttend("' + data._id + '","' + idClass + '")>Take attend </button><input id ="' + data._id + '"type="hidden" value="' + data + '"></div></div>')
                    } else {
                        $("#attendedList").append('<div class="tr"><div class="td">' + data.date.split("T00:00:00.000Z")[0] + '</div><div class="td">' + data.day + '</div><div class="td"></div><div class="td"><button onclick=takeAttend("' + data._id + '","' + idClass + '")>Take attend </button><input id ="' + data._id + '"type="hidden" value="' + data + '"></div></div>')
                    }
                });
                $(".attendedListOut").fadeIn(500)
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}
//đưa ra list học sinh để điểm danh
function takeAttend(idattend, idClass) {
    var formData = {
        idattend: idattend,
        idClass: idClass,
    }
    $.ajax({
        url: '/teacher/attendedListStudent',
        method: 'get',
        dataType: 'json',
        data: formData,
        success: function(response) {
            if (response.msg == 'success') {
                $("#takeAttendContent").html($("#takeAttendContent .tr:first-child"))
                $.each(response.data[0].schedule, function(index, data) {
                    $.each(data.attend, function(index, attend) {
                        $("#loladate").val(data.date.split("T00:00:00.000Z")[0])
                        $("#loladate1").val(data._id)
                        $("#loladate3").val(idClass)
                        $("#scheduleStatus").val(data.status)
                        $("#scheduleTime").val(data.time)
                        $("#scheduleRoom").val(data.room)
                        $("#scheduleDay").val(data.day)
                        $("#takeAttendContent").append('<div class="tr"><div class="td"><input class ="attendStudentID" type="hidden" value="' + attend.studentID._id + '"><img src="' + attend.studentID.avatar + '"><figcaption>' + attend.studentID.username + '</figcaption></div><div class="td"><select class ="attendStudentStatus" id="' + attend.studentID._id + '"><option value="attended">attended </option><option value="absent">absent</option><option value="None">none</option></select></div></div>')
                        $('#' + attend.studentID._id + ' option:selected').removeAttr('selected');
                        $('#' + attend.studentID._id + ' option[value="' + attend.attended + '"]').attr('selected', 'selected');
                    });
                });
                $("#takeAttendContent").append('<button onclick="submitTakeAttend()">submit</button>')
                $(".takeAttendFormOut").fadeIn(500)
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}
//tiến hành cập nhật danh sachs điểm danh
function submitTakeAttend() {
    var studentID = []
    $(".attendStudentID").each(function() { studentID.push($(this).val()) })
    var attended = []
    $(".attendStudentStatus").each(function() { attended.push($(this).val()) })
    var attend = []
    for (var i = 0; i < attended.length; i++) { attend.push({ "studentID": studentID[i], "attended": attended[i] }) }
    //Note: room,day,time là số buổi học và giờ học được gán từ lúc lấy danh sách lịch học
    var formData = {
        attend: attend,
        idClass: $("#loladate3").val(),
        schedule: $("#loladate1").val(),
        lastDate: $("#loladate4").val(),
        room: room,
        day: day,
        time: time,
        scheduleStatus: $("#scheduleStatus").val(),
        scheduleTime: $("#scheduleTime").val(),
        scheduleRoom: $("#scheduleRoom").val(),
        scheduleDay: $("#scheduleDay").val(),
    }
    $.ajax({
        url: '/teacher/doTakeAttended',
        method: 'post',
        dataType: 'json',
        data: formData,
        success: function(response) {
            if (response.msg == 'success') alert('success');
        },
        error: function(response) {
            alert('server error');
        }
    });
}

//lọc phân loại tìm kiếm (lớp đang dạy hay đã dạy và khoảng thời gian)
function typeClass() {
    var type = $("#typeClass").val()
    if (type == "processing") {
        $("#formSearchEndClass").hide(500)
        getProcesscingClass()
    }
    if (type == "end") $("#formSearchEndClass").slideDown(500)
}