$(document).ready(function() {

    //hiệu ứng menu
    $('header li').hover(function() {
        $(this).find("div").slideDown()
    }, function() {
        $(this).find("div").hide(500)
    });
    let username = Cookies.get('username'); // => 'value'
    $("#welcome").html("Welcome " + username)

    getProcesscingClass()

    $(window).on('click', function(e) {
        if ($(e.target).is('.attendedListOut')) $('.attendedListOut').slideUp(1500);
        if ($(e.target).is('.attendedOutDoorOut')) $('.attendedOutDoorOut').slideUp(1500);
        if ($(e.target).is('.innerOut')) $('.innerOut').slideUp(1500);
        if ($(e.target).is('.studentAssessmentOut')) $('.studentAssessmentOut').slideUp(1500);
        if ($(e.target).is('.studentAssessmentUpdateOut')) $('.studentAssessmentUpdateOut').slideUp(1500);
        if ($(e.target).is('.lolaOut')) $('.lolaOut').slideUp(1500);
    });


});

//lấy danh sách học sinh trong lớp
function sendData(id, subject) {
    var _id = id
    $.ajax({
        url: '/teacher/allClassStudent',
        method: 'get',
        dataType: 'json',
        data: { abc: _id },
        success: function(response) {
            if (response.msg == 'success') {
                $(".inner").html('<div class="tr"><div class="td">avatar</div><div class="td">username</div><div class="td">Aim</div><div class="td">email</div><div class="td">grade</div><div class="td">feedBackContent</div><div class="td">Select</div><div class="td">Chat</div><div class="td">đánh giá</div></div>')
                $.each(response.data, function(index, data) {
                    if (data.studentID.length == 0) {
                        alert('không có học sinh trong lớp')
                    } else {
                        $.each(data.studentID, function(index, studentID) {
                            if (studentID.grade === "Has not been commented yet") {
                                $(".inner").append("<div class='tr'><div class='td'><img style ='max-width:150px;max-height:200px' src='" + studentID.ID.avatar + "'></div><div class='td'>" + studentID.ID.username + "</div><div class='td'>" + studentID.ID.aim + "</div><div class='td'>" + studentID.ID.email + "</div><div class='td'>" + studentID.grade + "</div><div class='td' id = '" + studentID.ID._id + "'>" + studentID.feedBackContent + "</div><div class='td'><input type='checkbox' class='removeFormClass' value='" + studentID.ID._id + "' /></div><div class='td'>" + "<button onclick =studentAssessmentForm('" + _id + "','" + studentID.ID._id + "','" + studentID.ID.username + "','" + studentID.ID.email + "')> Đánh giá học sinh</button>" + "</div><div class='td'><form action='/messenger/makeConnection' method='post'><input type='hidden' name='studentID' value='" + studentID.ID._id + "'><input type='hidden' name='studentName' value='" + studentID.ID.username + "'><button>Chat</button></form></div></div>");
                            } else {
                                $(".inner").append("<div class='tr'><div class='td'><img style ='max-width:150px;max-height:200px' src='" + studentID.ID.avatar + "'></div><div class='td'>" + studentID.ID.username + "</div><div class='td'>" + studentID.ID.aim + "</div><div class='td'>" + studentID.ID.email + "</div><div class='td'>" + studentID.grade + "</div><div class='td' id = '" + studentID.ID._id + "'>" + studentID.feedBackContent + "</div><div class='td'><input type='checkbox' class='removeFormClass' value='" + studentID.ID._id + "' /></div><div class='td'>" + "<button onclick =updateStudentAssessmentForm('" + _id + "','" + studentID.ID._id + "','" + studentID.ID.username + "','" + studentID.grade + "')> Chinh sua danh gia</button>" + "</div><div class='td'><form action='/messenger/makeConnection' method='post'><input type='hidden' name='studentID' value='" + studentID.ID._id + "'><input type='hidden' name='studentName' value='" + studentID.ID.username + "'><button>Chat</button></form></div></div>");
                            }
                        });
                    }
                });
                $(".innerOut").fadeIn(500);
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}

//đưa thông tin cũ vào form đnash giá
function studentAssessmentForm(classID, studentid, username, email) {
    $("#classID").html(classID);
    $("#studentID").html(studentid);
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
//tiến hành đánh giá
function takeFeedBack() {
    var formData = {
        classID: $("#classID").text(),
        studentId: $("#studentID").text(),
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
                $(".innerOut").hide();
                sendData($("#classID").text());
                alert("take feedback success")
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}
//tiến hành cập nhật thôn tin đánh giá
function updateFeekBack() {
    var formData = {
        classID: $("#updateclassID").text(),
        studentId: $("#updatestudentID").text(),
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
                $(".innerOut").hide();
                sendData($("#updateclassID").text());
                alert("update feedback success")
            }
        },
        error: function(response) {
            alert('server error');
        }
    });

}


var room = []
var day = []
var time = []
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
                $("#attendedList").html('<div class="tr"><div class="td">Date</div><div class="td">Day of week</div><div class="td">Action</div></div>')
                $("#loladate4").val(response.data[0].schedule[response.data[0].schedule.length - 1].date)
                $.each(response.data[0].schedule, function(index, data) {
                    if (!room.includes(data.room)) room.push(data.room)
                    if (!day.includes(data.day)) day.push(data.day)
                    if (!time.includes(data.time)) time.push(data.time)
                    $("#attendedList").append('<div class="tr"><div class="td">' + data.date.split("T00:00:00.000Z")[0] + '</div><div class="td">' + data.day + '</div><div class="td"><button onclick=takeAttend("' + data._id + '","' + idClass + '")>Take attend </button><input id ="' + data._id + '"type="hidden" value="' + data + '"></div></div>')
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
                $("#lola").html($("#lola .tr:first-child"))
                $.each(response.data[0].schedule, function(index, data) {
                    if (data._id == idattend) {
                        $.each(data.attend, function(index, attend) {
                            $("#loladate").val(data.date.split("T00:00:00.000Z")[0])
                            $("#loladate1").val(data._id)
                            $("#loladate3").val(idClass)
                            $("#scheduleStatus").val(data.status)
                            $("#scheduleTime").val(data.time)
                            $("#scheduleRoom").val(data.room)
                            $("#scheduleDay").val(data.day)
                            $("#lola").append('<div class="tr"><div class="td"><input class ="attendStudentID" type="hidden" value="' + attend.studentID._id + '">' + attend.studentID.username + '</div><div class="td"><select class ="attendStudentStatus" id="' + attend.studentID._id + '"><option value="attended">attended </option><option value="absent">absent</option><option value="None">none</option></select></div></div>')
                            $('#' + attend.studentID._id + ' option:selected').removeAttr('selected');
                            $('#' + attend.studentID._id + ' option[value="' + attend.attended + '"]').attr('selected', 'selected');
                        });
                    }
                });
                $("#lola").append('<div class="tr"><button onclick="submitTakeAttend()">submit</button></div>')
                $(".lolaOut").fadeIn(500)
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
    $(".attendStudentID").each(function() {
        studentID.push($(this).val())
    })
    var attended = []
    $(".attendStudentStatus").each(function() {
        attended.push($(this).val())
    })
    var attend = []
    for (var i = 0; i < attended.length; i++) {
        attend.push({ "studentID": studentID[i], "attended": attended[i] })
    }
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
            if (response.msg == 'success') {
                alert('success');
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}

//lấy danh sách các lớp đang dạy
function getProcesscingClass() {
    $.ajax({
        url: '/teacher/getClass',
        method: 'get',
        dataType: 'json',
        data: { check: "0" },
        success: function(response) {
            if (response.msg == 'success') {
                $("#tableClass").html('<div class="tr"><div class="td">Filter by Status:<select id="typeClass" onchange="typeClass()"><option value="processing">Processing</option><option value="end">End</option></select></div><div class="td" id="formSearchEndClass"style="display: none;"><input type="month" id="monthClass"><button onclick="searchEndClass()">Search</button></div></div></div>')
                $("#tableClass").append("<div class='tr'><div class='td'>Class name</div><div class='td'>routeName</div><div class='td'>stage</div><div class='td'>subject</div><div class='td'>Description</div><div class='td'>Start date</div><div class='td'>End date</div><div class='td'>Student List</div><div class='td'>Take attended</div></div>")
                response.classInfor.forEach((e) => {
                    $("#tableClass").append(" <div class='tr' id=" + e._id + "><div class='td'>" + e.className + "</div><div class='td'>" + e.routeName + "</div><div class='td'>" + e.stage + "</div><div class='td'>" + e.subject + "</div><div class='td'>" + e.description + "</div><div class='td'>" + e.startDate + "</div><div class='td'>" + e.endDate + "</div><div class='td'><button onclick=sendData('" + e._id + "','" + e.subject + "')>List of student</button></div><div class='td'><button onclick=attendedList('" + e._id + "')>attended </button></div></div>")
                })
                var getClassID = $("#getClassID").val()
                if (getClassID) $("#" + getClassID).css("background-color", 'red')
            }
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
    if (type == "end") $("#formSearchEndClass").slideDown(1200)
}

//tiến hành tìm kiếm và trả về kết quả
function searchEndClass() {
    var time = $("#monthClass").val() + "-01"
    $.ajax({
        url: '/teacher/getClass',
        method: 'get',
        dataType: 'json',
        data: { check: "1", time: time },
        success: function(response) {
            if (response.msg == 'success') {
                $("#tableClass").html('<div class="tr"><div class="td">Filter by Status:<select id="typeClass" onchange="typeClass()"><option value="processing">Processing</option><option value="end">End</option></select></div><div class="td" id="formSearchEndClass"style="display: none;"><input type="month" id="monthClass"><button onclick="searchEndClass()">Search</button></div></div></div>')
                $("#tableClass").append("<div class='tr'><div class='td'>Class name</div><div class='td'>routeName</div><div class='td'>stage</div><div class='td'>subject</div><div class='td'>Description</div><div class='td'>Start date</div><div class='td'>End date</div><div class='td'>Student List</div><div class='td'>Take attended</div></div>")
                response.classInfor.forEach((e) => {
                    $("#tableClass").append(" <div class='tr' id=" + e._id + "><div class='td'>" + e.className + "</div><div class='td'>" + e.routeName + "</div><div class='td'>" + e.stage + "</div><div class='td'>" + e.subject + "</div><div class='td'>" + e.description + "</div><div class='td'>" + e.startDate + "</div><div class='td'>" + e.endDate + "</div><div class='td'><button onclick=sendData('" + e._id + "','" + e.subject + "')>List of student</button></div><div class='td'><button onclick=attendedList('" + e._id + "')>attended </button></div></div>")
                })
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}