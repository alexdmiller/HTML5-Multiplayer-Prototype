connectionURL = "http://" + TankGame.IP + ":" + TankGame.PORT

class GameClient
  constructor: (@canvas) ->
    console.log "Game client created."
    
  connect: (@name) ->
    console.log "Connecting to server with name '" + @name + "'."
    @socket = io.connect(connectionURL)
    console.log "Attempting handshake with server."
    @socket.on 'connect', =>
      console.log "Sending name."
      @socket.emit 'set_name', @name
      @socket.on 'name_set', @joinGame
        
    @socket.on 'disconnect', =>
      console.log "Disconnecting from server."
      @disconnect()
    
  disconnect: ->
    console.log "Disconnecting client."
    @socket.disconnect()
  
  joinGame: =>
    console.log "Joining game."
    @game = new Game
    @view = new GameView @canvas, @game
    @socket.emit 'join_game'  
    @socket.on 'map_data', (map) =>
      console.log "Loading map."
      @game.loadMap map
    
class GameView
  constructor: (@canvas, @game) ->
    @ctx = @canvas[0].getContext "2d"
    @game.mapLoaded.add @drawMap
  
  drawMap: (map) =>
    $(@canvas).attr 'width', @game.tileSize * map.xSize + "px"
    $(@canvas).attr 'height', @game.tileSize * map.ySize + "px"
    for i in [0..map.ySize - 1]
      for j in [0..map.xSize - 1]
        y = @game.tileSize * i
        x = @game.tileSize * j
        tileType = map.tiles[i * map.xSize + j]
        if tileType is 1
          @ctx.fillStyle = "0x000000"
          @ctx.fillRect x, y, @game.tileSize, @game.tileSize
        else

$(document).ready ->  
  client = new GameClient $("#game_canvas")
  $("#connect").click ->
    if $("#connect").text() is 'Connect'
      client.connect $("#username").val()
      $("#connect").text 'Disconnect'
    else
      client.disconnect()
      location.reload();
    