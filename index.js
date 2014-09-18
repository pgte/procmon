var server = require('./server');

server.listen(8887, function() {
  console.log('procmon server PID (%s) listening on port %j', process.pid, server.address());
});