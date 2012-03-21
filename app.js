var PRODUCTION_IP = '173.255.245.211';
var PORT = 3000;


/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var sio = require('socket.io');
var tg = require('./game/server/server.js');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/game/client'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('ip', 'localhost');
  app.set('port', PORT);
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('ip', PRODUCTION_IP);
  app.set('port', '3000');
});

// Routes

app.get('/', function(req, res) {
  res.render('index', { title: 'Express', ip: app.set('ip'), port: app.set('port') })
});

app.listen(app.set('port'));

// Set up game server
io = sio.listen(app);
game = tg.createServer(io, app.set('ip'), app.set('port'));