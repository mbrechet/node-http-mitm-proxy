"use strict";
const http = require("http");
const Util_1 = require("./Util");
const ProxyConfig_1 = require("./ProxyConfig");
const Context_1 = require("./Context");
/**
 * Proxy
 */
class Proxy {
    constructor(config) {
        if (config) {
            this.proxyConfig = config;
        }
        else {
            this.proxyConfig = new ProxyConfig_1.default();
        }
        this.onBeforeRequestHandlers = [];
        this.onBeforeResponseHandlers = [];
        this.onErrorHandlers = [];
    }
    /**
     * Private functions
     */
    _onError(err) {
        console.error(err);
    }
    _onHttpConnect(req, socket, head) {
        // we need first byte of data to detect if request is SSL encrypted
        if (!head || head.length === 0) {
            socket.once('data', (data) => {
                socket.pause();
                this._onHttpConnect(req, socket, data);
            });
            // respond to the client that the connection was made so it can send us data
            return socket.write("HTTP/1.1 200 OK\r\n\r\n");
        }
        else {
            socket.pause();
        }
        var isSSL = Util_1.default.checkSSL(head);
        if (isSSL) {
            socket.resume();
            this._onError("SSL not implemented yet. please change your proxy settings to not target ssl streams");
            return false;
        }
        // only https requests are suppose to pass threw connect method
    }
    ;
    _onHttpRequest(request, response) {
        const context = new Context_1.default();
        context.onErrorHandlers = this.onErrorHandlers;
        context.onRequestHandlers = this.onBeforeRequestHandlers;
        context.onResponseHandlers = this.onBeforeResponseHandlers;
        context.clientRequest = request;
        context.clientResponse = response;
    }
    listen() {
        if (!this.proxyConfig.httpServer) {
            this.proxyConfig.httpServer = http.createServer();
        }
        if (!this.proxyConfig.port) {
            this.proxyConfig.port = 8080;
        }
        this.proxyConfig.httpServer.on('error', () => this._onError);
        //   this.httpServer.on('connect',(req:any, socket:net.Socket, head:any) => this._onHttpConnect(req, socket, head));
        this.proxyConfig.httpServer.on('connect', (req, socket, head) => this._onHttpConnect(req, socket, head));
        this.proxyConfig.httpServer.on('request', (request, response) => this._onHttpRequest(request, response));
        this.proxyConfig.httpServer.listen(this.proxyConfig.port);
        console.log("server started on port", this.proxyConfig.port);
    }
    onRequest(handler) {
        this.onBeforeRequestHandlers.push(handler);
    }
    onResponse(handler) {
        this.onBeforeResponseHandlers.push(handler);
    }
    onError(handler) {
        this.onErrorHandlers.push(handler);
    }
}
module.exports = Proxy;
