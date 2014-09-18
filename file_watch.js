var watch = require('watch');
var file = require('file');
var fs = require('fs');
var path = require('path');

module.exports = fileWatch;

function fileWatch(monitorPath, remote) {
  var monitor;
  // start watch
  file.walk(monitorPath, onFileWalk);

  watch.createMonitor(monitorPath, function(_monitor) {
    monitor = _monitor;
    monitor.on('created', function(f, stat) {
      f = resolvePath(f);
      console.log('file added:', f);
      if (validFile(f) && ! stat.isDirectory()) {
        remote.emit('file added', f);
      }
    });

    monitor.on('removed', function(f) {
      f = resolvePath(f);
      if (validFile(f)) remote.emit('file removed', f);
    });

  });

  return {
    stop: stop
  };

  function onFileWalk(err, dirPath, dirs, files) {
    if (err) return remote.emit('warning', err.message);
    if (files) files.forEach(emitFile);

  }

  function emitFile(f) {
    remote.emit('file added', resolvePath(f));
  }

  function resolvePath(p) {
    var r = path.relative(monitorPath, p)
    return r;
  }

  function stop() {
    if (monitor) monitor.stop();
  }
}


function validFile(f) {
  return f[0] != '.';
}
