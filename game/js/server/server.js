(function() {
  exports.createServer = function(io, ip, port) {
    console.log("Creating game server...");
    return io.sockets.on('connection', function(socket) {
      console.log("New connection");
      socket.emit('news', {
        hello: 'world'
      });
      return socket.on('my other event', function(data) {
        return console.log(data);
      });
    });
  };
}).call(this);
