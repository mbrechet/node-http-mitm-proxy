'use strict';

var port = 3129;

var Proxy = require('../');
var proxy = Proxy();

proxy.onError(function(ctx, err, errorKind) {
  // ctx may be null
  var url = (ctx && ctx.clientToProxyRequest) ? ctx.clientToProxyRequest.url : "";
  console.error(errorKind + ' on ' + url + ':', err);
});

proxy.onRequest(function(ctx, callback) {
  //console.log('REQUEST: http://' + ctx.clientToProxyRequest.headers.host + ctx.clientToProxyRequest.url);
  //console.info(ctx.proxyToServerRequestOptions)
  ctx.proxyToServerRequestOptions.proxy = "http://proxy:8080";
  ctx.proxyToServerRequestOptions.timeout = 120000;
  ctx.proxyToServerRequestOptions.rejectUnauthorized = false;
  return callback();
});

// proxy.onRequestData(function(ctx, chunk, callback) {
//   //console.log('request data length: ' + chunk.length);
//   return callback(null, chunk);
// });

proxy.onResponseEnd(function(ctx, callback) {
  if(ctx.clientToProxyRequest.headers.host && ctx.clientToProxyRequest.headers.host.indexOf('google') !== -1){
    console.log('RESPONSE: ', ctx.proxyToClientResponse._header);
  }
  return callback();
});

// proxy.onResponseData(function(ctx, chunk, callback) {
//   //console.log('response data length: ' + chunk.length);
//   return callback(null, chunk);
// });

proxy.listen({ port: port });
console.log('listening on ' + port);
