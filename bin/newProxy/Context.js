"use strict";
const request = require("request");
class Context {
    constructor() {
        this.requester = null;
        this.serverResponse = null;
        this.serverRequest = null;
        this.clientResponse = null;
        this.onRequestHandlers = null;
        this.onResponseHandlers = null;
        this.onErrorHandlers = null;
        this.serverRequestOptions = null;
        this.cancelServerRequest = false;
        this._clientRequest = null;
        this.requester = request.defaults({ jar: true, pool: { maxSockets: Infinity } });
    }
    onRequestData(data) {
        console.info("onrequest data", data);
        this.bodyRequest += data;
    }
    set clientRequest(req) {
        this._clientRequest = req;
        this._clientRequest.on('data', (data) => this.onRequestData(data));
        this._clientRequest.once('end', () => this.doRequest());
    }
    get clientRequest() {
        return this._clientRequest;
    }
    doRequest() {
        if (this.clientRequest) {
            // pause curent clientRequest waiting for request to be executed
            this.clientRequest.pause();
            // create serverRequest
            this.serverRequestOptions = {};
            this.serverRequestOptions.method = this.clientRequest.method;
            this.serverRequestOptions.url = this.clientRequest.url;
            this.serverRequestOptions.headers = this.clientRequest.headers;
            if (this.bodyRequest) {
                console.info("bodyRequest", this.bodyRequest);
                this.serverRequestOptions.body = this.bodyRequest;
            }
            // appy before request rules
            this.onBeforeRequest();
            if (!this.cancelServerRequest) {
                this.serverRequest = this.requester(this.serverRequestOptions);
                this.serverRequest.once('response', (response) => this.onServerResponse(response));
                this.serverRequest.on('error', (err) => this.onError(err));
            }
            this.clientRequest.resume();
        }
        else {
            console.error("impossible to create request");
        }
    }
    onBeforeRequest() {
        if (this.onRequestHandlers) {
            for (var index = 0; index < this.onRequestHandlers.length; index++) {
                var element = this.onRequestHandlers[index];
                element(this);
            }
        }
    }
    onBeforeResponse() {
        if (this.onResponseHandlers) {
            for (var index = 0; index < this.onResponseHandlers.length; index++) {
                var element = this.onResponseHandlers[index];
                element(this);
            }
        }
    }
    onServerResponse(response) {
        this.serverResponse = response;
        this.onBeforeResponse();
        this.clientResponse.writeHead(this.serverResponse.statusCode, this.serverResponse.headers);
        this.serverResponse.pipe(this.clientResponse);
    }
    onError(err) {
        if (this.onErrorHandlers) {
            for (var index = 0; index < this.onErrorHandlers.length; index++) {
                var element = this.onErrorHandlers[index];
                element(this, err);
            }
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Context;
