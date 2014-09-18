var restify = require('restify');
var join = require('path').join;

module.exports = [
  {
    method: 'GET',
    path: '/websocket',
    handler: function() {}
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