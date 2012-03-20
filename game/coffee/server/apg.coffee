exports.Vector = class Vector
    constructor: (@x, @y) ->

    set: (x, y) ->
        @x = x
        @y = y

    add: (@other) ->
        @x += @other.x
        @y += @other.y

    subtract: (@other) ->
        @x -= @other.x
        @y -= @other.y

    copy: ->
        new Vector(@x, @y)

exports.Signal = class Signal
    constructor: ->
        @listeners = []

    add: (listener) ->
        @listeners.push(listener)

    dispatch: (argument) ->
        listener argument for listener in @listeners