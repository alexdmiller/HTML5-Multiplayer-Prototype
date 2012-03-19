(function() {
  var connectionURL, socket;
  connectionURL = "http://" + TankGame.IP + ":" + TankGame.PORT;
  socket = io.connect(connectionURL);
  socket.on('news', function(data) {
    console.log(data);
    return socket.emit('my other event', {
      my: 'data'
    });
  });
}).call(this);
