class GameObject
  constructor: (data) ->
    if data
      @position = new Vector data.position.x, data.position.y
      @velocity = new Vector data.velocity.y, data.velocity.y
    else
      @position = new Vector 0, 0
      @velocity = new Vector 0, 0
  
  update: ->
    @position.add(@velocity)
    
  print: ->
    console.log "#{@position.x}, #{@position.y}"

class Tank extends GameObject
  constructor: (data) -> 
    @name = data.name if data
    @waypoints = []
    @speed = 2
    super data
  
  update: =>
    if @currentWaypoint
      dx = @position.x - @currentWaypoint.x
      dy =  @position.y - @currentWaypoint.y
      dist = Math.sqrt dx * dx + dy * dy
      if dist < 1
        @velocity.x = 0
        @velocity.y = 0
        @currentWaypoint = null
        @seekNextWaypoint() if @waypoints.length > 0
    super()
  
  seekNextWaypoint: =>
    @currentWaypoint = @waypoints.shift()
    dx = @currentWaypoint.x - @position.x
    dy = @currentWaypoint.y - @position.y
    angle = Math.atan2 dy, dx
    @velocity.x = Math.cos(angle) * @speed
    @velocity.y = Math.sin(angle) * @speed
  
  addWaypoint: (p) =>
    @waypoints.push p
    @seekNextWaypoint() if !@currentWaypoint