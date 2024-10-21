//import { AudioContext, AudioWorkletNode,  } from '../index.mjs';

class SidAudio  {

    audioContext = null;
    scriptNode = [];
    panner = [];
    gain = [];


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
