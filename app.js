
/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('ip', 'localhost');
  app.set('port', '3000');
});

app.configure('production', function(){
  app.use(express.errorHandler());
  app.set('ip', '173.255.245.211');
  app.set('port', '80');
});

// Routes

app.get('/', function(req, res) {
  res.render('index', { title: 'Express', ip: app.set('ip') })
});

app.listen(app.set('port'));
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
