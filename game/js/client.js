(function() {
  var Game, GameClient, GameObject, GameView, Signal, Tank, Vector, connectionURL;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  connectionURL = "http://" + TankGame.IP + ":" + TankGame.PORT;
  GameClient = (function() {
    function GameClient(canvas) {
      this.canvas = canvas;
      this.joinGame = __bind(this.joinGame, this);
      console.log("Game client created.");
    }
    GameClient.prototype.connect = function(name) {
      this.name = name;
      console.log("Connecting to server with name '" + this.name + "'.");
      this.socket = io.connect(connectionURL);
      console.log("Attempting handshake with server.");
      this.socket.on('connect', __bind(function() {
        console.log("Sending name.");
        this.socket.emit('set_name', this.name);
        return this.socket.on('name_set', this.joinGame);
      }, this));
      return this.socket.on('disconnect', __bind(function() {
        console.log("Disconnecting from server.");
        return this.disconnect();
      }, this));
    };
    GameClient.prototype.disconnect = function() {
      console.log("Disconnecting client.");
      return this.socket.disconnect();
    };
    GameClient.prototype.joinGame = function() {
      console.log("Joining game.");
      this.game = new Game;
      this.view = new GameView(this.canvas, this.game);
      this.socket.emit('join_game');
      this.socket.on('map_data', __bind(function(map) {
        console.log("Received map data.");
        return this.game.loadMap(map);
      }, this));
      return this.socket.on('tank_data', __bind(function(tanks) {
        console.log("Received tank data.");
        return this.game.loadTanks(tanks);
      }, this));
    };
    return GameClient;
  })();
  GameView = (function() {
    function GameView(canvas, game) {
      this.canvas = canvas;
      this.game = game;
      this.drawTanks = __bind(this.drawTanks, this);
      this.drawMap = __bind(this.drawMap, this);
      this.render = __bind(this.render, this);
      this.ctx = this.canvas[0].getContext("2d");
      this.game.mapLoaded.add(this.render);
      this.game.tanksLoaded.add(this.render);
    }
    GameView.prototype.render = function() {
      this.drawMap(this.game.map);
      return this.drawTanks(this.game.tanks);
    };
    GameView.prototype.drawMap = function(map) {
      var i, j, tileType, x, y, _ref, _results;
      $(this.canvas).attr('width', this.game.tileSize * map.xSize + "px");
      $(this.canvas).attr('height', this.game.tileSize * map.ySize + "px");
      _results = [];
      for (i = 0, _ref = map.ySize - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (j = 0, _ref2 = map.xSize - 1; 0 <= _ref2 ? j <= _ref2 : j >= _ref2; 0 <= _ref2 ? j++ : j--) {
            y = this.game.tileSize * i;
            x = this.game.tileSize * j;
            tileType = map.tiles[i * map.xSize + j];
            _results2.push(tileType === 1 ? (this.ctx.fillStyle = "#000000", this.ctx.fillRect(x, y, this.game.tileSize, this.game.tileSize)) : void 0);
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    GameView.prototype.drawTanks = function(tanks) {
      var tank, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tanks.length; _i < _len; _i++) {
        tank = tanks[_i];
        this.ctx.fillStyle = "#FF0000";
        this.ctx.fillRect(tank.position.x, tank.position.y, 15, 15);
        _results.push(this.ctx.fillText(tank.name, tank.position.x, tank.position.y + 25));
      }
      return _results;
    };
    return GameView;
  })();
  $(document).ready(function() {
    var client;
    client = new GameClient($("#game_canvas"));
    return $("#connect").click(function() {
      if ($("#connect").text() === 'Connect') {
        client.connect($("#username").val());
        return $("#connect").text('Disconnect');
      } else {
        client.disconnect();
        return location.reload();
      }
    });
  });
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
