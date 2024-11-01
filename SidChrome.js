import puppeteer from 'puppeteer';
import { WebSocketServer, WebSocket } from 'ws';
import WebServer from './WebServer.js';



export default class SidChrome {


//TODo : close methods

  constructor() {
    this.PORT_WEB = 3615;
    this.POST_WS = 3616;
    this.bowser = null;
    this.pageWeb = null;
    this.server = null;
    this.wsServer = null;
    this.webServer = new WebServer(this.PORT_WEB, "/public");
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
    
    await this.page.goto('http://localhost:'+this.PORT_WEB+"/index.html");  
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
      await this.webServer.start();
  }


  async closeWebServer() {
    await this.webServer.close();
  }

  async launchSocketServer() {

    return new Promise((resolve, reject)=> {
      this.wsServer = new WebSocketServer();
      this.wsServer.on('connection', function connection(ws) {    
        resolve();  
        console.log("WebSocket launched");
          ws.on('error', console.error);     
        });
      });
    }

    async closeWebSocket() {
      this.wsServer.clients.forEach((socket) => {
        if ([socket.OPEN, socket.CLOSING].includes(socket.readyState)) {
          socket.terminate();
        }
      });

    }

    sendMessageSocket(data, isJson=true) {
      let strData = isJson?JSON.stringify(data):data;
      this.wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(strData);
        }
      });    
    }

}



