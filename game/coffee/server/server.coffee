exports.createServer = (io, ip, port) -> 
  console.log "Creating game server..."
  new GameServer(io)

class GameServer
  constructor: (@io) ->
    @theGame = new Game
    @waitingPlayers = []
    @io.sockets.on 'connection', @newPlayer
    
  newPlayer: (socket) =>
    player = new Player socket, this
    @waitingPlayers.push(player)
    console.log "Added player. There are now #{@waitingPlayers.length} waiting for a game."
  
  removePlayer: (player) =>
    @waitingPlayers.splice @waitingPlayers.indexOf player, 1
    console.log "Removed player. There are now #{@waitingPlayers.length} waiting for a game."
  
  joinGame: (player) ->
    @removePlayer player
    @theGame.addPlayer player

class Player
  constructor: (@socket, @server) ->
    @score = 0
    @socket.on 'set_name', @setName
    @socket.on 'join_game', @joinGame
  
  setName: (@name) =>
    @socket.emit 'name_set'
    
  joinGame: =>
    @server.joinGame this

class Game
  constructor: ->
    @players = []
    @map = []
  
  addPlayer: (player) ->     
    @players.push(player)
    player.socket.emit 'map_data', {map: @map}
    console.log "#{player.name} joined game."   

  removePlayer: (player) ->        
    @players.splice @players.indexOf player, 1