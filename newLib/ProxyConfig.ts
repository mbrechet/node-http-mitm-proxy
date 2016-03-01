import * as http from "http";

export default class ProxyConfig {
    
    public httpServer:http.Server = null;
    public port:number = 8080;
    
    
    constructor(){
        
    }
}