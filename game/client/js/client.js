(function() {
  var Game, GameClient, GameController, GameObject, GameView, Signal, Tank, Vector, connectionURL;
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
      this.receiveWaypoint = __bind(this.receiveWaypoint, this);
      this.sendWaypoint = __bind(this.sendWaypoint, this);
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
      this.controller = new GameController(this);
      this.socket.emit('join_game');
      this.socket.on('map_data', __bind(function(map) {
        console.log("Received map data.");
        return this.game.loadMap(map);
      }, this));
      this.socket.on('tank_data', __bind(function(tanks) {
        console.log("Received tank data.");
        return this.game.loadTanks(tanks);
      }, this));
      this.socket.on('add_tank', __bind(function(data) {
        return this.game.addTank(new Tank(data));
      }, this));
      return this.socket.on('new_waypoint', this.receiveWaypoint);
    };
    GameClient.prototype.sendWaypoint = function(x, y) {
      console.log("Sending waypoint " + x + " " + y);
      return this.socket.emit('new_waypoint', {
        x: x,
        y: y
      });
    };
    GameClient.prototype.receiveWaypoint = function(data) {
      var tank;
      console.log("Received waypoint for " + data.name);
      tank = this.game.findTankByName(data.name);
      return tank.addWaypoint(data.waypoint);
    };
    return GameClient;
  })();
  GameController = (function() {
    function GameController(client) {
      this.client = client;
      this.onClick = __bind(this.onClick, this);
      this.onTick = __bind(this.onTick, this);
      $(this.client.canvas).click(this.onClick);
      setInterval(this.onTick, 1000 / 60);
    }
    GameController.prototype.onTick = function(event) {
      return this.client.game.tick();
    };
    GameController.prototype.onClick = function(e) {
      var x, y;
      x = 0;
      y = 0;
      if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
      } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      x -= this.client.canvas[0].offsetLeft;
      y -= this.client.canvas[0].offsetTop;
      return this.client.sendWaypoint(x, y);
    };
    return GameController;
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
      this.game.gameUpdated.add(this.render);
      this.loadImages(['dirt.png', 'grass.png', 'metal_barricade.png', 'rubber.png', 'water.png', 'wood_barricade.png', 'wood_crate.png', 'wood_tile.png']);
    }
    GameView.prototype.render = function() {
      $(this.canvas).attr('width', $(this.canvas).attr('width'));
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
            _results2.push(this.ctx.drawImage(this.images[tileType], x, y, this.game.tileSize, this.game.tileSize));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };
    GameView.prototype.loadImages = function(images) {
      var img, path, _i, _len, _results;
      this.images = [];
      _results = [];
      for (_i = 0, _len = images.length; _i < _len; _i++) {
        path = images[_i];
        img = new Image;
        img.src = "images/" + path;
        _results.push(this.images.push(img));
      }
      return _results;
    };
    GameView.prototype.drawTanks = function(tanks) {
      var tank, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tanks.length; _i < _len; _i++) {
        tank = tanks[_i];
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.fillRect(tank.position.x, tank.position.y, 15, 15);
        this.ctx.font = "11pt Arial";
        this.ctx.fillText(tank.name, tank.position.x, tank.position.y + 30);
        this.ctx.fillStyle = "#000000";
        _results.push(this.ctx.strokeRect(tank.position.x, tank.position.y, 15, 15));
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
      this.tick = __bind(this.tick, this);
      this.findTankByName = __bind(this.findTankByName, this);
      this.createTank = __bind(this.createTank, this);
      this.mapHeight = __bind(this.mapHeight, this);
      this.mapWidth = __bind(this.mapWidth, this);      this.tileSize = 30;
      this.tanks = [];
      this.map = {};
      this.mapLoaded = new Signal;
      this.tanksLoaded = new Signal;
      this.gameUpdated = new Signal;
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
        this.addTank(tankData);
      }
      return this.tanksLoaded.dispatch(this.tanks);
    };
    Game.prototype.addTank = function(tankData) {
      this.tanks.push(new Tank(tankData));
      return this.tanksLoaded.dispatch(this.tanks);
    };
    Game.prototype.createTank = function(name) {
      var tank;
      tank = new Tank;
      tank.name = name;
      tank.position.set(Math.random() * this.mapWidth(), Math.random() * this.mapHeight());
      this.tanks.push(tank);
      return tank;
    };
    Game.prototype.findTankByName = function(name) {
      var t, tank;
      tank = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.tanks;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          t = _ref[_i];
          if (t.name === name) {
            _results.push(t);
          }
        }
        return _results;
      }).call(this))[0];
      return tank;
    };
    Game.prototype.tick = function() {
      var tank, _i, _len, _ref;
      _ref = this.tanks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tank = _ref[_i];
        tank.update();
      }
      return this.gameUpdated.dispatch();
    };
    return Game;
  })();
  GameObject = (function() {
    function GameObject(data) {
      if (data) {
        this.position = new Vector(data.position.x, data.position.y);
        this.velocity = new Vector(data.velocity.y, data.velocity.y);
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
      this.addWaypoint = __bind(this.addWaypoint, this);
      this.seekNextWaypoint = __bind(this.seekNextWaypoint, this);
      this.update = __bind(this.update, this);      if (data) {
        this.name = data.name;
      }
      this.waypoints = [];
      this.speed = 2;
      Tank.__super__.constructor.call(this, data);
    }
    Tank.prototype.update = function() {
      var dist, dx, dy;
      if (this.currentWaypoint) {
        dx = this.position.x - this.currentWaypoint.x;
        dy = this.position.y - this.currentWaypoint.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) {
          this.velocity.x = 0;
          this.velocity.y = 0;
          this.currentWaypoint = null;
          if (this.waypoints.length > 0) {
            this.seekNextWaypoint();
          }
        }
      }
      return Tank.__super__.update.call(this);
    };
    Tank.prototype.seekNextWaypoint = function() {
      var angle, dx, dy;
      this.currentWaypoint = this.waypoints.shift();
      dx = this.currentWaypoint.x - this.position.x;
      dy = this.currentWaypoint.y - this.position.y;
      angle = Math.atan2(dy, dx);
      this.velocity.x = Math.cos(angle) * this.speed;
      return this.velocity.y = Math.sin(angle) * this.speed;
    };
    Tank.prototype.addWaypoint = function(p) {
      this.waypoints.push(p);
      if (!this.currentWaypoint) {
        return this.seekNextWaypoint();
      }
    };
    return Tank;
  })();
}).call(this);
