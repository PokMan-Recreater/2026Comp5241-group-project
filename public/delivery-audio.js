import defaultManifest from './delivery-audio-manifest.js';
export function narrationFor(lang,step,manifest=defaultManifest){return manifest[lang==='en'?'en':'zh-CN']?.[step]??null;}
// Convert the real recording clock into the three authored explanation segments.
export function narrationPosition(record,elapsed){
 const duration=Math.max(.001,Number(record?.duration)||1),time=Math.max(0,Math.min(duration,Number(elapsed)||0));
 const starts=record?.sentenceStarts?.length===3?record.sentenceStarts:[0,duration/3,duration*2/3];
 let sentence=0;while(sentence<2&&time>=starts[sentence+1])sentence++;
 const start=starts[sentence],end=sentence===2?duration:starts[sentence+1];
 return {sentence,progress:(sentence+Math.max(0,Math.min(1,(time-start)/Math.max(.001,end-start))))/3};
}
