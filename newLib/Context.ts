import * as http from "http";
import * as request from "request";

export default class Context {
    public requester:any=null;
    public serverResponse:http.ServerResponse = null;
    public serverRequest:Object = null;
    public clientResponse:any = null;
    public onRequestHandlers:Array<any> = null;
    public onResponseHandlers:Array<any> = null;
    public onErrorHandlers:Array<any> = null;
    public serverRequestOptions:Object = null;
    public cancelServerRequest:boolean = false;
    private bodyRequest:any;
    
    private _clientRequest:http.ClientRequest = null;
  
    constructor(){
        this.requester = request.defaults({jar:true,pool:{maxSockets:Infinity}});
    }
    
    onRequestData(data:any):void{
        console.info("onrequest data", data);
        this.bodyRequest+=data;
    }
    
    set clientRequest(req:http.ClientRequest){
        this._clientRequest = req;
        this._clientRequest.on('data',(data:any)=>this.onRequestData(data));
        this._clientRequest.once('end', ()=>this.doRequest());
    }
    
    get clientRequest():http.ClientRequest{
        return this._clientRequest;
    }
    doRequest():void{
        if(this.clientRequest){
            // pause curent clientRequest waiting for request to be executed
            this.clientRequest.pause();
            // create serverRequest
            this.serverRequestOptions ={};
            this.serverRequestOptions.method = this.clientRequest.method;
            this.serverRequestOptions.url = this.clientRequest.url;
            this.serverRequestOptions.headers = this.clientRequest.headers;
            if(this.bodyRequest){
                console.info("bodyRequest", this.bodyRequest);
                this.serverRequestOptions.body = this.bodyRequest;
            }
            
            // appy before request rules
            this.onBeforeRequest();
            if(!this.cancelServerRequest){
                this.serverRequest = this.requester(this.serverRequestOptions);
                this.serverRequest.once('response', (response:http.ServerResponse) => this.onServerResponse(response));
                this.serverRequest.on('error', (err:Error) => this.onError(err));
            }
            this.clientRequest.resume();
            // make server request
            //this.serverRequest.on("response", ())
        }else{
            console.error("impossible to create request")
        }
    }
    
    onBeforeRequest():void{
        if(this.onRequestHandlers){
            for (var index = 0; index < this.onRequestHandlers.length; index++) {
                var element = this.onRequestHandlers[index];
                element(this);
            }
        }
    }
    
    onBeforeResponse():void{
        if(this.onResponseHandlers){
            for (var index = 0; index < this.onResponseHandlers.length; index++) {
                var element = this.onResponseHandlers[index];
                element(this);
            }
        }
    }
    
    onServerResponse(response:http.ServerResponse){
        this.serverResponse = response;
        
        this.onBeforeResponse();
        this.clientResponse.writeHead(this.serverResponse.statusCode, this.serverResponse.headers)
        this.serverResponse.pipe(this.clientResponse);
    }
    
    onError(err:Error):void{
         if(this.onErrorHandlers){
            for (var index = 0; index < this.onErrorHandlers.length; index++) {
                var element = this.onErrorHandlers[index];
                element(this, err);
            }
        }
    }
}