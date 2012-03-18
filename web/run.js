var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');

process.port = 3000;
app.listen(process.port);
console.log("Listening on port " + process.port);

function handler(req, res) {
  console.log(__dirname);
  fs.readFile(__dirname + 'index.html',
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