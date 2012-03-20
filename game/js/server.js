(function() {
  var Game, GameObject, GameServer, Player, Signal, Tank, Vector, WaitingRoomServer;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
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
      this.players = [];
      this.game.map = {
        xSize: 10,
        ySize: 10,
        tiles: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      };
    }
    GameServer.prototype.addPlayer = function(player) {
      var tank;
      tank = this.game.createTank(player.name);
      player.setTank(tank);
      console.log("Adding '" + player.name + "' to game and sending map data.");
      this.players.push(player);
      console.log("There are " + this.players.length + " players in the game.");
      player.socket.emit('map_data', this.game.map);
      return player.socket.emit('tank_data', this.game.tanks);
    };
    GameServer.prototype.removePlayer = function(player) {
      console.log("Removed '" + player.name + "' from server.");
      return this.players.splice(this.players.indexOf(player, 1));
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
    Player.prototype.setTank = function(tank) {
      this.tank = tank;
    };
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
      this.createTank = __bind(this.createTank, this);
      this.mapHeight = __bind(this.mapHeight, this);
      this.mapWidth = __bind(this.mapWidth, this);      this.tileSize = 40;
      this.tanks = [];
      this.map = {};
      this.mapLoaded = new Signal;
      this.tanksLoaded = new Signal;
    }
    Game.prototype.mapWidth = function() {
      return this.map.xSize * this.tileSize;
    };
    Game.prototype.mapHeight = function() {
      return this.map.ySize * this.tileSize;
    };
    Game.prototype.loadMap = function(map) {
      this.map = map;
      return this.mapLoaded.dispatch(this.map);
    };
    Game.prototype.loadTanks = function(tanks) {
      var tankData, _i, _len;
      this.tanks = [];
      for (_i = 0, _len = tanks.length; _i < _len; _i++) {
        tankData = tanks[_i];
        this.tanks.push(new Tank(tankData));
      }
      return this.tanksLoaded.dispatch(this.tanks);
    };
    Game.prototype.addTank = function(tank) {
      return this.tanks.push(tank);
    };
    Game.prototype.createTank = function(name) {
      var tank;
      tank = new Tank;
      tank.name = name;
      tank.position.set(Math.random() * this.mapWidth(), Math.random() * this.mapHeight());
      this.tanks.push(tank);
      return tank;
    };
    return Game;
  })();
  GameObject = (function() {
    function GameObject(data) {
      if (data) {
        this.position = data.position;
        this.velocity = data.velocity;
      } else {
        this.position = new Vector(0, 0);
        this.velocity = new Vector(0, 0);
      }
    }
    GameObject.prototype.update = function() {
      return this.position.add(this.velocity);
    };
    GameObject.prototype.print = function() {
      return console.log("" + this.position.x + ", " + this.position.y);
    };
    return GameObject;
  })();
  Tank = (function() {
    __extends(Tank, GameObject);
    function Tank(data) {
      if (data) {
        this.name = data.name;
      }
      Tank.__super__.constructor.call(this, data);
    }
    return Tank;
  })();
}).call(this);
