"use client";
import { useEffect,useRef,useState } from "react";
import { Camera, FileUp, Mic, Presentation, Square } from "lucide-react";

export function ContextFileInput({purpose,onExtract,disabled=false}:{purpose:"company"|"dialogue"|"structure";onExtract:(text:string,name:string)=>void;disabled?:boolean}) {
 const [busy,setBusy]=useState(false),[recording,setRecording]=useState(false),[error,setError]=useState("");
 const input=useRef<HTMLInputElement>(null),camera=useRef<HTMLInputElement>(null),slides=useRef<HTMLInputElement>(null),recorder=useRef<MediaRecorder|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),alive=useRef(true);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;if(timer.current)clearTimeout(timer.current);const r=recorder.current;if(r){r.onstop=null;if(r.state!=="inactive")r.stop();r.stream.getTracks().forEach(t=>t.stop());}};},[]);
 async function extract(file?:File) {
  if(!file||busy||!alive.current)return;
  if(file.size>3*1024*1024){setError("Choose a file smaller than 3 MB.");return;}
  setBusy(true);setError("");
  try {const body=new FormData();body.set("purpose",purpose);body.set("file",file);const response=await fetch("/api/context-extract",{method:"POST",body});const result=await response.json();if(!response.ok)throw new Error(result.error||"File processing failed.");if(alive.current)onExtract(result.content,result.sourceName);}
  catch(e){if(alive.current)setError(e instanceof Error?e.message:"The file could not be read.");}
  finally{if(alive.current)setBusy(false);}
 }
 async function microphone() {
  if(recording){recorder.current?.stop();return;}
  setError("");
  try {
   if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined")throw new Error("Recording is not available in this browser. You can upload an audio file.");
   const stream=await navigator.mediaDevices.getUserMedia({audio:true});
   if(!alive.current){stream.getTracks().forEach(t=>t.stop());return;}
   const r=new MediaRecorder(stream),chunks:Blob[]=[];recorder.current=r;
   r.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   r.onstop=()=>{if(timer.current)clearTimeout(timer.current);stream.getTracks().forEach(t=>t.stop());if(!alive.current)return;setRecording(false);void extract(new File(chunks,"Voice note",{type:r.mimeType}));};
   r.onerror=()=>{stream.getTracks().forEach(t=>t.stop());if(alive.current){setRecording(false);setError("Recording stopped unexpectedly. Please try again.");}};
   r.start();setRecording(true);timer.current=setTimeout(()=>{if(r.state!=="inactive")r.stop();},60000);
  }catch(e){setError(e instanceof Error?e.message:"Microphone access was not granted.");}
 }
 return <div className="context-input"><div className="context-tools"><button type="button" title={recording?"Stop recording":"Record voice note (up to one minute)"} aria-label={recording?"Stop recording":"Record voice note"} disabled={disabled||busy} onClick={microphone}>{recording?<Square size={18}/>:<Mic size={18}/>}</button><button type="button" title="Upload file" aria-label="Upload file" disabled={disabled||busy||recording} onClick={()=>input.current?.click()}><FileUp size={18}/></button><button type="button" title="Upload presentation as PDF" aria-label="Upload presentation as PDF" disabled={disabled||busy||recording} onClick={()=>slides.current?.click()}><Presentation size={18}/></button><button type="button" title="Take or upload photo" aria-label="Take or upload photo" disabled={disabled||busy||recording} onClick={()=>camera.current?.click()}><Camera size={18}/></button><input ref={input} hidden type="file" accept="application/pdf,text/plain,text/csv,image/png,image/jpeg,image/webp,audio/*" onChange={e=>{void extract(e.target.files?.[0]);e.target.value="";}}/><input ref={slides} hidden type="file" accept="application/pdf" onChange={e=>{void extract(e.target.files?.[0]);e.target.value="";}}/><input ref={camera} hidden type="file" accept="image/*" capture="environment" onChange={e=>{void extract(e.target.files?.[0]);e.target.value="";}}/>{recording&&<span role="status">Recording...</span>}{busy&&<span role="status">Reading file...</span>}</div>{error&&<p className="form-message" role="alert">{error}</p>}</div>;
}
