import http from 'http';
import { path, dirname } from 'node:path';
import { url, fileURLToPath } from 'node:url';

export default class WebServer {

    constructor() {
        this.PORT = 3615;
        this.BASE_DIR = dirname(fileURLToPath(import.meta.url));
        this.server = null;
    }

    start() {
        return new Promise((resolve, reject)=>{
        
            this.server = http.createServer((request, response)=>{
                try {
                    const requestUrl = url.parse(request.url)
            
                    // need to use path.normalize so people can't access directories underneath baseDirectory
                    const fsPath = this.BASE_DIR+path.normalize(requestUrl.pathname)
            
                    const fileStream = fs.createReadStream(fsPath)
                    fileStream.pipe(response)
                    fileStream.on('open', function() {
                        response.writeHead(200)
                    })
                    fileStream.on('error',function(e) {
                        response.writeHead(404)     // assume the file doesn't exist
                        response.end()
                    })
            } catch(e) {
                    response.writeHead(500)
                    response.end()     // end the response so browsers don't hang
                    console.log(e.stack);
                    reject();
            }
            });
            
            this.server.listen(this.PORT,()=>{
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