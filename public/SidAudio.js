//import { AudioContext, AudioWorkletNode,  } from '../index.mjs';

class SidAudio  {

    audioContext = null;
    scriptNode = [];
    panner = [];
    gain = [];
    socket = null;

    constructor() {
        this.PORT_WEB = 3615;
        this.POST_WS = 3616;
    }

    async init() {
        this.audioContext = new AudioContext({
            latencyHint: 0.05,
            sampleRate: 44100});
        await this.audioContext.audioWorklet.addModule("SidWorklet.js");
       /* this.scriptNode = await new AudioWorkletNode(this.audioContext, 'SidWorklet', {processorOptions: {"sidVoice":0}});
        this.scriptNode.connect(this.audioContext.destination);    */
        
        this.scriptNode.push(await new AudioWorkletNode(this.audioContext, 'SidWorklet', {processorOptions: {"sidVoice":0}}));
        this.scriptNode.push(await new AudioWorkletNode(this.audioContext, 'SidWorklet', {processorOptions: {"sidVoice":1}}));
        this.scriptNode.push(await new AudioWorkletNode(this.audioContext, 'SidWorklet', {processorOptions: {"sidVoice":2}}));
        this.panner.push(this.audioContext.createStereoPanner());
        this.panner.push(this.audioContext.createStereoPanner());
        this.panner.push(this.audioContext.createStereoPanner());
        this.gain.push(this.audioContext.createGain());
        this.gain.push(this.audioContext.createGain());
        this.gain.push(this.audioContext.createGain());


        for(let i=0;i<3;i++) {
            this.scriptNode[i].connect(this.gain[i]);        
            this.gain[i].connect(this.panner[i]);     
            this.panner[i].connect(this.audioContext.destination);
        }

       
       
    }

    initWebSocket() {
        this.socket = new WebSocket("ws://localhost:"+this.POST_WS);

        this.socket.onopen = e=>{
            console.log("Socket Open");
        };
  
        this.socket.onmessage = e=>{
            if (e.data.indexOf("PAN") == 0) {
                let tmp = e.data.split("|");
                this.pan(parseInt(tmp[1]), parseInt(tmp[2]));
            }
            else if (e.data.indexOf("VOL") == 0) {
                let tmp = e.data.split("|");
                this.gain(parseInt(tmp[1]), parseInt(tmp[2]));
            }
            else {
                this.send(JSON.parse(e.data));
            }
        };
    }

    pan(voice, value) {//value de -100 à 100
        this.panner[voice].pan.value = value / 100;
    }

    gain(voice, value) {//value de 0 à 100
        this.gain[voice].gain.value = value / 100;
    }


    start() {
        if (this.audioContext.state=="suspended") {
            this.audioContext.resume();
        }
    }

    send(obj) {      
        //this.scriptNode.port.postMessage(obj); 
        for(let i=0;i<3;i++) {
          
            this.scriptNode[i].port.postMessage(obj);
        }
            
    }

}
