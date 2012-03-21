class Game
  constructor: ->
    @tileSize = 30
    @tanks = []
    @map = {}
    @mapLoaded = new Signal
    @tanksLoaded = new Signal
    @gameUpdated = new Signal
  
  mapWidth: =>
    return @map.xSize * @tileSize

  mapHeight: =>
    return @map.ySize * @tileSize

  loadMap: (map) ->
    @map = map
    @mapLoaded.dispatch @map
    
  loadTanks: (tanks) ->
    @tanks = []
    @addTank tankData for tankData in tanks
    @tanksLoaded.dispatch @tanks
    
  addTank: (tankData) ->
    @tanks.push new Tank tankData
    @tanksLoaded.dispatch @tanks
    
  createTank: (name) =>
    tank = new Tank
    tank.name = name
    tank.position.set Math.random() * @mapWidth(), Math.random() * @mapHeight()
    @tanks.push tank
    return tank
  
  findTankByName: (name) =>
    tank = (t for t in @tanks when t.name == name)[0]
    return tank
  
  tick: =>
    tank.update() for tank in @tanks
    @gameUpdated.dispatch()