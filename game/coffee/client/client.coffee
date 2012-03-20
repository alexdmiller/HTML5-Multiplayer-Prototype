connectionURL = "http://" + TankGame.IP + ":" + TankGame.PORT

class GameClient
  constructor: ->
    console.log "Game client created."
    
  connect: (@name) ->
    console.log "Connecting to server with name '" + @name + "'."
    @socket = io.connect(connectionURL)
    console.log "Attempting handshake with server."
    @socket.on 'connect', =>
      console.log "Sending name."
      @socket.emit 'set_name', @name
      @socket.on 'name_set', =>
        console.log "Joining game."
        @socket.emit 'join_game'
    @socket.on 'disconnect', =>
      console.log "Disconnecting from server."
      @disconnect
    @socket.on 'map_data', (data) =>
      @loadMap data
    
  disconnect: ->
    console.log "Disconnecting client."
    @socket.disconnect()
  
  loadMap: (map) =>
    console.log "Loading map"
    console.log map
    
class GameView
  constructor: (@canvas) ->
    $(@canvas).width 800 
    $(@canvas).height 800
    @ctx = @canvas[0].getContext "2d"
    @ctx.fillStyle = "rgb(200,0,0)"
    @ctx.fillRect 10, 10, 55, 50

$(document).ready ->  
  client = new GameClient
  view = new GameView $("#game_canvas")
  $("#connect").click ->
    if $("#connect").text() is 'Connect'
      client.connect $("#username").val()
      $("#connect").text 'Disconnect'
    else
      client.disconnect()
      location.reload();
    