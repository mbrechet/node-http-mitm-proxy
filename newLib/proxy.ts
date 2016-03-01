import * as net from "net";
import * as http from "http";
import utilProxy from "./Util";
import ProxyConfig from "./ProxyConfig";
import Context from "./Context";


/**
 * Proxy
 */
class Proxy {
    onBeforeRequestHandlers:Array<any>;
    onBeforeResponseHandlers:Array<any>;
    onErrorHandlers:Array<any>;
    proxyConfig:ProxyConfig;
    
    /**
     * Private functions
     */
    private _onError(err:string):void{
        console.error(err);
    }
    
    private _onHttpConnect(req:any, socket:net.Socket, head:any):boolean{
        // we need first byte of data to detect if request is SSL encrypted
        if(!head || head.length === 0){
            socket.once('data', (data)=>{
                socket.pause();
                this._onHttpConnect(req,socket,data);
            });
            // respond to the client that the connection was made so it can send us data
            return socket.write("HTTP/1.1 200 OK\r\n\r\n");
        }else{
            socket.pause();
        }
        
        var isSSL:boolean = utilProxy.checkSSL(head);
        if(isSSL){
            socket.resume();
            this._onError("SSL not implemented yet. please change your proxy settings to not target ssl streams");
            return false;
        }
        // only https requests are suppose to pass threw connect method
        
        
    };
    
    private _onHttpRequest(request:http.ClientRequest, response:http.ServerResponse):void{
        const context:Context = new Context();
        context.onErrorHandlers = this.onErrorHandlers;
        context.onRequestHandlers = this.onBeforeRequestHandlers;
        context.onResponseHandlers = this.onBeforeResponseHandlers;
        context.clientRequest = request;
        context.clientResponse = response;
        
        
    }
   
    constructor(config:ProxyConfig){
        if(config){
            this.proxyConfig = config
        }else{
            this.proxyConfig = new ProxyConfig();
        }
        
        this.onBeforeRequestHandlers = [];
        this.onBeforeResponseHandlers = [];
        this.onErrorHandlers = [];
    }
    
    listen():void{
      if(!this.proxyConfig.httpServer){
          this.proxyConfig.httpServer = http.createServer();
      }
      
      if(!this.proxyConfig.port){
          this.proxyConfig.port = 8080;
      }
      
      this.proxyConfig.httpServer.on('error',() => this._onError);
    //   this.httpServer.on('connect',(req:any, socket:net.Socket, head:any) => this._onHttpConnect(req, socket, head));
      this.proxyConfig.httpServer.on('connect',(req:any, socket:net.Socket, head:any) => this._onHttpConnect(req, socket, head));
      this.proxyConfig.httpServer.on('request',(request:http.ClientRequest, response:http.ServerResponse) => this._onHttpRequest(request, response));
      this.proxyConfig.httpServer.listen(this.proxyConfig.port);
      console.log("server started on port", this.proxyConfig.port);
    }
    
    
    onRequest(handler:Function):void{
        this.onBeforeRequestHandlers.push(handler);
    }
    
    onResponse(handler:Function):void{
        this.onBeforeResponseHandlers.push(handler);
    }
    
    onError(handler:Function):void{
        this.onErrorHandlers.push(handler);
    }
    
}
export = Proxy;