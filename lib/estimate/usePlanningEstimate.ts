"use client";
import {useEffect,useState,useCallback} from 'react';
import {isPriceable,type EstimateSelections} from '@/shared/estimateEngine';
import {planningRangeResponseSchema,type PublicPlanningRange} from '@/shared/planningRange';

export const PLANNING_REQUEST_TIMEOUT_MS=10_000;
export async function requestPlanningEstimate(rooms:EstimateSelections[],selectionsMade?:number[],signal?:AbortSignal):Promise<PublicPlanningRange>{
 const controller=new AbortController();
 let timer:ReturnType<typeof setTimeout>|undefined;
 let onAbort:()=>void=()=>{};
 const deadline=new Promise<never>((_resolve,reject)=>{
  onAbort=()=>{controller.abort();reject(new DOMException('Planning request superseded.','AbortError'));};
  signal?.addEventListener('abort',onAbort,{once:true});
  if(signal?.aborted){onAbort();return;}
  timer=setTimeout(()=>{controller.abort();reject(new Error('Your planning range timed out. Please retry.'));},PLANNING_REQUEST_TIMEOUT_MS);
 });
 const calculate=async()=>{
  const response=await fetch('/api/estimate/planning-range',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rooms,...(selectionsMade?{selectionsMade}:{})}),signal:controller.signal,cache:'no-store'});
  if(!response.ok)throw new Error('Your planning range could not be updated. Please retry.');
  const result=planningRangeResponseSchema.parse(await response.json());
  if(result.singles.length!==rooms.length)throw new Error('The planning range did not match your rooms. Please retry.');
  return result;
 };
 try{return await Promise.race([calculate(),deadline]);}
 finally{if(timer)clearTimeout(timer);signal?.removeEventListener('abort',onAbort);}
}

/** Drop stale totals immediately; debounce input and cancel superseded requests. */
export function usePlanningEstimate(rooms:EstimateSelections[],selectionsMade?:number[]){
 const key=JSON.stringify({rooms,selectionsMade});
 const [attempt,setAttempt]=useState(0);
 const [state,setState]=useState<{key:string;data:PublicPlanningRange|null;status:'idle'|'loading'|'ready'|'error'}>({key:'',data:null,status:'idle'});
 const retry=useCallback(()=>setAttempt(value=>value+1),[]);
 useEffect(()=>{
  const input=JSON.parse(key) as {rooms:EstimateSelections[];selectionsMade?:number[]};
  if(!input.rooms.some(isPriceable)){setState({key,data:null,status:'idle'});return;}
  const controller=new AbortController();let current=true;
  setState({key,data:null,status:'loading'});
  const timer=setTimeout(()=>{
   requestPlanningEstimate(input.rooms,input.selectionsMade,controller.signal).then(data=>{if(current)setState({key,data,status:'ready'});}).catch(()=>{if(current&&!controller.signal.aborted)setState({key,data:null,status:'error'});});
  },180);
  return()=>{current=false;clearTimeout(timer);controller.abort();};
 },[key,attempt]);
 const matches=state.key===key;
 return {data:matches?state.data:null,status:matches?state.status:rooms.some(isPriceable)?'loading' as const:'idle' as const,retry};
}
