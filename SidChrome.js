import puppeteer from 'puppeteer';
import express from 'express';
import { WebSocketServer } from 'ws';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';


export default class SidChrome {


//TODo : close methods

  constructor() {
    this.PORT_WEB = 3615;
    this.POST_WS = 3616;
    this.bowser = null;
    this.pageWeb = null;
    this.server = null;
    this.wsServer = null;
  }

  async startAll() {
    await this.launchWebServer();
    await this.launchSocketServer();
    await this.launchBrowser();
    await this.clickStart();
  }

  async stopAll() {
    //TODO
  }

  async launchBrowser() {
    this.browser = await puppeteer.launch({
      ignoreDefaultArgs: ['--mute-audio'],
    });
    this.page = await this.browser.newPage();    
    
    await this.page.goto('http://localhost:'+this.PORT_WEB);  
    console.log("Browser Launched");
  }

  async stopBrowser() {
      await this.browser.close();
      console.log("Browser closed");
  }

  async clickStart() {
    await this.page.locator('#start-btn').click();
    console.log("Start clicked");
  }

  async launchWebServer()  {
    this.server = express();
    const __dirname = dirname(fileURLToPath(import.meta.url));
    this.server.use(express.static(__dirname+"/public"));
    this.server.listen(this.PORT_WEB);
    console.log("Web server launched");
  }


  async closeWebServer() {
    this.server.close(err=>{
      if (err) {
        console.error('There was an error', err.message)
      } else {
        console.log('http server closed successfully. Exiting!');
      }
    })
  }

  async launchSocketServer() {
    this.wsServer = new WebSocketServer({ port: this.POST_WS });

    this.wsServer.on('connection', function connection(ws) {      
      console.log("WebSocket launched");
        ws.on('error', console.error);     
      });
    }

    async closeWebSocket() {
      wss.clients.forEach((socket) => {
        if ([socket.OPEN, socket.CLOSING].includes(socket.readyState)) {
          socket.terminate();
        }
      });

    }

    sendMessageSocket(data) {
      let strData = JSON.stringify(data);
      this.wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          console.log("send "+strData);
          client.send(strData);
        }
      });    
    }

}



