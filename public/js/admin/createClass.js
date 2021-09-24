$(document).ready(function() {
    countClass()
    createClassForm();
    unReadMess();
});



//hiệu ứng menu
$('header li').hover(function() {
    $(this).find("div").slideDown()
}, function() {
    $(this).find("div").hide(500)
});
// thoát khỏi modal box
$(window).on('click', function(e) {
    if ($(e.target).is('.updateClassOut')) {
        $('.actionOut').fadeIn(1000);
        $('.updateClassOut').fadeOut(1000);
    }
    if ($(e.target).is('.studentListOut')) {
        $('.actionOut').fadeIn(1000);
        $('.studentListOut').fadeOut(1000);
    }
    if ($(e.target).is('.studentTableAddOut')) $('.studentTableAddOut').fadeOut(1000);
    if ($(e.target).is('.attendedListOut')) {
        $('.actionOut').fadeIn(1000)
        $('.attendedListOut').fadeOut(1000);
    };
    if ($(e.target).is('.actionOut')) $('.actionOut').fadeOut(1000);
    if ($(e.target).is('.updateScheduleFormOut')) $('.updateScheduleFormOut').fadeOut(1000);
    if ($(e.target).is('.createClassOut')) $('.createClassOut').fadeOut(1000);
});

//đếm số lớp để hiển thị theo danh sachs trang
function countClass() {
    $.ajax({
        url: '/admin/countClass',
        method: 'get',
        dataType: 'json',
        data: { status: $("#typeClass").val() },
        success: function(response) {
            if (response.msg == 'success') {
                $("#soTrang").html("Page:<select onchange=getAllClass()></select>");
                //hiển thị số trang vào thẻ select cho dễ chọn trang
                for (let i = 1; i < response.soTrang; i++) { $("#soTrang select").append("<option value='" + (i - 1) + "'>" + i + "</option>") }
                $("#number").html("Total: " + response.numberOfClass)
                    //hiển thị thông tin các tài khoản theo role và số trang.
                getAllClass();
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}
//lấy danh sách lớp
function getAllClass() {
    $.ajax({
        url: '/admin/getAllClass',
        method: 'get',
        dataType: 'json',
        data: { status: $("#typeClass").val(), page: $("#soTrang select").val() },
        success: function(response) {
            if (response.msg == 'success') {
                $(".tableClass").html("<div class='tr'><div class='td'>Class name</div><div class='td'>teacher</div><div class='td'>routeName</div><div class='td'>stage</div><div class='td'>subject</div><div class='td'>Description</div><div class='td'>Start date</div><div class='td'>End date</div><div class='td'>Action</div></div>")
                $.each(response.classInfor, function(index, data) {
                    $(".tableClass").append("<div class='tr' id='" + data._id + "'><div class='td'>" + data.className + "</div><div class='td'>Name: " + data.teacherID.username + "<br>Email:" + data.teacherID.email + "</div><div class='td'>" + data.routeName + "</div><div class='td'>" + data.stage + "</div><div class='td'>" + data.subject + "</div><div class='td' style='display:none;'>" + data.timeToStudy + "</div><div class='td'>" + data.description + "</div><div class='td'>" + data.startDate.replace("T00:00:00.000Z", "") + "</div><div class='td'>" + data.endDate.replace("T00:00:00.000Z", "") + "</div><div class='td'><i class='far fa-edit' onclick=actionClass('" + data._id + "')></i><div style='display:none;' class='action" + data._id + "'><div class='td'><button onclick=changeInfor('" + data._id + "')><i class='fas fa-chalkboard-teacher'></i><br>Update class</button></div><div class='td'><button onclick=sendData('" + data._id + "')><i class='fas fa-users'></i><br>Student list</button></div><div class='td'><button onclick=upDateSchedule('" + data._id + "')><i class='far fa-calendar-alt'></i><br>List Schedule </button></div><div class='td'><button onclick=deleteClass('" + data._id + "')><i class='far fa-trash-alt'></i><br>Delete</button></div></div></div></div>")
                });
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}
//hiển thị bảng lựa chọn chỉnh sửa thông tin lớp học
function actionClass(id) {
    $(".actionOut").toggle(500)
    $(".action").html("")
    $(".action").html($(".action" + id).clone())
    $(".action .action" + id).show()
    $("#updateClassID").val(id)
    var allIn4 = []
    console.log("#" + id + " .td")
    $("#" + id + " .td").each(function() { allIn4.push($(this).text()) })
    $("#classNameUpdate").val(allIn4[0])
    $("#descriptionUpdate").val(allIn4[6])
    $("#currentTeacherName").val(allIn4[1].split("Email")[0].replace("Name: ", ""))
    $("#currentTeacherEmail").val(allIn4[1].split("Email:")[1])
}
//tìm kiếm class
function searchClass() {
    if ($("#search").val() == "") alert("Input class name")
    $.ajax({
        url: '/admin/searchClass',
        method: 'get',
        dataType: 'json',
        data: { className: $("#search").val() },
        success: function(response) {
            if (response.msg == 'success') {
                $(".tableClass").html("<div class='tr'><div class='td'>Class name</div><div class='td'>routeName</div><div class='td'>stage</div><div class='td'>subject</div><div class='td'>Description</div><div class='td'>Start date</div><div class='td'>End date</div><div class='td'>Action</div><div class='td'>Status</div></div>")
                $.each(response.classInfor, function(index, data) {
                    $(".tableClass").append("<div class='tr' id='" + data._id + "'><div class='td'>" + data.className + "</div><div class='td'>" + data.routeName + "</div><div class='td'>" + data.stage + "</div><div class='td'>" + data.subject + "</div><div class='td'>" + data.description + "</div><div class='td'>" + data.startDate.replace("T00:00:00.000Z", "") + "</div><div class='td'>" + data.endDate.replace("T00:00:00.000Z", "") + "</div><div class='td'><button onclick=sendData('" + data._id + "')>Student list</button><button onclick=upDateSchedule('" + data._id + "')>List Schedule </button><button onclick=deleteClass('" + data._id + "')>Delete</button></div><div class='td'> data.classStatus </div></div>")
                });
            }
            if (response.msg == 'notFound') alert("Can't found class")
        },
        error: function(response) {
            alert('server error');
        }
    });
}
//cập nhật thông tin lớp học: giáo viên, tên, miêu tả
function changeInfor(id) {
    $(".actionOut").toggle(500)
    $(".updateClassOut").fadeIn(500);
}
//xóa 1 lớp học
function deleteClass(id) {
    if (confirm("Are you sure you want to delete this?")) {
        $.ajax({
            url: '/admin/deleteClass',
            method: 'get',
            dataType: 'json',
            data: { id: id },
            success: function(response) {
                if (response.msg == 'success') {
                    countClass();
                    alert('success ');
                }
                if (response.msg == 'error') alert('error ');
            },
            error: function(response) {
                alert('server error');
            }
        });
    }
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


//lấy thông tin của giáo viên và các khóa học đẻe chọn giaos viên và lộ trình của lớp
function createClassForm() {
    $.ajax({
        url: '/admin/getTeacherAndClass',
        method: 'get',
        dataType: 'json',
        success: function(response) {
            if (response.msg == 'success') {
                $("#routeTypeS").html("")
                $("#span2").html("")
                $.each(response.targetxxx, function(index, data) { $("#routeTypeS").append('<option value="' + data.routeName + '">' + data.routeName + '</option>') });
                $.each(response.teacher, function(index, data) { $("#span2").append('<img src="' + data.avatar + '" onclick="selectedTeacher("' + data.email + '","' + data._id + '")"><figcaption>' + data.email + '</figcaption><input type="hidden" value="' + data._id + '"><input type="hidden" class ="avatar' + data._id + '" value="' + data.avatar + '">') });
                $("#teacherID img").attr("src", response.teacher[0].avatar)
                $("#teacherID figcaption").text(response.teacher[0].email)
                $("#teacherID input").val(response.teacher[0]._id)
                routeType();
            }
            if (response.msg == 'error') alert("error")
        },
        error: function(response) {
            alert('server error');
        }
    });

}

//thực hiện cập nhật thông tin lớp và lưu vào đb
$("#submitUpdateClass").submit(async function(event) {
    event.preventDefault();
    var condition = {}
    var updateTeacher = $("#updateTeacher").val()
    if (updateTeacher != '') {
        if (isNaN(updateTeacher) == true) condition["email"] = updateTeacher
        if (isNaN(updateTeacher) == false) condition["phone"] = updateTeacher
    } else { condition = "" }
    var formData = {
        classID: $("#updateClassID").val(),
        className: $("#classNameUpdate").val(),
        Description: $("#descriptionUpdate").val(),
        currentTeacherEmail: $("#currentTeacherEmail").val(),
        updateTeacher: condition,
    }
    $.ajax({
        url: '/admin/updateClass',
        method: 'post',
        dataType: 'json',
        data: formData,
        success: function(response) {
            if (response.msg == 'success') {
                alert("update class success");
                countClass();
                $('.updateClassOut').toggle(500);
            }
            if (response.msg == 'Teacher not found') alert("Teacher not found")
            if (response.msg == 'error') alert("error")
        },
        error: function(response) {
            alert('server error');
        }
    })

});

//lọc tìm kiếm student 
$("#filterStudent").keyup(function() {
    var filter = $("#filterStudent").val().toUpperCase()
    console.log(filter)
    $("#studentTable .tr:not(:first-child)").each(function() {
        if ($(this).find('.td').text().toUpperCase().indexOf(filter) > -1) {
            $(this).show()
            console.log($(this).text())
        } else {
            $(this).hide()
        }
        if (filter == "") $(this).show()
    })
});

//thực hiện tạo lớp và lưu vào đb
$("#myform").submit(async function(event) {
    event.preventDefault();
    var studentID = []
    var listStudent = []
    var attend = []
    $("input[name='hobby']").each(function(data) {
        if ($(this).is(':checked')) {
            studentID.push($(this).val())
            listStudent.push({ 'ID': $(this).val() });
            attend.push({ "studentID": $(this).val(), "attended": "" })
        }
    });
    //lấy các thứ trong tuần, giờ học, phòng
    var buoihoc = []
    var time = []
    var room = []
    $(".buoihocthu").each(function(data) { buoihoc.push($(this).val()) });
    $(".cahoc").each(function() { time.push($(this).val()) });
    $(".Room").each(function() { room.push($(this).val()) });
    //lấy các buổi học trong khoảng thời gian từ ngày bắt đầu môn học đến ngày kết thúc môn học
    var schedual = []
    var range = getDaysArray(new Date($("#startDate").val()), new Date($("#endDate").val()));
    for (var i = 0; i < range.length; i++) {
        for (var u = 0; u < buoihoc.length; u++) {
            // trừ 1 bời vì getDay luôn có giá trị nhỏ hơn giá trị của  thứ. EX: thứ 2 => getDay sẽ là 1 
            if (range[i].getDay() == (buoihoc[u] - 1)) {
                var date = range[i].getFullYear() + "-" + (range[i].getMonth() + 1).toString().padStart(2, "0") + "-" + range[i].getDate().toString().padStart(2, "0")
                var day = (range[i].getDay() + 1).toString().padStart(2, "0")
                schedual.push({ "time": time[u], "room": room[u], "date": date, "day": day, "attend": attend })
                break;
            }
        }
    }
    //lấy các thời gian học sinh có thể đi học tại trung tâm
    var timeToStudy = []
    $("#availbleTime input").each(function() {
        if ($(this).is(':checked')) {
            if ($(this).val() == "All") {
                timeToStudy.length = 0
                timeToStudy.push($(this).val())
                $("#availbleTime input").prop('checked', false);
                $(this).prop('checked', true);
            } else {
                timeToStudy.push($(this).val())
            }
        }
    })
    if (timeToStudy.length == 3) timeToStudy = ["All"]
    if (timeToStudy.length == 0) {
        alert("Enter time that student can study!")
    } else {
        var formData = {
            className: $(".className").val(),
            subject: $(".subject").val(),
            routeName: $(".routeName").val(),
            stage: $(".stage").val(),
            description: $(".description").val(),
            teacherID: $("#teacherID input").val(),
            endDate: $(".endDate").val(),
            startDate: $(".startDate").val(),
            studentID: studentID,
            listStudent: listStudent,
            schedual: schedual,
            time: time,
            room: room,
            buoihoc: buoihoc,
            timeToStudy: timeToStudy
        }
        $.ajax({
            url: '/admin/createClass',
            method: 'post',
            dataType: 'json',
            data: formData,
            success: function(response) {
                if (response.msg == 'success') {
                    alert("create class success");
                    countClass();
                    $('.createClassOut').toggle(500);
                }
                if (response.msg == 'error') alert("error")
            },
            error: function(response) {
                alert('server error');
            }
        })
    }
})


//chọn thời gian học
$('.checkTtime').on('change', function() {
    $('.checkTtime').not(this).prop('checked', false);
    getStudent();
});



//chọn giáo viên ở bảng chọn r hiển thị lại ở mục giáo viên chỉ định (tạo lớp form)
function selectedTeacher(email, id) {
    $("#teacherID").html('<img src="' + $(".avatar" + id).val() + '" style="height: 200px;width: 200px;" onclick=$("#span2").toggle(500)><figcaption>' + email + '</figcaption><input type="hidden" value="' + id + '">')
    $("#span2").fadeOut(500)
}



//lấy danh sách các học sinh trong lớp
function sendData(id) {
    $(".actionOut").fadeOut(500)
    var _id = id
    $.ajax({
        url: '/admin/allClassStudent',
        method: 'get',
        dataType: 'json',
        data: { abc: _id },
        success: function(response) {
            if (response.msg == 'success') {
                $(".studentListContent").html("<button onclick=addStudent('" + id + "')>Them học sinh vào lớp</button><button onclick=removeStudent('" + id + "')>Xóa học sinh trong lớp</button>")
                $(".studentListContent").append('<div class="tr" id="firstTrlistStudent"><div class="td" style="width:20%;">avatar</div><div class="td"style="width:20%;">username</div><div class="td" style="width:15%;">Aim</div><div class="td" style="width:35%;">email</div><div class="td"style="width:10%;">Select</div></div>')
                $.each(response.data, function(index, data) {
                    $.each(data.studentID, function(index, studentID) {
                        $(".studentListContent").append("<div class='tr'><div class='td'><img src='" + studentID.ID.avatar + "'></div><div class='td'>" + studentID.ID.username + "</div><div class='td'>" + studentID.ID.aim + "</div><div class='td'>" + studentID.ID.email + "</div><div class='td'><input type='checkbox' class='removeFormClass' value='" + studentID.ID._id + "' /></div></div>");
                    });
                });
                $(".studentListOut").fadeIn(500);
            }
            if (response.msg == 'error') alert("error")
        },
        error: function(response) {
            alert('server error');
        }
    });
}

//hiển thị danh sách lịch giảng dạy để admin chọn vào thay đổi lịch làm việc 1 ngày nào đó trong list
function upDateSchedule(id) {
    $(".actionOut").fadeOut(500)
    var idClass = id
    $.ajax({
        url: '/admin/attendedList',
        method: 'get',
        dataType: 'json',
        data: { id: id },
        success: function(response) {
            if (response.msg == 'success') {
                $("#attendedList").html("<div class='tr'><div class='td' style='width:20%'>Date</div><div class='td'style='width:20%'>Day of week</div><div class='td'style='width:20%' >Room</div><div class='td'style='width:30%'>Time</div><div class='td'style='width:10%'>Action</div></div>")
                $.each(response.data[0].schedule, function(index, data) {
                    $("#attendedList").append('<div class="tr" id="infor' + data._id + '"><div class="td">' + data.date.split("T00:00:00.000Z")[0] + '</div><div class="td">' + data.day + '</div><div class="td">' + data.room + '</div><div class="td">' + data.time + '</div><div class="td"><button  onclick=updateScheduleForm("' + data._id + '","' + idClass + '")>Update</button><input id ="' + data._id + '"type="hidden" value="' + data + '"></div></div>    ')
                });
                $(".attendedListOut").fadeIn(500)
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}
//hiển thị form update lịch cho giáo viên
function updateScheduleForm(scheduleID, classID) {
    $("input[name='updateScheduleID']").val(scheduleID)
    $("input[name='updateScheduleClassID']").val(classID)
    $("#oldSchudule").html('<div class="td">Old</div>')
    $("#oldSchudule").append($("#infor" + scheduleID + " .td:not(:last-child)").clone())
    $(".updateScheduleFormOut").fadeIn(500)
}

//hiênr thị các phòng trống để giáo viên giảng dạy khi cập nhật, chuyển lịch giảng dạy
$("#cahocUpdate").change(async function() {
    var date = new Date($("input[name='dateScheduleUpdate']").val())
    var dayOfWeek = (date.getDay() + 1)
    if (dayOfWeek == '1') dayOfWeek = "8"
    $("#dayOfWeekUpdate").html("0" + dayOfWeek)
    $.ajax({
        url: '/admin/getThu',
        method: 'get',
        dataType: 'json',
        data: { dayOfWeek: dayOfWeek, time: $('#cahocUpdate').val() },
        success: function(response) {
            if (response.msg == 'success') {
                $("#roomUpdate").html("")
                $.each(response.data, function(index, data) {
                    $.each(data.room, function(index, room) {
                        if (room.time == $('#cahocUpdate').val() && room.status == "None") {
                            $("#roomUpdate").append('<option value = "' + room.room + '" > ' + room.room + ' </option>')
                        }
                    });
                });
            }
            if (response.msg == 'error') {}
        },
        error: function(response) {
            alert('server error');
        }
    })
});


//thực hiện cập nhật, chuyển đổ lịch giảng dạy cho giáo viên
$("#SubmitupdateScheduleForm").submit(async function(event) {
    event.preventDefault();
    var date = new Date($("input[name='dateScheduleUpdate']").val())
    var dayOfWeek = '0' + (date.getDay() + 1)
    if (dayOfWeek == '01') dayOfWeek = "08"
    var old = []
    var scheduleID = $("input[name='updateScheduleID']").val()
    $("#infor" + scheduleID + " .td:not(:last-child)").each(function() { old.push($(this).text().trim()) })
    var update = {
        "schedule.$.time": $('#cahocUpdate').val(),
        "schedule.$.room": $('#roomUpdate').val(),
        "schedule.$.day": dayOfWeek,
        "schedule.$.status": "update"
    }
    $.ajax({
        url: '/admin/doupdateSchedule',
        method: 'post',
        dataType: 'json',
        data: {
            update,
            classID: $("input[name='updateScheduleClassID']").val(),
            date: $("input[name='dateScheduleUpdate']").val(),
            scheduleID: $("input[name='updateScheduleID']").val(),
            old: old
        },
        success: function(response) {
            if (response.msg == 'success') alert("success")
            if (response.msg == 'error') alert("error")
        },
        error: function(response) {
            alert('server error');
        }
    });
})


//hiển thị các học sinh có mức độ tương ứng với lớp đã chọn để xem xét thêm vào lớp
function addStudent(classID) {
    var infor4 = []
    $("#" + classID + " .td").each(function() { infor4.push($(this).text()) })
    var condition = {
        role: 'student',
        routeName: infor4[2].trim(),
        stage: infor4[3].trim(),
        availableTime: { $in: [infor4[5].trim(), 'All'] }
    }
    $.ajax({
        url: '/admin/addStudentToClass',
        method: 'get',
        dataType: 'json',
        data: { condition },
        success: function(response) {
            if (response.msg == 'success') {
                $('#studentTableAdd').html("<div class='tr'><div class='td'>avatar</div><div class='td'>username</div><div class='td'>email</div><div class='td'>routeName</div><div class='td'>stage</div><div class='td'>Chose</div></div>");
                $.each(response.data, function(index, student) {
                    var check = false
                    $.each(student.progess, function(index, progess) {
                        if (progess.stage == student.stage) {
                            $.each(progess.stageClass, function(index, stageClass) {
                                if (stageClass.classID == classID || stageClass.subject == infor4[3]) check = true
                            });
                        }
                    });
                    if (check == false) $("#studentTableAdd").append("<div class='tr'><div class='td'><img style ='max-width:100px;max-height:100px' src='" + student.avatar + "'></div><div class='td'>" + student.username + "</div><div class='td'>" + student.email + "</div><div class='td'>" + student.routeName + "</div><div class='td'>" + student.stage + "</div><div class='td'><input type='checkbox' name='hobby1' value='" + student._id + "' /></div></div>");
                });
                $("#studentTableAdd").append("<button onclick= doAddToClass('" + classID + "')>Add to Class</button>");
                $('.studentTableAddOut').show();
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}


//thêm học sinh vaof 1 lớp
function doAddToClass(classID) {
    var classID = classID
    var studentlistcl = [];
    var studentlistAttend = [];
    var studentlist = [];
    $('input[name="hobby1"]').each(function() {
        if ($(this).is(":checked")) {
            studentlist.push({ 'ID': $(this).attr('value') });
            studentlistAttend.push({ 'studentID': $(this).attr('value'), 'attended': '' });
            studentlistcl.push($(this).attr('value'));
        }
    });
    $.ajax({
        url: '/admin/doaddStudentToClass',
        method: 'post',
        dataType: 'json',
        data: {
            studentlistAttend: studentlistAttend,
            studentlistcl: studentlistcl,
            studentlist: studentlist,
            classID: classID,
        },
        success: function(response) {
            if (response.msg == 'success') {
                alert('add success');
                $(".studentListOut").hide();
                $(".studentTableAddOut").hide();
                sendData(classID);
            }
            if (response.msg == 'error') alert('add error ');
        },
        error: function(response) {
            alert('server error');
        }
    })
}


//xóa học sinh khỏi 1 lớp
function removeStudent(classID, subject) {
    var classID = classID
    var studentlistcl = [];
    studentlistAttend = [];
    $('.removeFormClass').each(function() {
        if ($(this).is(":checked")) {
            studentlistcl.push($(this).attr('value'));
            studentlistAttend.push({ 'studentID': $(this).attr('value') });

        }
    });
    $.ajax({
        url: '/admin/doremoveStudentToClass',
        method: 'post',
        dataType: 'json',
        data: {
            studentlistcl: studentlistcl,
            studentlistAttend: studentlistAttend,
            classID: classID,
            subject: subject
        },
        success: function(response) {
            if (response.msg == 'success') {
                alert('remove success ');
                $(".studentListOut").hide();
                sendData(classID);
            }
            if (response.msg == 'error') {
                alert('remove error ');
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}

//lấy các ngày trong khoảng thời gian học
var getDaysArray = function(start, end) {
    for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
};
//thêm form điền thông tin cho các tuần
function tuan() {
    $("#datlich").html("")
    for (var i = 0; i < $("#Schedule").val(); i++) {
        $("#datlich").append('<h4>Day ' + (i + 1) + ':</h4><input type="number" placeholder="Enter day of week" class ="buoihocthu" name="Schedule' + i + '" min=2 max=8 onchange=getTime("' + i + '") required/>Time: <select class= "cahoc" id="cahoc' + i + '" onchange="getThu(' + i + ')"></select>Room:<select class="Room" id="Room' + i + '"></select>')
    }
}
//lấy các ca làm của giáo viên trong ngày đã chọn (tránh trường hợp 1 giáo viên dạy chung 1 ca làm và ở 2 phòng khác nhau )
function getTime(i) {
    $('#cahoc' + i).html('<option value="7:30 to 9:30">7:30 to 9:30</option><option value="9:45 to 11:45">9:45 to 11:45</option><option value="13:30 to 15:30">13:30 to 15:30</option><option value="15:45 to 17:45">15:45 to 17:45</option><option value="18:15 to 20:15">18:15 to 20:15</option>')
    $.ajax({
        url: '/admin/getTime',
        method: 'get',
        dataType: 'json',
        data: {
            dayOfWeek: $("input[name='Schedule" + i + "']").val(),
            teacherID: $("#teacherID input").val(),
        },
        success: function(response) {
            if (response.msg == 'success') {
                $.each(response.data, function(index, data) {
                    $.each(data.schedule, function(index, schedule) {
                        $('#cahoc' + i + ' option[value="' + schedule.time + '"]').remove()
                    });
                });
            }
            if (response.msg == 'error') {}
        },
        error: function(response) {
            alert('server error');
        }
    })
}
//chọn các phòng trống để dạy
function getThu(i) {
    var dayOfWeek = $("input[name='Schedule" + i + "']").val()
    var time = $("#cahoc" + i + "").val()
    $.ajax({
        url: '/admin/getThu',
        method: 'get',
        dataType: 'json',
        data: { dayOfWeek: dayOfWeek, time: time },
        success: function(response) {
            if (response.msg == 'success') {
                $("#Room" + i + "").html("")
                $.each(response.data, function(index, data) {
                    $.each(data.room, function(index, room) {
                        if (room.time == time && room.status == "None") {
                            $("#Room" + i + "").append('<option value = "' + room.room + '" > ' + room.room + ' </option>')
                        }
                    });
                });
            }
            if (response.msg == 'error') {}
        },
        error: function(response) {
            alert('server error');
        }
    })
}


//lấy thông tin của lộ trình học
function routeType() {
    var routeName = $('#routeTypeS').val();
    $.ajax({
        url: '/admin/getStage',
        method: 'get',
        dataType: 'json',
        data: { abc: routeName },
        success: function(response) {
            if (response.msg == 'success') {
                $("#routeTuyBien").html("<div class='tr'></div><div class='tr'></div>");
                $('#levelS').html('');
                //hiển thị thông tin các giai đoạn của 1 lộ trình học
                $.each(response.data, function(index, data) {
                    $.each(data.routeSchedual, function(index, routeSchedual) {
                        var update = "<option value='" + routeSchedual.stage + "'>" + routeSchedual.stage + "</option>"
                        $("#levelS").append(update);
                    });
                });

                //hiển thị thông tin 1 lộ trình học lên đầu form tạo lớp sau khi chọn 1 khóa học
                $.each(response.data, function(index, targetxxx) {
                    $.each(targetxxx.routeSchedual, function(indexBIG, routeSchedual) {
                        $("#routeTuyBien .tr:nth-child(1)").append("<div class='td' style='font-size:20px;'>Stage " + (indexBIG + 1) + ": " + routeSchedual.stage + "</div>");
                        $("#routeTuyBien .tr:nth-child(2)").append("<div class='td'></div>");
                        $.each(routeSchedual.routeabcd, function(index, routeabcd) {
                            $("#routeTuyBien .tr:nth-child(2) .td:nth-child(" + (indexBIG + 1) + ")").append("<li>" + routeabcd + "</li>");
                        });
                    });

                });
                level();
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}
//lấy thông tin các môn học của 1 mốc giai đoạn đã chọn của lộ trình đã chọn
function level() {
    var routeName = $('#routeTypeS').val();
    var levelS = $('#levelS').val();
    $.ajax({
        url: '/admin/getStage',
        method: 'get',
        dataType: 'json',
        data: { abc: routeName, levelS: levelS },
        success: function(response) {
            if (response.msg == 'success') {
                $('#subject').html('');
                $('.taskrow').html('');
                $('#studentTableAddOut').show();
                //hiển thị bảo thẻ select các môn học của mốc giai đoạn 
                $.each(response.data, function(index, data) {
                    $.each(data.routeSchedual, function(index, routeSchedual) {
                        if (routeSchedual.stage == levelS) {
                            $.each(routeSchedual.routeabcd, function(index, routeabcd) { $("#subject").append("<option value='" + routeabcd + "'>" + routeabcd + "</option>"); });
                        }
                    });
                });
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}

//lấy các học sinh đang học tình trạng học tập tại mức độ đã chọn để thêm vào lớp trong form tạo lớp
function getStudent() {
    var routeName = $('#routeTypeS').val();
    var levelS = $('#levelS').val();
    var time
    $("#availbleTime input").each(function() { if ($(this).is(':checked')) time = $(this).val() })
    $.ajax({
        url: '/admin/getStudent',
        method: 'get',
        dataType: 'json',
        data: { abc: routeName, levelS: levelS, time: time },
        success: function(response) {
            if (response.msg == 'success') {
                if (response.student.length == 0) {
                    alert("không có học sinh học tập tại giai đoạn này")
                } else {
                    $('#studentTable').slideDown(1000);
                    $('#createClassOut,#createClass').animate({ scrollTop: ($('#studentTable').offset().top) }, 500)
                    $('#studentTable').html("<div class='tr'></div><div class='tr'><div class='td'>Avatar</div><div class='td'>Username</div><div class='td' style='display:none;'>Email</div><div class='td'>stage</div><div class='td'>Chose</div><div class='td'>More information</div></div>")
                    $.each(response.student, function(index, student) {
                        var check = false
                        $.each(student.progess, function(index, progess) {
                            //tiến hành lọc các học sinh có cùng mốc giai đoạn 
                            if (progess.stage == levelS) {
                                $.each(progess.stageClass, function(index, stageClass) {
                                    //nếu trong lộ trình học cá nhân của học sinh đã học bộ môn này và không bị restudy thì sẽ bỏ qua k hiển thị ra danh sách để thêm vào lớp
                                    if (stageClass.name == $("#subject").val() && stageClass.status != "Restudy") check = true
                                });
                            }
                        });
                        //nếu trong lộ trình học cá nhân của học sinh đã học bộ môn này và  bị restudy hoặc chưa học thì sẽ hiển thị ra danh sách để thêm vào lớp
                        if (check == false) $('#studentTable').append("<div class='tr'><div class='td'><img style ='max-width:200;max-height:200px' src='" + student.avatar + "'></div><div class='td'>" + student.username + "</div><div class='td' style='display:none;'>" + student.email + "</div><div class='td' style='display:none;'>" + student.phone + "</div><div class='td'>" + student.stage + "</div><div class='td'><input type='checkbox' name='hobby' value='" + student._id + "' /></div><div class='td'>" + "<button class='del' value='" + student._id + "'>View</button>" + "</div></div>");
                    });
                    $('#studentTable').show();
                }
                getAllClass();
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}