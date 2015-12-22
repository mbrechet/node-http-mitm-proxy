var recluster = require('recluster'),
    path = require('path');

// create cluster program base on cpus core
console.info("path: ",path.join(__dirname, 'proxyRequest.js'));
var cluster = recluster(path.join(__dirname, 'proxyRequest.js'));
cluster.run();