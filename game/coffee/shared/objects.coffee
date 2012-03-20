class GameObject
  constructor: (data) ->
    if data
      @position = data.position
      @velocity = data.velocity
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
    super data