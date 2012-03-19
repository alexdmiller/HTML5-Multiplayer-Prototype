connectionURL = "http://" + TankGame.IP + ":" + TankGame.PORT
socket = io.connect(connectionURL)
socket.on 'news', (data) ->
  console.log data 
  socket.emit 'my other event', { my: 'data' }