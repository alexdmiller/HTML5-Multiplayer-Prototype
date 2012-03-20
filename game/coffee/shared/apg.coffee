# Stores the x and y component of a two dimensional vector.
class Vector
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

# Simple event dispatcher object. Every time dispatch is called, each listener
# function which has been added with the add method is called.
class Signal
    constructor: ->
        @listeners = []

    add: (listener) ->
        @listeners.push(listener)

    dispatch: (argument) ->
        listener argument for listener in @listeners