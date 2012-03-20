(function() {
  var GameClient, GameView, connectionURL;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  connectionURL = "http://" + TankGame.IP + ":" + TankGame.PORT;
  GameClient = (function() {
    function GameClient() {
      this.loadMap = __bind(this.loadMap, this);      console.log("Game client created.");
    }
    GameClient.prototype.connect = function(name) {
      this.name = name;
      console.log("Connecting to server with name '" + this.name + "'.");
      this.socket = io.connect(connectionURL);
      console.log("Attempting handshake with server.");
      this.socket.on('connect', __bind(function() {
        console.log("Sending name.");
        this.socket.emit('set_name', this.name);
        return this.socket.on('name_set', __bind(function() {
          console.log("Joining game.");
          return this.socket.emit('join_game');
        }, this));
      }, this));
      this.socket.on('disconnect', __bind(function() {
        console.log("Disconnecting from server.");
        return this.disconnect;
      }, this));
      return this.socket.on('map_data', __bind(function(data) {
        return this.loadMap(data);
      }, this));
    };
    GameClient.prototype.disconnect = function() {
      console.log("Disconnecting client.");
      return this.socket.disconnect();
    };
    GameClient.prototype.loadMap = function(map) {
      console.log("Loading map");
      return console.log(map);
    };
    return GameClient;
  })();
  GameView = (function() {
    function GameView(canvas) {
      this.canvas = canvas;
      $(this.canvas).width(800);
      $(this.canvas).height(800);
      this.ctx = this.canvas[0].getContext("2d");
      this.ctx.fillStyle = "rgb(200,0,0)";
      this.ctx.fillRect(10, 10, 55, 50);
    }
    return GameView;
  })();
  $(document).ready(function() {
    var client, view;
    client = new GameClient;
    view = new GameView($("#game_canvas"));
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
}).call(this);
