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
    @controller = new GameController this
    @socket.emit 'join_game'  
    @socket.on 'map_data', (map) =>
      console.log "Received map data."
      @game.loadMap map
    @socket.on 'tank_data', (tanks) =>
      console.log "Received tank data."
      @game.loadTanks tanks
    @socket.on 'add_tank', (data) =>
      @game.addTank new Tank data
    @socket.on 'new_waypoint', @receiveWaypoint
  
  sendWaypoint: (x, y) =>
    console.log "Sending waypoint " + x + " " + y
    @socket.emit 'new_waypoint', {x: x, y: y}
  
  receiveWaypoint: (data) =>
    console.log "Received waypoint for " + data.name
    tank = @game.findTankByName(data.name)
    tank.addWaypoint(data.waypoint)

class GameController
  constructor: (@client) ->
    $(@client.canvas).click @onClick
    setInterval @onTick, 1000 / 60
  
  onTick: (event) =>
    @client.game.tick()
  
  onClick: (e) =>
    x = 0
    y = 0
    if e.pageX or e.pageY 
      x = e.pageX
      y = e.pageY
    else
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    x -= @client.canvas[0].offsetLeft
    y -= @client.canvas[0].offsetTop
    @client.sendWaypoint x, y

class GameView
  constructor: (@canvas, @game) ->
    @ctx = @canvas[0].getContext "2d"
    @game.mapLoaded.add @render
    @game.tanksLoaded.add @render
    @game.gameUpdated.add @render
  
  render: =>
    $(@canvas).attr 'width', $(@canvas).attr 'width'
    @drawMap(@game.map)
    @drawTanks(@game.tanks)

  drawMap: (map) =>
    $(@canvas).attr 'width', @game.tileSize * map.xSize + "px"
    $(@canvas).attr 'height', @game.tileSize * map.ySize + "px"
    for i in [0..map.ySize - 1]
      for j in [0..map.xSize - 1]
        y = @game.tileSize * i
        x = @game.tileSize * j
        tileType = map.tiles[i * map.xSize + j]
        if tileType is 1
          @ctx.fillStyle = "#000000"
          @ctx.fillRect x, y, @game.tileSize, @game.tileSize

  drawTanks: (tanks) =>
    for tank in tanks
      @ctx.fillStyle = "#FF0000"
      @ctx.fillRect tank.position.x, tank.position.y, 15, 15
      @ctx.fillText tank.name, tank.position.x, tank.position.y + 25
      
$(document).ready ->  
  client = new GameClient $("#game_canvas")
  $("#connect").click ->
    if $("#connect").text() is 'Connect'
      client.connect $("#username").val()
      $("#connect").text 'Disconnect'
    else
      client.disconnect()
      location.reload();