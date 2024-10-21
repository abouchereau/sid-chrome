import SidChrome from "./SidChrome.js";

(async()=>{
    const sidChrome = new SidChrome();
    await sidChrome.launchWebServer();
    await sidChrome.launchSocketServer();
    await sidChrome.launchBrowser();
    await sidChrome.clickStart();
})();
