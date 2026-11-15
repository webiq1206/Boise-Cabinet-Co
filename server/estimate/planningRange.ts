import {planningRangeRequestSchema,planningRangeResponseSchema} from '../../shared/planningRange.ts';
import {calculateEstimate,calculateCombinedEstimate,roomSelectionsMade,type EstimateResult,type CombinedEstimateResult} from '../estimateEngine.ts';

export const PLANNING_RANGE_BODY_LIMIT=16_384;
const headers={'Cache-Control':'no-store','Content-Type':'application/json'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});

/** Enumerate the public response. Never spread a private pricing result. */
function publicSingle(r:EstimateResult|null){return r?{priceLow:r.priceLow,priceHigh:r.priceHigh,roi:r.roi,included:r.included,confidence:r.confidence,confidenceLabel:r.confidenceLabel,confidencePercent:r.confidencePercent,scopeSummary:r.scopeSummary,selectionsMade:r.selectionsMade,totalSteps:r.totalSteps}:null;}
function publicCombined(r:CombinedEstimateResult|null){return r?{priceLow:r.priceLow,priceHigh:r.priceHigh,rooms:r.rooms.map(room=>({project:room.project,projectLabel:room.projectLabel,sizeLabel:room.sizeLabel,scopeSummary:room.scopeSummary,priceLow:room.priceLow,priceHigh:room.priceHigh})),included:r.included,confidence:r.confidence,confidenceLabel:r.confidenceLabel,confidencePercent:r.confidencePercent}:null;}

/** Stateless public calculation: no persistence, credentials, provider or delivery calls. */
export async function planningRangeHandler(request:Request):Promise<Response>{
 if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||''))return reply({error:'Send planning selections as JSON.'},415);
 const length=request.headers.get('content-length');
 if(length&&(!/^\d+$/.test(length)||Number(length)>PLANNING_RANGE_BODY_LIMIT))return reply({error:'Planning request is too large.'},413);
 let raw:unknown;
 try{
  const reader=request.body?.getReader();if(!reader)return reply({error:'Planning selections are required.'},400);
  let size=0;const chunks:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>PLANNING_RANGE_BODY_LIMIT){await reader.cancel();return reply({error:'Planning request is too large.'},413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  raw=JSON.parse(new TextDecoder().decode(bytes));
 }catch{return reply({error:'Planning selections must be valid JSON.'},400);}
 const parsed=planningRangeRequestSchema.safeParse(raw);
 if(!parsed.success)return reply({error:'Check the room selections and try again.'},400);
 try{
  const {rooms,selectionsMade}=parsed.data;
  const combined=publicCombined(calculateCombinedEstimate(rooms));
  const singles=rooms.map((room,index)=>publicSingle(calculateEstimate(room,selectionsMade?.[index]??roomSelectionsMade(room))));
  return reply(planningRangeResponseSchema.parse({combined,singles}));
 }catch{return reply({error:'Planning range unavailable. Please retry.'},503);}
}
