import puppeteer from 'puppeteer-core';
import { WebSocketServer, WebSocket } from 'ws';
import WebServer from './WebServer.js';



export default class SidChrome {


//TODo : close methods

  constructor(portWeb, portWebSocket) {
    this.PORT_WEB = portWeb;
    this.POST_WS = portWebSocket;
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

  /**raspberyy
   * sudo apt install chromium-browser chromium-codecs-ffmpeg
   */



  async launchBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      //executablePath: '/usr/bin/chromium-browser',
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ignoreDefaultArgs: ['--mute-audio']
    });

  /* this.browser = await puppeteer.launch({
      ignoreDefaultArgs: ['--mute-audio'],
    });*/
    this.page = await this.browser.newPage();    
    await this.page.goto('http://localhost:'+this.PORT_WEB+"/index.html");  
    console.log("Chromium Launched");
  }

  async stopBrowser() {
      await this.browser.close();
      console.log("Chromium closed");
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
      this.wsServer = new WebSocketServer({port: this.POST_WS});
      console.log("WebSocket launched on port "+this.POST_WS);
      this.wsServer.on('connection', function connection(ws) {    
        console.log("WebSocket connexion");
          ws.on('error', console.error);     
        });
      resolve();  
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

      //console.log("presend", strData);
      this.wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          console.log("SEND", strData);
          client.send(strData);
        }
      });    
    }

}



