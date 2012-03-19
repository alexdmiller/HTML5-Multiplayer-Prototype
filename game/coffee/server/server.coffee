exports.createServer = (io, ip, port) -> 
  console.log "Creating game server..."
  io.sockets.on 'connection', (socket) ->
    console.log "New connection"
    socket.emit 'news', { hello: 'world' }
    socket.on 'my other event', (data) ->
      console.log data