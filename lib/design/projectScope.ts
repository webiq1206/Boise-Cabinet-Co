import type {ProjectSource} from '../p5/projectSource';
/** Proposed modules supply exact catalog quantities; room width is never a cabinet run. */
export function cabinetProjectSource(input:{roomType:string|null;modules:{width:number;depth:number;height:number;isWall?:boolean}[];selections:string;notes:string;room?:string;imageUrl?:string}):ProjectSource{
  const answers:ProjectSource['answers']={};
  if(input.roomType)answers.cabinetRoom=input.roomType;
  if(input.selections)answers.materials=input.selections;
  if(input.modules.length){
    const feet=(wall:boolean)=>String(Math.round(input.modules.filter(m=>Boolean(m.isWall)===wall).reduce((total,m)=>total+m.width/.3048,0)*100)/100);
    answers.cabinetBaseLf=feet(false);answers.cabinetUpperLf=feet(true);
    answers.taskList='Proposed cabinet modules (verify fit on site):\n'+input.modules.map((m,i)=>`${i+1}. ${m.isWall?'Wall':'Base/tall'} cabinet: ${Math.round(m.width/.0254)} in wide, ${Math.round(m.depth/.0254)} in deep, ${Math.round(m.height/.0254)} in high`).join('\n');
  }
  if(input.notes||input.room)answers.otherDetails=[input.room,input.notes].filter(Boolean).join('\n');
  return {id:'cabinet-design',answers,imageUrl:input.imageUrl};
}
