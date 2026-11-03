/* global AudioWorkletProcessor, registerProcessor, sampleRate */
class RealtimePCM extends AudioWorkletProcessor{
 constructor(){super();this.pending=[];this.position=0;this.step=sampleRate/16000;}
 process(inputs){
  const input=inputs[0]?.[0];if(!input)return true;
  // Streaming resampling retains phase between render quanta. 320 samples = 20ms.
  for(let i=0;i<input.length;i++){
   this.position++;
   if(this.position>=this.step){this.position-=this.step;this.pending.push(Math.round(Math.max(-1,Math.min(1,input[i]))*32767));}
   if(this.pending.length===320){
    const bytes=new ArrayBuffer(640),view=new DataView(bytes);this.pending.forEach((n,j)=>view.setInt16(j*2,n,true));
    this.port.postMessage(bytes,[bytes]);this.pending=[];
   }
  }
  return true;
 }
}
registerProcessor('forma-pcm',RealtimePCM);
