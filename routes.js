var restify = require('restify');
var join = require('path').join;
var websocket = require('./websocket');

module.exports = [
  {
    method: 'GET',
    path: '/websocket',
    handler: websocket.noop
  },
  {
    method: 'GET',
    path: /\/out\/.*/,
    handler: restify.serveStatic({
      directory: join(__dirname, '..')
    })
  },
  {
    method: 'GET',
    path: '.*',
    handler: restify.serveStatic({
      directory: join(__dirname, 'public'),
      default: 'index.html'
    })
  }
];