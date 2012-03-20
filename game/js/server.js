(function() {
  var Game, GameObjectModel, GameServer, Player, Signal, Vector;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  exports.Vector = Vector = (function() {
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
  exports.Signal = Signal = (function() {
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
  exports.createServer = function(io, ip, port) {
    console.log("Creating game server...");
    return new GameServer(io);
  };
  GameServer = (function() {
    function GameServer(io) {
      this.io = io;
      this.removePlayer = __bind(this.removePlayer, this);
      this.newPlayer = __bind(this.newPlayer, this);
      this.theGame = new Game;
      this.waitingPlayers = [];
      this.io.sockets.on('connection', this.newPlayer);
    }
    GameServer.prototype.newPlayer = function(socket) {
      var player;
      player = new Player(socket, this);
      this.waitingPlayers.push(player);
      return console.log("Added player. There are now " + this.waitingPlayers.length + " waiting for a game.");
    };
    GameServer.prototype.removePlayer = function(player) {
      this.waitingPlayers.splice(this.waitingPlayers.indexOf(player, 1));
      return console.log("Removed player. There are now " + this.waitingPlayers.length + " waiting for a game.");
    };
    GameServer.prototype.joinGame = function(player) {
      this.removePlayer(player);
      return this.theGame.addPlayer(player);
    };
    return GameServer;
  })();
  Player = (function() {
    function Player(socket, server) {
      this.socket = socket;
      this.server = server;
      this.joinGame = __bind(this.joinGame, this);
      this.setName = __bind(this.setName, this);
      this.score = 0;
      this.socket.on('set_name', this.setName);
      this.socket.on('join_game', this.joinGame);
    }
    Player.prototype.setName = function(name) {
      this.name = name;
      return this.socket.emit('name_set');
    };
    Player.prototype.joinGame = function() {
      return this.server.joinGame(this);
    };
    return Player;
  })();
  Game = (function() {
    function Game() {
      this.players = [];
      this.map = [];
    }
    Game.prototype.addPlayer = function(player) {
      this.players.push(player);
      player.socket.emit('map_data', {
        map: this.map
      });
      return console.log("" + player.name + " joined game.");
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
