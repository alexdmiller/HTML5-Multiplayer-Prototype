function startServer(ip, port) {
  var app = require('http').createServer(handler);
  var io = require('socket.io').listen(app);
  var fs = require('fs');

  app.listen(ip, port);

  function handler (req, res) {
    fs.readFile(__dirname + '/../client/index.html',
    function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200);
      res.end(data);
    });
  }

  io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });
}

startServer('173.255.245.211', 3000);