import WebServer from './WebServer.js';


const webServer = new WebServer(3615, "/public");
webServer.start();