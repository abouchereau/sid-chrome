//import { AudioContext, AudioWorkletNode,  } from '../index.mjs';

class SidAudio  {

    audioContext = null;
    scriptNode = [];
    panner = [];
    gain = [];
    socket = null;
    lastMemoryCompare = ["","",""];

    constructor() {//TODO : from url param

        const urlParams = new URL(document.location.toString()).searchParams;
        this.POST_WS = Number(urlParams.get('portSocket'));
        this.LATENCY = Number(urlParams.get('latency'))
        this.NB_WORKLETS = 3;
    }

    async init() {
        this.audioContext = new AudioContext({
            latencyHint: this.LATENCY,
            sampleRate: 44100
        });
        // Chargement du module AudioWorklet
        await this.audioContext.audioWorklet.addModule("SidWorklet.js");

        // Création et stockage des AudioWorkletNodes avec le même contexte
        this.scriptNode = [];
        for (let i = 0; i < this.NB_WORKLETS; i++) {
            const node = new AudioWorkletNode(this.audioContext, 'SidWorklet', { processorOptions: { sidVoice: i, nbWorklets: this.NB_WORKLETS} });
            const panner = this.audioContext.createStereoPanner();
            this.scriptNode.push(node);
            this.panner.push(panner);
            node.connect(panner);
            panner.connect(this.audioContext.destination);
        }
        await this.initWebSocket();
    }


    initWebSocket() {
        return new Promise((resolve, reject)=> {
            
            this.socket = new WebSocket("ws://localhost:"+this.POST_WS);

            this.socket.onopen = e=>{
                console.log("Socket Open");
                this.socket.send("Socket Open");
                resolve();
            };
    
            this.socket.onmessage = e=>{
                console.log(e.data);
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
        })
    }

    sendSocket(str) {
        if (this.socket.readyState  !== WebSocket.CLOSED) {
            this.socket.send(str);
        }
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
        if (this.audioContext.state=="running") {
            for(let i=0;i<this.NB_WORKLETS;i++) {   
                this.scriptNode[i].port.postMessage(obj);
            }
        }
            
    }
    

}
