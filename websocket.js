var net = require('net');
var path = require('path');
var usage = require('usage');
var watch = require('./file_watch');
var JSONStream = require('json-duplex-stream');
var DuplexEmitter = require('duplex-emitter');
var websocketStream = require('websocket-stream');

var monitorPath = path.normalize(path.join(__dirname, '..', 'out'));

module.exports = websocket;

var pollInterval = 3e3;

function websocket(ws) {
  var s = websocketStream(ws);
  var e = DuplexEmitter(s);

  var pid;
  var interval;
  var lagConn;

  e.on('start', onStart);
  e.on('stop', onStop);
  s.on('error', onError);
  s.once('close', onStop);

  /// file watch
  var w = watch(monitorPath, e);
  ws.once('close', function() {
    console.log('closing');
    w.stop();
  });

  function onStart(_pid) {
    pid = Number(_pid);
    if (! interval) {
      interval = setInterval(poll, pollInterval);

      lagConn = net.connect('/tmp/busy-' + pid + '.sock');
      lagConn.on('error', function(err) {
        e.emit('warning', err.message);
      });

      lagConn.once('close', function() {
        lagConn = undefined;
      });

      var json = JSONStream().in;
      json.on('error', function() {
        s.destroy();
      });
      lagConn.pipe(json).on('data', onLagData);

    }
  }

  function onLagData(d) {
    d.time = Math.floor(d.time / 1e3);
    e.emit('sample', d);
  }

  function onStop() {
    pid = undefined;
    if (interval) {
      clearInterval(interval);
      interval = undefined;
    }
    if (lagConn) lagConn.destroy();
  }

  function poll() {
    usage.lookup(pid, polled);
  }

  function polled(err, result) {
    if (err) {
      var emitting = err.stack || err.message || err;
      e.emit('warning', emitting);
    }
    else {
      var sample = {
        time: time(),
        cpu: result.cpu,
        memory: result.memory
      };
      e.emit('sample', sample);
    }
  }

  function onError(err) {
    s.destroy();
  }


};

websocket.noop = function next() { };

function time() {
  return Math.floor(Date.now() / 1000);
}
