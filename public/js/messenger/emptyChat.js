  // establish socket.io connection
  const socket = io();

  $(document).ready(function() {
      $("#welcome").html("Welcome " + senderName.value)
  });

  //hiệu ứng menu
  $('header li').hover(function() {
      $(this).find("div").slideDown()
  }, function() {
      $(this).find("div").hide(500)
  });

  //tạo room cho tất cả cuọco trò chuyện "online" để nhận thông báo khi người khác gửi tin nhắn
  function connectAllConversation() {
      var idConversationList = [];
      var object = $("#allID").val()
      idConversationList = object.split(",");
      socket.emit("tao-room", {
          idConversationList
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


  //bắt sự kiện nhập
  $("#mess").focusin(function() {
      socket.emit('typing', {
          action: 'typing',
          senderID: $("#senderID").val(),
          senderName: $("#senderName").val(),
          _idRoom: $("#_idRoom").val()
      })
  });
  //bắt sự kiện hủy bỏ hoặc kết thúc nhập
  $("#mess").focusout(function() {
      socket.emit('stopTyping', {
          action: 'notTyping',
          _idRoom: $("#_idRoom").val()
      })
  });
  //lắng nghe sự kiện nhập và không nhập
  socket.on("Typing", TypingOrNot)
  socket.on("notTyping", TypingOrNot)

  //hiển thị dòng trạng thái khi đối phương nhập tin nhắn
  function TypingOrNot(data) {
      if (data._idRoom == $("#_idRoom").val()) {
          if (data.action === 'typing') {
              if (data.senderID != $("#senderID").val()) {
                  $("#messContent").append('<p class="action" style="color:blanchedalmond;height:20px;padding-left:20px;">' + data.senderName + 'is typing</p>')
                  $('#messContent').scrollTop($('#messContent')[0].scrollHeight);
              }
          }
          if (data.action === 'notTyping') $('.action').remove();
      }
  }

  //lấy cuộc trò chuyện khi người dùng ấn vào 1 cuộc trò chuyện khác ở thanh lịch sử chat
  function chatBox(receiverID, _idRoom) {
      $.ajax({
          url: '/messenger/getMessenger',
          method: 'get',
          dataType: 'json',
          data: { _idRoom: _idRoom },
          success: function(response) {
              if (response.msg == 'success') {
                  $('#' + _idRoom).css("font-weight", "normal");
                  $('#receiverID').val(receiverID)
                  $('#_idRoom').val(_idRoom)
                  $('#messContent').html("")
                  if (response.data.person1._id == $('#senderID').val()) {
                      var senderName = response.data.person1.username
                      var senderAva = response.data.person1.avatar
                      var receiverAva = response.data.person2.avatar
                      var receiverName = response.data.person2.username
                  } else {
                      var senderAva = response.data.person2.avatar
                      var senderName = response.data.person2.username
                      var receiverAva = response.data.person1.avatar
                      var receiverName = response.data.person1.username
                  }
                  $('#receiverAva').attr("src", receiverAva);
                  $('#senderAva').attr("src", senderAva);
                  $('#receiverName').val(receiverName)
                  $('.chatTitle').html("Conversation between " + senderName + " and " + receiverName)
                  $.each(response.data.message, function(index, message) {
                      if (message.ownermessengerID === $('#senderID').val()) $('#messContent').append("<div class='sender' onclick=$(this).find('label').toggle();><p>" + message.messContent + "</p>" + "<img src='" + senderAva + "'><br><label style='display:none;'>" + message.time.toString() + "</label></div>")
                      if (message.ownermessengerID === $('#receiverID').val()) $('#messContent').append("<div class='receiver' onclick=$(this).find('label').toggle();><img src='" + receiverAva + "'>" + "<p>" + message.messContent + "</p><br><label style='display:none;'>" + message.time.toString() + "</label></div>")
                      if (message.ownermessengerID !== $('#senderID').val() && message.ownermessengerID !== $('#receiverID').val()) $('#messContent').append("<div style='width: 100%;padding: 0;margin: 0;text-align: center;'><p>" + message.ownermessenger + ": " + message.messContent + "</p></div>")
                  });
                  $('#messContent').scrollTop($('#messContent')[0].scrollHeight);
                  unReadMess();
              }
          },
          error: function(response) {
              alert('server error');
          }
      });
  }

  //khi người dùng ấn chat thì sẽ server sẽ nhận tin nhắn và xử lý (server on "user-chat" )
  $("#messengerSubmit").submit(function(event) {
      event.preventDefault();
      //   sender gửi tin nhắn đền server và thông qua server gửi đến người nhận
      socket.emit("user-chat", {
          _idRoom: $("#_idRoom").val(),
          senderID: $("#senderID").val(),
          mess: $("#messengerSubmit input[name='mess']").val(),
          senderName: $("#senderName").val(),
          receiverName: $("#receiverName").val(),
          receiverID: $("#receiverID").val(),
      })
      $("#messengerSubmit input[name='mess']").val("")
  });
  // server gửi tin nhắn lại từ sender cho receiver
  socket.on("server-chat", addMessageToHTML)

  // add message to our page
  function addMessageToHTML(message) {
      if (message._idRoom == $("#_idRoom").val()) {
          // create a new div element
          var div = document.createElement("div");
          if (message.senderID == $("#senderID").val()) {
              div.setAttribute("class", "sender");
              div.innerHTML = "<p> " + message.mess + "</p> " + "<img src='" + $('#senderAva').attr('src') + "'>";
          } else {
              div.setAttribute("class", "receiver");
              div.innerHTML = "<img src='" + $('#receiverAva').attr('src') + "'>" + "<p> " + message.mess + " </p>";
          }
          // add to list of messages
          $("#messContent").append(div);
      }
      //hiển thị tin nhắn mới nhất ở lịch sử chat
      var now = Date().toString().split("GMT")[0]
      if ($("#senderID").val() == message.senderID) $('#' + message._idRoom).html(" " + message.receiverName + "<br>" + message.senderName + ": " + message.mess.slice(0, 9).toLowerCase() + "<br><label>" + now + "</label>")
      if ($("#senderID").val() == message.receiverID) $('#' + message._idRoom).html(" " + message.senderName + "<br>" + message.senderName + ": " + message.mess.slice(0, 9).toLowerCase() + "<br><label>" + now + "</label>")

      //tin nhắn gửi đến nếu chưa xem thì in đậm, xem r thì in bt
      if (message._idRoom != $("#_idRoom").val()) {
          $('#' + message._idRoom).css("font-weight", "bold");
      } else if (message.receiverID == $('#receiverID').val()) {
          $('#' + message._idRoom).css("font-weight", "normal");
      }
      $('#messContent').scrollTop($('#messContent')[0].scrollHeight);

      //hiển thị cuộc trò chuyện mới nhất lên đầu lịch sử
      $('.' + message._idRoom).prependTo(".history");
  }


  //click add chat để tìm kiếm 1 cuộc trò chuyện hoặc thêm
  function addChat() {
      var condition = {}
      if (isNaN($('#addChat').val()) == true) condition['email'] = $('#addChat').val()
      if (isNaN($('#addChat').val()) == false) condition['phone'] = $('#addChat').val()
      $.ajax({
          url: '/messenger/addChat',
          method: 'post',
          dataType: 'json',
          data: { condition: condition },
          success: function(response) {
              if (response.msg == 'error') alert('There are some error. \nContact with IT deparment to fix to this!')
              if (response.msg == 'user not found') alert('User not found. \nNote: You can"t add chat with yourself!')
              if (response.msg == 'conversation is already exist ') {
                  chatBox(response.receiverID, response.idRoom);
                  //hiển thị cuộc trò chuyện mới nhất lên đầu lịch sử
                  $('.' + response.idRoom).prependTo(".history");
                  alert('Conversation is already exist. It is moved to the top of chat history')
              }
              if (response.msg == 'createSuccess') {
                  //hiển thị cuộc trò chuyện mới nhất lên đầu lịch sử
                  var now = Date().toString().split("GMT")[0]
                  $(".history").prepend("<div class='" + response.idRoom + "'onclick=chatBox('" + response.receiver._id + "','" + response.idRoom + "')><img src='" + response.receiver.avatar + "'><p>  " + response.receiver.username + "<br>Hệ thống: Đã kết nố...</p><br><label>" + now + "</label></div>")
                  chatBox(response.receiver._id, response.idRoom);
                  var idConversationList = [];
                  idConversationList.push(response.idRoom);
                  //đưa vào room  để chat
                  socket.emit("tao-room", {
                      idConversationList
                  });
                  alert('Conversation created. It is moved to the top of chat history')
              }
          },
          error: function(response) {
              alert('server error');
          }
      });
  }