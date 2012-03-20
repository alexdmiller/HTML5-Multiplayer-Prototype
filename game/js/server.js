(function() {
  var Game, GameObjectModel, GameServer, Player, Signal, Vector, WaitingRoomServer;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  exports.createServer = function(io, ip, port) {
    console.log("Creating game server...");
    return new WaitingRoomServer(io);
  };
  WaitingRoomServer = (function() {
    function WaitingRoomServer(io) {
      this.io = io;
      this.joinGame = __bind(this.joinGame, this);
      this.joinServer = __bind(this.joinServer, this);
      this.removePlayer = __bind(this.removePlayer, this);
      this.theGame = new GameServer;
      this.waitingPlayers = [];
      this.io.sockets.on('connection', __bind(function(socket) {
        var player;
        return player = new Player(socket, this.joinServer, this.joinGame);
      }, this));
    }
    WaitingRoomServer.prototype.removePlayer = function(player) {
      this.waitingPlayers.splice(this.waitingPlayers.indexOf(player, 1));
      return console.log("Removed '" + player.name + "' from waiting room. (" + this.waitingPlayers.length + ")");
    };
    WaitingRoomServer.prototype.joinServer = function(player) {
      this.waitingPlayers.push(player);
      return console.log("Added '" + player.name + "' to waiting room. (" + this.waitingPlayers.length + ")");
    };
    WaitingRoomServer.prototype.joinGame = function(player) {
      this.removePlayer(player);
      return this.theGame.addPlayer(player);
    };
    return WaitingRoomServer;
  })();
  GameServer = (function() {
    function GameServer() {
      this.game = new Game;
      this.game.map = {
        xSize: 3,
        ySize: 3,
        tiles: [1, 0, 1, 0, 0, 0, 1, 1, 1]
      };
    }
    GameServer.prototype.addPlayer = function(player) {
      console.log("Adding '" + player.name + "' to game and sending map data.");
      this.game.addPlayer(player);
      console.log("There are " + this.game.players.length + " players in the game.");
      return player.socket.emit('map_data', this.game.map);
    };
    GameServer.prototype.removePlayer = function(player) {
      console.log("Removed '" + player.name + "' from game.");
      return this.game.removePlayer(player);
    };
    return GameServer;
  })();
  Player = (function() {
    function Player(socket, joinServer, joinGame) {
      this.socket = socket;
      this.score = 0;
      this.socket.on('set_name', __bind(function(name) {
        this.name = name;
        this.socket.emit('name_set');
        return joinServer(this);
      }, this));
      this.socket.on('join_game', __bind(function() {
        return joinGame(this);
      }, this));
    }
    return Player;
  })();
  Vector = (function() {
    function Vector(x, y) {
      this.x = x;
      this.y = y;
    }
    Vector.prototype.set = function(x, y) {
      this.x = x;
      return this.y = y;
    };
    Vector.prototype.add = function(other) {
      this.other = other;
      this.x += this.other.x;
      return this.y += this.other.y;
    };
    Vector.prototype.subtract = function(other) {
      this.other = other;
      this.x -= this.other.x;
      return this.y -= this.other.y;
    };
    Vector.prototype.copy = function() {
      return new Vector(this.x, this.y);
    };
    return Vector;
  })();
  Signal = (function() {
    function Signal() {
      this.listeners = [];
    }
    Signal.prototype.add = function(listener) {
      return this.listeners.push(listener);
    };
    Signal.prototype.dispatch = function(argument) {
      var listener, _i, _len, _ref, _results;
      _ref = this.listeners;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        _results.push(listener(argument));
      }
      return _results;
    };
    return Signal;
  })();
  Game = (function() {
    function Game() {
      this.tileSize = 20;
      this.players = [];
      this.xSize = 0;
      this.ySize = 0;
      this.map = [];
      this.mapLoaded = new Signal;
    }
    Game.prototype.loadMap = function(map) {
      this.map = map;
      return this.mapLoaded.dispatch(this.map);
    };
    Game.prototype.addPlayer = function(player) {
      return this.players.push(player);
    };
    Game.prototype.removePlayer = function(player) {
      return this.players.splice(this.players.indexOf(player, 1));
    };
    return Game;
  })();
  GameObjectModel = (function() {
    function GameObjectModel() {
      this.position = new Vector(0, 0);
      this.velocity = new Vector(0, 0);
    }
    GameObjectModel.prototype.update = function() {};
    GameObjectModel.prototype.print = function() {
      return console.log("" + this.position.x + ", " + this.position.y);
    };
    return GameObjectModel;
  })();
}).call(this);
