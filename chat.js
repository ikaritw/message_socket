/*
socket.io
http://socket.io/get-started/chat/
http://huli.logdown.com/posts/261051-node-js-socketio-to-create-super-simple-chat-room
*/

var messageQueue = [];
var messageQueueMax = 1000;
var idAndName = {};

var io = require('socket.io')();


io.on('connection', function(socket) {
  console.log('a user connected:' + socket.id);

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('add user', function(username) {

    console.log('add user: ' + username + ":" + socket.id);
    idAndName[username] = socket.id;
    console.log("idAndName數量:" + Object.keys(idAndName).length);

    var payload = {
      'username': username,
      'time': Date.now(),
      'message': '已加入'
    };
    io.emit('add user', JSON.stringify(payload));
  });

  socket.on('say to someone', function(data) {
    var payload = {};

    try {
      payload = JSON.parse(data);
    }
    catch (ex) {
      console.error(data);
      payload.message = ex.toString();
    }
    payload.time = Date.now();

    var fromID = idAndName[payload.username];
    var toID = idAndName[payload.someone];
    if (toID) {
      io.to(toID).emit('say to someone', JSON.stringify(payload));
    }
    else {
      io.to(fromID).emit('say to someone', JSON.stringify(payload));
    }
  });

  socket.on('chat message', function(data) {
    var payload = JSON.parse(data);
    payload.time = Date.now();

    messageQueue.push(payload);
    if (messageQueue.length > messageQueueMax) {
      messageQueue.shift();
    }
    console.log("messageQueue數量:" + messageQueue.length);

    io.emit('chat message', JSON.stringify(payload));
  });
});


io.idAndName = idAndName;

module.exports = io;