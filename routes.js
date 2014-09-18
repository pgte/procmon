var restify = require('restify');
var path = require('path');

module.exports = createRoutes;

function createRoutes(options) {
  var routes = [];

  routes.push({
    method: 'GET',
    path: '/websocket',
    handler: function() {}
  });

  routes.push({
    method: 'GET',
    path: '.*',
    handler: restify.serveStatic({
      directory: path.join(__dirname, 'public'),
      default: 'index.html'
    })
  });

  if (options.public) {
    var publicDir = path.normalize(path.join(process.cwd(), options.public));
    console.log('serving public ', publicDir);
    routes.push({
      method: 'GET',
      path: /\/out\/.*/,
      handler: restify.serveStatic({
        directory: publicDir
      })
    });
  }


  return routes;
}