$(document).ready(function() {
    routeType();
    // bỏ đuỏi GMT 
    $(".rightSide .tr .td:nth-child(7)").each(function() { $(this).text($(this).text().replace("07:00:00 GMT+0700 (GMT+07:00)", "")) })
    $(".rightSide .tr .td:nth-child(8)").each(function() { $(this).text($(this).text().replace("07:00:00 GMT+0700 (GMT+07:00)", "")) })

});

$(window).on('click', function(e) {
    if ($(e.target).is('.studentListOut')) $('.studentListOut').slideUp(1500);
    if ($(e.target).is('.teacherIn4Out')) $('.teacherIn4Out').slideUp(1500);
    if ($(e.target).is('.myAttendOut')) $('.myAttendOut').slideUp(1500);
});

//xem danh sách điểm danh của học sinh
function myAttended(classID) {
    $.ajax({
        url: '/student/myAttended',
        method: 'get',
        dataType: 'json',
        data: { classID: classID },
        success: function(response) {
            if (response.msg == 'success') {
                var data = response.data
                var studentIndex
                $(".myAttendContent").html("<div class='tr'><div class='td'>Date</div><div class='td'>Time</div><div class='td'>Status</div></div>")
                data[0].schedule.forEach((e, indexBIG) => {
                    $(".myAttendContent").append("<div class='tr'><div class='td'>" + e.date.replace("T00:00:00.000Z", "") + "</div><div class='td'>" + e.time + "</div></div>")
                    e.attend.forEach((e, index) => {
                        if (e.studentID._id == $("#studentID").val()) {
                            studentIndex = index
                            $(".myAttendContent .tr:nth-child(" + (indexBIG + 2) + ")").append("<div class='td'>" + e.attended + "</div>")
                        }
                    })
                })
                var totalSchedual = data[0].schedule.length
                $(".myAttendContent").append("<h1>Học sinh đã nghỉ " + (data[0].studentID[studentIndex].absentRate / totalSchedual * 100) + "% </h1>")
                $(".myAttendOut").fadeIn(500)
            }
        },
        error: function(response) {
            alert('server error');
        }
    });
}
//xem 1 số thông tin của giáo viên
function viewTeacherProfile(id) {
    var _id = id
    $(".teacherIn4Body").html("");
    $.ajax({
        url: '/student/getTeacherProfile',
        method: 'get',
        dataType: 'json',
        data: { abc: _id },
        success: function(response) {
            if (response.msg == 'success') {
                $.each(response.data, function(index, data) {
                    $(".teacherIn4").html("<div class='tr'><img style ='max-width:150px;max-height:200px' src='" + data.avatar + "'><label>" + data.username + "</label></div><div class='tr'>" + data.email + "</div><div class='tr'><form action='/messenger/makeConnection' method='post'><input type='hidden' name='studentID' value='" + data._id + "'><input type='hidden' name='studentName' value='" + data.username + "'><button>Chat</button></form></div>");
                });
                $(".teacherIn4Out").fadeIn(500);
            }
        },
        error: function(response) {
            alert('server error');
        }
    });

}
//lấy thông tin của lộ trình học
function routeType() {
    var routeName = $('#routeTypeS').text();
    $.ajax({
        url: '/admin/getStage',
        method: 'get',
        dataType: 'json',
        data: { abc: routeName },
        success: function(response) {
            if (response.msg == 'success') {
                $("#routeTuyBien").html("<div class='tr'></div><div class='tr'></div>");
                //hiển thị thông tin 1 lộ trình học lên đầu form tạo lớp sau khi chọn 1 khóa học
                $.each(response.data, function(index, targetxxx) {
                    $.each(targetxxx.routeSchedual, function(indexBIG, routeSchedual) {
                        $("#routeTuyBien .tr:nth-child(1)").append("<div class='td' style='font-size:20px;'>Stage " + (indexBIG + 1) + ": " + routeSchedual.stage + "</div>");
                        $("#routeTuyBien .tr:nth-child(2)").append("<div class='td'></div>");
                        if (routeSchedual.stage == $("#start").text().replace("Start stage: ", "") || routeSchedual.stage == $("#end").text().replace("Aim stage: ", "")) $("#routeTuyBien .tr:nth-child(1) .td:nth-child(" + (indexBIG + 1) + ")").css("background-color", "peru")
                        if (routeSchedual.stage == $("#current").text().replace("Current stage: ", "")) $("#routeTuyBien .tr:nth-child(1) .td:nth-child(" + (indexBIG + 1) + ")").html('Stage ' + (indexBIG + 1) + ': ' + routeSchedual.stage + '</div>' + '<i class="fas fa-map-marker-alt"></i>')
                        $.each(routeSchedual.routeabcd, function(index, routeabcd) {
                            $("#routeTuyBien .tr:nth-child(2) .td:nth-child(" + (indexBIG + 1) + ")").append("<li>" + routeabcd + "</li>");
                        });
                    });

                });
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}



//lấy danh sáhc học sinh trong lớp
function sendData(id) {
    var _id = id
    $.ajax({
        url: '/student/allClassStudent',
        method: 'get',
        dataType: 'json',
        data: { abc: _id },
        success: function(response) {
            if (response.msg == 'success') {
                $(".studentList").html('<div class="tr"><div class="td">avatar</div><div class="td">username</div><div class="td">email</div><div class="td">Chat</div></div>')
                $.each(response.data, function(index, data) {
                    $.each(data.studentID, function(index, studentID) {
                        $(".studentList").append("<div class='tr'><div class='td'><img style ='max-width:150px;max-height:200px' src='" + studentID.ID.avatar + "'></div><div class='td'>" + studentID.ID.username + "</div><div class='td'>" + studentID.ID.email + "</div><div class='td'><form action='/messenger/makeConnection' method='post'><input type='hidden' name='studentID' value='" + studentID.ID._id + "'><input type='hidden' name='studentName' value='" + studentID.ID.username + "'><button>Chat</button></form></div></div>");
                    });
                });
                $(".studentListOut").fadeIn(2000);
            }
        },
        error: function(response) {
            alert('server error');
        }
    });


}