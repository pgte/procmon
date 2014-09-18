var Websocket = require('websocket-stream')

var inject = require('reconnect-core');
var reconnect = inject(function() {
  return Websocket.apply(null, arguments);
});

var r;

exports.connect = function connect(address, handler) {
  r = reconnect({}, handler).connect(address);
  return r;
}

exports.disconnect = function() {
  if (r) r.disconnect();
}