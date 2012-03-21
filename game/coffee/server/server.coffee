exports.createServer = (io, ip, port) -> 
  console.log "Creating game server..."
  new WaitingRoomServer(io)

class WaitingRoomServer
  constructor: (@io) ->
    @theGame = new GameServer
    @waitingPlayers = []
    @io.sockets.on 'connection', (socket) =>
      player = new Player socket, this

  removePlayer: (player) =>
    @waitingPlayers.splice @waitingPlayers.indexOf player, 1
    console.log "Removed '#{player.name}' from waiting room. (#{@waitingPlayers.length})"
  
  joinServer: (player) =>
    @waitingPlayers.push(player)
    console.log "Added '#{player.name}' to waiting room. (#{@waitingPlayers.length})"
  
  joinGame: (player) =>
    @removePlayer player
    @theGame.addPlayer player

class GameServer
  constructor: ->
    @game = new Game
    @players = []
    @game.map =
      xSize: 10
      ySize: 10
      tiles: [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1
        1, 0, 0, 1, 1, 0, 0, 0, 0, 1
        1, 0, 0, 0, 1, 0, 0, 0, 0, 1
        1, 0, 0, 0, 1, 0, 0, 0, 0, 1
        1, 0, 0, 0, 1, 0, 1, 0, 0, 1
        1, 0, 0, 0, 0, 0, 1, 0, 0, 1
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1
      ]
  
  addPlayer: (player) ->
    # add a tank to the game
    tank = @game.createTank(player.name)
    player.setTank tank
    console.log "Adding '#{player.name}' to game and sending map data."
    @players.push player
    player.gameServer = this
    console.log "There are #{@players.length} players in the game."
    player.socket.emit 'map_data', @game.map
    player.socket.emit 'tank_data', @game.tanks
  
  removePlayer: (player) ->
    # TODO: remove player's tank from game
    console.log "Removed '#{player.name}' from server."
    @players.splice @players.indexOf player, 1
  
  sendToPlayers: (type, data) ->
    player.socket.emit type, data for player in @players

class Player
  constructor: (@socket, @server) ->
    @score = 0
    # before we do anything else, the name must be set
    @socket.on 'set_name', (@name) =>
      @socket.emit 'name_set'
      @server.joinServer this
    @socket.on 'join_game', =>
      @server.joinGame this
    @socket.on 'new_waypoint', @newWaypoint

  setTank: (@tank) ->
  
  newWaypoint: (data) => 
    p = new Vector data.x, data.y
    @tank.addWaypoint(p)
    @gameServer.sendToPlayers 'new_waypoint', {name: @tank.name, waypoint: p}