var socket = io.connect('http://173.255.245.211:3000');
socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});