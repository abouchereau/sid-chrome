import http from 'http';
import path from 'path';
import url from 'url';
import fs from 'fs';

export default class WebServer {

    constructor(port, relativePath) {
        this.port = port;
        this.baseDir = path.dirname(url.fileURLToPath(import.meta.url))+"/public";
        this.server = null;
    }

    start() {
        return new Promise((resolve, reject)=>{
        
            this.server = http.createServer((request, response)=>{
                try {                    
                    const requestUrl = url.parse(request.url);
                    const fsPath = this.baseDir+path.normalize(requestUrl.pathname);            
                    const fileStream = fs.createReadStream(fsPath);
                    fileStream.pipe(response);
                    fileStream.on('open',()=>{
                        const tmp = requestUrl.pathname.split(".");
                        const ext = tmp[tmp.length-1];
                        if (ext == "js") {
                            response.setHeader("Content-Type", "application/javascript");
                        }                        
                        response.writeHead(200);
                    });
                    fileStream.on('error',(e)=>{
                        response.writeHead(404);     // assume the file doesn't exist
                        response.end();
                    });
                } catch(e) {
                    response.writeHead(500);
                    response.end();     // end the response so browsers don't hang
                    //console.log(e.stack);
                    //reject();
                }
            });
            
            this.server.listen(this.port,()=>{
                console.log("server is listening on port "+this.port);
                resolve();
            })
        });
    }

    stop() {
        return new Promise((resolve, reject)=>{
        
            if(this.server!=null) {
                this.server.close(()=>{
                    resolve();
                })
            }
        }); 
    }

}