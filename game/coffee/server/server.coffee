exports.createServer = (io, ip, port) -> 
  console.log "Creating game server..."
  new WaitingRoomServer(io)

class WaitingRoomServer
  constructor: (@io) ->
    @theGame = new GameServer
    @waitingPlayers = []
    @io.sockets.on 'connection', (socket) =>
      player = new Player socket, @joinServer, @joinGame

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
    @game.map =
      xSize: 3
      ySize: 3
      tiles: [
        1, 0, 1
        0, 0, 0
        1, 1, 1
      ]
  
  addPlayer: (player) ->
    console.log "Adding '#{player.name}' to game and sending map data."
    @game.addPlayer(player)
    console.log "There are #{@game.players.length} players in the game."
    player.socket.emit 'map_data', @game.map
  
  removePlayer: (player) ->
    console.log "Removed '#{player.name}' from game."
    @game.removePlayer(player)

class Player
  constructor: (@socket, joinServer, joinGame) ->
    @score = 0
    # before we do anything else, the name must be set
    @socket.on 'set_name', (@name) =>
      @socket.emit 'name_set'
      joinServer this
    @socket.on 'join_game', =>
      joinGame this