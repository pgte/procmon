#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var publicPath = argv.public;

var server = require('./server')(argv);

server.listen(8887, function() {
  console.log(
    'Procmon server PID (%s) listening on:\n%j',
    process.pid, server.address());
});