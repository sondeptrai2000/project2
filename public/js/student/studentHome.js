var fileData;
var myFile;

$(document).ready(function() {
    //lấy thông tin cá nhân
    studentProfile()
        //lấy lịch học
    test()
        //hiệu ứng menu
    $('header li').hover(function() {
        $(this).find("div").slideDown()
    }, function() {
        $(this).find("div").hide(500)
    });
    //thoát update form
    $(window).on('click', function(e) {
        if ($(e.target).is('.updateProfileOut')) {
            $('.updateProfileOut').slideUp(1500);
        }
    });

    $('#myFile').on('change', function() {
        var filereader = new FileReader();
        filereader.onload = function(event) {
            fileData = event.target.result;
            var dataURL = filereader.result;
            $("#output").attr("src", dataURL);
        };
        myFile = $('#myFile').prop('files')[0];
        console.log('myfile', myFile)
        filereader.readAsDataURL(myFile)
    });
});
//lấy lịch học 
function test() {
    //lấy các ngày trong năm
    for (var arr = [], dt = new Date("2021-01-01"); dt <= new Date("2021-12-31"); dt.setDate(dt.getDate() + 1)) {
        var date = new Date(dt)
        var month = (date.getMonth() + 1).toString().padStart(2, "0");
        var lol = date.getFullYear() + "-" + month + "-" + date.getDate().toString().padStart(2, "0");
        arr.push({ "ngay": lol, "thu": (date.getDay() + 1) });
    }
    //chia thành các tuần từ thứ 2 đến CN
    var tuan = []
    var check = false
    var check2 = false
    for (var i = 0; i < arr.length; i++) {
        var d = new Date(arr[i].ngay);
        var n = d.getDay();
        if (arr[i].thu != 2 && i < 7 && check2 == false) {
            tuan.push(arr[i].ngay + ' đến ' + arr[7 - n].ngay)
            check2 = true
        }
        if (arr[i].thu == 2 && (i + 7) < arr.length) {
            tuan.push(arr[i].ngay + ' đến ' + arr[i + 6].ngay)
        }
        if (arr[i].thu != 2 && (i + 7) > arr.length && check == false) {
            tuan.push(arr[i + 1].ngay + ' đến ' + arr[arr.length - 1].ngay)
            check = true
        }
    }
    //đưa các tuần vào thẻ select và đặt select cho tuần hiện tại.
    const date1 = new Date();
    var year = date1.getFullYear()
    var month = date1.getMonth() + 1
        //lấy thời gian hiện tại để so sánh và lấy tuần
    var now = date1.getFullYear() + "-" + month.toString().padStart(2, "0") + "-" + date1.getDate();
    for (var u = 0; u < tuan.length; u++) {
        $("#chonTuan").append('<option value="' + tuan[u] + '">' + tuan[u] + '</option>');
        dauTuan = tuan[u].split(" đến ")[0]
        cuoiTuan = tuan[u].split(" đến ")[1]
        if ((dauTuan <= now) && (now <= cuoiTuan)) {
            $('#chonTuan option:selected').removeAttr('selected');
            $("#chonTuan option[value='" + tuan[u] + "']").attr('selected', 'selected');
        }
    }
    //lấy thông tin lịch trình học, làm việc
    tuanoi()
};

//lấy các ngày trong khoảng thời gian học
var getDaysArray = function(start, end) {
    for (var arr = [], dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        arr.push(new Date(dt));
    }
    return arr;
};

//lấy thông tin lịch trình học, làm việc
function tuanoi() {
    var tuan = $("#chonTuan").val()
    var dauTuan = tuan.split(" đến ")[0]
    var cuoiTuan = tuan.split(" đến ")[1]
    var formData = {
            dauTuan: dauTuan,
            cuoiTuan: cuoiTuan
        }
        //chỉnh fomat date giống Type Date trong mongoDB để so sánh 
        // link src hàm moment ở head
    var start = moment(new Date(dauTuan)).format('YYYY-MM-DD[T00:00:00.000Z]');
    var end = moment(new Date(cuoiTuan)).format('YYYY-MM-DD[T00:00:00.000Z]');
    var a = getDaysArray(new Date(dauTuan), new Date(cuoiTuan));
    $("#ngay").html("<div class='td'>Ngày</div>")
        //tùy biến ngày vào html
    a.forEach(element => {
        $("#ngay").append("<div class='td'>" + (element.getFullYear() + "-" + (element.getMonth() + 1).toString().padStart(2, "0") + "-" + element.getDate()) + "</div>")
    });
    //lấy thông tin lịch học
    $.ajax({
        url: '/student/getSchedule',
        method: 'get',
        dataType: 'json',
        data: formData,
        success: function(response) {
            if (response.msg == 'success') {
                $("#time1").html('<div class="td">7:30 đến 9:30</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time2").html('<div class="td">9:45 đến 11:45</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time3").html('<div class="td">13:30 đến 15:30</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time4").html('<div class="td">15:45 đến 17:45</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $("#time5").html('<div class="td">18:15 đến 20:15</div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div><div class="td"></div>')
                $.each(response.classInfor, function(index, classInfor) {
                    $.each(classInfor.schedule, function(index, schedule) {
                        if (start <= schedule.date && schedule.date <= end) {
                            //ghi thông tin lịch học, làm việc vào bảng
                            var caLam = typeTime(schedule.time)
                            $("#" + caLam + " div:nth-child(" + schedule.day + ")").append("<a href='/student/allClass/" + classInfor._id + "'>Class: " + classInfor.className + "</a> Room: " + schedule.room)
                        }
                    });
                });
            }
            if (response.msg == 'error') {
                alert("error")
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}
//phân ca để dưa vào bảng lịch học
function typeTime(time) {
    var caLam
    console.log(time)
    if (time == "7:30 đến 9:30") caLam = "time1"
    if (time == "9:45 đến 11:45") caLam = "time2"
    if (time == "13:30 đến 15:30") caLam = "time3"
    if (time == "15:45 đến 17:45") caLam = "time4"
    if (time == "18:15 đến 20:15") caLam = "time5"
    return caLam
}

//lấy thông tin học sinh
function studentProfile() {
    $.ajax({
        url: '/teacher/teacherProfile',
        method: 'get',
        dataType: 'json',
        data: {},
        success: function(response) {
            if (response.msg == 'success') {
                $(".content").show();
                $("#idProfile").text(response.data._id);
                $("#routeProfile").html("Route: " + response.data.routeName);
                $("#stageProfile").html("Stage: " + response.data.stage);
                $("#avatarProfile").attr("src", response.data.avatar);
                $("#welcome").html("Welcome " + response.data.username);
                $("#usernameProfile").html("Full Name: " + response.data.username);
                $("#genderProfile").html("Gender: " + response.data.sex);
                $("#emailProfile").html("Email: " + response.data.email);
                $("#phoneProfile").html("Phone: " + response.data.phone);
                $("#birthdayProfile").html("BirthDay: " + response.data.birthday);
                $("#addressProfile").html("Address: " + response.data.address);
            }
        },
        error: function(response) {
            alert('server error');
        }
    })
}
//đưa thông tin cũ vào form update thông tin
function updateProfile() {
    $("#avatarOldProfile").val($('#avatarProfile').attr('src'));
    $("#currentAvatar").attr("src", $('#avatarProfile').attr('src'));
    $("#usernameUpdate").val($("#usernameProfile").text());
    $("#genderUpdate").val($("#genderProfile").text());
    $("#emailUpdate").val($("#emailProfile").text());
    $("#phoneUpdate").val($("#phoneProfile").text());
    $("#birthdayUpdate").val($("#birthdayProfile").text());
    $("#addressUpdate").val($("#addressProfile").text());
    $(".updateProfileOut").toggle(2000);
}

//tiến hành cập nhật thông tin
function doUpdateProfile() {
    if (!fileData) {
        fileData = "none"
    }
    var password = $("#newPassWord").val()
    var formData1 = {
        sex: $("#genderUpdate").val().split("Gender: ")[1],
        username: $("#usernameUpdate").val().split("Full Name: ")[1],
        email: $("#emailUpdate").val().split("Email: ")[1],
        phone: $("#phoneUpdate").val().split("Phone: ")[1],
        address: $("#addressUpdate").val().split("Address: ")[1],
        birthday: $("#birthdayUpdate").val().split("BirthDay: ")[1],
        avatar: $('#currentAvatar').attr('src'),
    };
    $.ajax({
        url: '/student/doeditAccount',
        method: 'post',
        dataType: 'json',
        data: {
            id: $("#idProfile").text(),
            password: password,
            formData1: formData1,
            file: fileData,
            oldLink: $('#avatarOldProfile').val(),
        },
        success: function(response) {
            if (response.msg == 'success') {
                studentProfile();
                $('.updateProfileOut').slideUp(1500);
            }
            if (response.msg == 'Account already exists') alert("Account already exists")
            if (response.msg == 'Phone already exists') alert("Phone already exists")
            if (response.msg == 'error') alert("error")
        },
        error: function(response) {
            alert('server error');
        }
    })
}