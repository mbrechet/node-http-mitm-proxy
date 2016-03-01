var HttpProxy = require("../");
var p = new HttpProxy({
    port:3129
});
p.listen();

p.onResponse(function(ctx){
    if(ctx.clientRequest.headers && ctx.clientRequest.headers.origin){
        var headers = generateCorsHeaders(ctx.clientRequest.headers.origin, ctx.clientRequest.headers['access-control-request-headers']);
        if(ctx.serverResponse){
            if(ctx.serverResponse.headers){
                headers = Object.assign(ctx.serverResponse.headers, headers);
            }else{
                ctx.serverResponse.headers= headers;
            }
            
        }
    }
})

var generateCorsHeaders = function(origin, accessControlHeaders){
    var headers  = {};
    if(origin){
        headers = {
                        'access-control-allow-methods' : 'POST, GET, OPTIONS',
                        'access-control-allow-credentials' : true,
                       };
        headers['access-control-allow-origin'] = origin;
        if(accessControlHeaders){
            headers['access-control-allow-headers'] = accessControlHeaders;
        }
    }

    return headers;
}