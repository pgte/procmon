/// charts

/// Memory

var memChartData = [
  {
    label: 'Memory',
    values: [{time: time(), y: 0}]
  }
];
var memChart = $('#chart-mem').epoch({
  type: 'time.area',
  data: memChartData,
  axes: ['bottom', 'right']
});


/// CPU

var cpuChartData = [
  {
    label: 'CPU',
    values: [{time: time(), y: 0}]
  }
];
var cpuChart = $('#chart-cpu').epoch({
  type: 'time.area',
  data: cpuChartData,
  axes: ['bottom', 'right']
});

/// Lag

var lagChartData = [
  {
    label: 'Lag',
    values: [{time: time(), y: 0}]
  }
];
var lagChart = $('#chart-lag').epoch({
  type: 'time.area',
  data: lagChartData,
  axes: ['bottom', 'right']
});


/// Websocket

var websocket = require('./websocket');
var url = 'ws://' + window.location.hostname + ':' + window.location.port + '/websocket';
var c = websocket.connect(url, onConnect);

var $alert = $('#alert');

c.on('disconnect', function() {
  $alert.text('Disconnected');
});
c.on('reconnect', function() {
  $alert.text('Reconnecting...');
});
c.on('connect', function() {
  $alert.text('Connected');
});


var ee, pid;
var bound = false;

function onConnect(ws) {
  console.log('connected');
  ee = require('duplex-emitter')(ws);

  ee.on('file added', onFileAdded);
  ee.on('file removed', onFileRemoved);

  if (bound) bind();
  clearFiles();
}


/// Start

var $form = $('form#control');
$form.find('.start').click(function(ev) {
  ev.preventDefault();
  var _pid = $form.find('#pid').val();
  if (_pid && ee) {
    pid = _pid;
    // memChart.update([]);
    // cpuChart.update([]);

    bind();
  }
});


// bind

function onSample(sample) {
  console.log('sample:', sample);
  if (sample.memory) memChart.push([{time: sample.time, y: sample.memory}]);
  if (sample.cpu) cpuChart.push([{time: sample.time, y: sample.cpu}]);
  if (sample.lag) lagChart.push([{time: sample.time, y: sample.lag}]);
}

function onWarning(warning) {
  console.error(warning.message || warning);
  $alert.text(warning.message || warning);
}

function bind() {
  console.log('bind');
  bound = true;

  ee.on('sample', onSample);
  ee.on('warning', onWarning);

  if (pid) ee.emit('start', pid);
}

function unbind() {
  if (ee) {
    bound = false;
    pid = undefined;
    ee.removeListener('sample', onSample);
    ee.removeListener('warning', onWarning);
  }
}


/// Stop

$form.find('.stop').click(function(ev) {
  ev.preventDefault();
  if (ee) ee.emit('stop');
  unbind();
});


/// Clear

$form.find('.clear').click(function(ev) {
  ev.preventDefault();
  memChart.update(memChartData);
  cpuChart.update(cpuChartData);
  lagChart.update(lagChartData);
});

/// time

function time() {
  return (new Date()).getTime() / 1000;
}


/// Files

var $files = $('#files');
var list = {};


function clearFiles() {
  list = {};
  $files.empty();
}

function onFileAdded(f) {
  console.log('file added:', f);
  if (! f) return;
  if (list[f]) return;
  console.log('file added (2):', f);
  var elem = $('<li><a target="_blank" href="/out/' + encodeURIComponent(f) + '">' + f + '</a></li>');
  list[f] = elem;
  $files.prepend(elem);
}

function onFileRemoved(f) {
  if (! f) return;
  console.log('file removed:', f);
  var elem = list[f];
  if (elem) elem.remove();
  delete list[f];
}