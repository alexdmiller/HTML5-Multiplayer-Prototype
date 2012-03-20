(function() {
  var Game, GameClient, GameObjectModel, GameView, Signal, Vector, connectionURL;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
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
      return this.socket.on('map_data', __bind(function(map) {
        console.log("Loading map.");
        return this.game.loadMap(map);
      }, this));
    };
    return GameClient;
  })();
  GameView = (function() {
    function GameView(canvas, game) {
      this.canvas = canvas;
      this.game = game;
      this.drawMap = __bind(this.drawMap, this);
      this.ctx = this.canvas[0].getContext("2d");
      this.game.mapLoaded.add(this.drawMap);
    }
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
            _results2.push(tileType === 1 ? (this.ctx.fillStyle = "0x000000", console.log(x, y, this.game.tileSize, this.game.tileSize), this.ctx.fillRect(x, y, this.game.tileSize, this.game.tileSize)) : void 0);
          }
          return _results2;
        }).call(this));
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
