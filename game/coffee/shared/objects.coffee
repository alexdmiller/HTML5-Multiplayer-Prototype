class GameObjectModel
  constructor: ->
    @position = new Vector 0, 0
    @velocity = new Vector 0, 0
  
  update: ->
    
  print: ->
    console.log "#{@position.x}, #{@position.y}"