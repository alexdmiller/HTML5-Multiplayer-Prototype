class Game
  constructor: ->
    @tileSize = 40
    @tanks = []
    @map = {}
    @mapLoaded = new Signal
    @tanksLoaded = new Signal
  
  mapWidth: =>
    return @map.xSize * @tileSize

  mapHeight: =>
    return @map.ySize * @tileSize

  loadMap: (map) ->
    @map = map
    @mapLoaded.dispatch @map
    
  loadTanks: (tanks) ->
    @tanks = []
    for tankData in tanks
      @tanks.push new Tank tankData
    @tanksLoaded.dispatch @tanks
    
  addTank: (tank) ->
    @tanks.push(tank)
    
  createTank: (name) =>
    tank = new Tank
    tank.name = name
    tank.position.set Math.random() * @mapWidth(), Math.random() * @mapHeight()
    @tanks.push tank
    return tank