/// server
var restify = require('restify');
var server = restify.createServer();

/// websockets
var WebSocketServer = require('ws').Server;
var wsServer = new WebSocketServer({
  server: server,
  path: '/websocket'
});
var websocket = require('./websocket');
wsServer.on('connection', websocket);

/// routes
var routes = require('./routes');

routes.forEach(function(route) {
  server[route.method.toLowerCase()]({
    path: route.path
  }, route.handler);
});

module.exports = server;