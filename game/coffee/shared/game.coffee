class Game
  constructor: ->
    @tileSize = 20
    @players = []
    @xSize = 0
    @ySize = 0
    @map = []
    @mapLoaded = new Signal
  
  loadMap: (map) ->
    @map = map
    @mapLoaded.dispatch @map
    
  addPlayer: (player) ->     
    @players.push(player)

  removePlayer: (player) ->        
    @players.splice @players.indexOf player, 1