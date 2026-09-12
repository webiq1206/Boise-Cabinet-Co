export interface PageRecord {source:string;page:number;sheet:string;revision:string;status:'read'|'unreadable'|'partial';notes:string[]}
export interface DocumentCoverage {pages:PageRecord[];expectedPages:number;complete:boolean}
export interface Takeoff {
  id:string;description:string;building:string;floor:string;component:string;
  quantity:number|null;unit:string;basis:'stated'|'calculated'|'uncertain';evidence:string;
  sources:{source:string;page:number;sheet:string;revision:string}[];
  supersedes:string[];issues:string[];alternativeGroup?:string;alternativeOption?:string;aggregateOf?:string[];duplicateOf?:string;
}
const isObject=(v:unknown):v is Record<string,unknown>=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
const strings=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(x=>typeof x==='string');
export function readPageRecords(raw:unknown):PageRecord[]{
  if(!Array.isArray(raw))throw new Error('Missing page-by-page review record');
  return raw.map(v=>{
    if(!isObject(v)||!['source','sheet','revision'].every(k=>typeof v[k]==='string')||!Number.isInteger(v.page)||Number(v.page)<1||!['read','unreadable','partial'].includes(String(v.status))||!strings(v.notes))throw new Error('Invalid page review record');
    return v as unknown as PageRecord;
  });
}
export function readTakeoffs(raw:unknown):Takeoff[]{
  if(!Array.isArray(raw))throw new Error('Invalid quantity takeoff');
  return raw.map(v=>{
    if(!isObject(v)||!['id','description','building','floor','component','unit','evidence'].every(k=>typeof v[k]==='string')||!v.id||!v.evidence||!(v.quantity===null||typeof v.quantity==='number'&&Number.isFinite(v.quantity)&&v.quantity>0)||!['stated','calculated','uncertain'].includes(String(v.basis))||!strings(v.supersedes)||!strings(v.issues)||!Array.isArray(v.sources)||!v.sources.length||v.alternativeGroup!==undefined&&typeof v.alternativeGroup!=='string'||v.alternativeOption!==undefined&&typeof v.alternativeOption!=='string'||v.aggregateOf!==undefined&&!strings(v.aggregateOf)||v.duplicateOf!==undefined&&typeof v.duplicateOf!=='string')throw new Error('Invalid takeoff evidence');
    for(const s of v.sources)if(!isObject(s)||!['source','sheet','revision'].every(k=>typeof s[k]==='string')||!Number.isInteger(s.page)||Number(s.page)<1)throw new Error('Invalid takeoff page reference');
    if(v.basis==='uncertain'&&v.quantity!==null)throw new Error('An uncertain measurement must not masquerade as a measured quantity');
    return v as unknown as Takeoff;
  });
}
const normalized=(s:string)=>s.trim().toLowerCase().replace(/\s+/g,' ');
/** Repeated schedules/details describe the same physical work, not additions.
 * Only explicit supersession removes an earlier observation. Conflicts survive.
 */
export function reconcileTakeoffs(items:Takeoff[]):{items:Takeoff[];issues:string[]}{
  const output=new Map<string,Takeoff>();const issues:string[]=[];
  const copies=items.map(item=>({...item,sources:[...item.sources],issues:[...item.issues]}));
  const byId=new Map(copies.map(item=>[item.id,item]));
  const invalid=new Set<string>();
  const conflictingDuplicates=new Set<string>();
  const physical=(item:Takeoff)=>[item.building,item.floor,item.component].map(normalized).join('|');
  const identities=new Map<string,Set<string>>();
  for(const item of copies)identities.set(item.id,new Set([...(identities.get(item.id)||[]),physical(item)]));
  for(const [id,values] of identities)if(values.size>1){invalid.add(id);issues.push(`Takeoff ID ${id} refers to more than one physical work item.`);}
  for(const item of copies){
    if(item.duplicateOf&&(item.duplicateOf===item.id||!byId.has(item.duplicateOf)||physical(item)!==physical(byId.get(item.duplicateOf)!))){
      invalid.add(item.id);issues.push(`Duplicate relationship for ${item.id} is invalid and did not remove any work.`);
    }
    if(item.aggregateOf?.length&&(new Set(item.aggregateOf).size!==item.aggregateOf.length||item.aggregateOf.includes(item.id)||item.aggregateOf.some(id=>!byId.has(id)))){
      invalid.add(item.id);issues.push(`Aggregate relationship for ${item.id} is invalid and did not remove any work.`);
    }
    if(item.duplicateOf&&!invalid.has(item.id)){
      const original=byId.get(item.duplicateOf);
      if(original&&(item.quantity!==original.quantity||normalized(item.unit)!==normalized(original.unit)))conflictingDuplicates.add(item.id);
    }
  }
  const graph=new Map(copies.map(item=>[item.id,[...(item.duplicateOf?[item.duplicateOf]:[]),...(item.aggregateOf||[])]]));
  const visit=(id:string,path:string[])=>{
    if(path.includes(id)){for(const member of path.slice(path.indexOf(id)))invalid.add(member);issues.push(`Cyclic takeoff relationship involving ${id} did not remove any work.`);return;}
    for(const child of graph.get(id)||[])if(graph.has(child))visit(child,[...path,id]);
  };
  for(const id of graph.keys())visit(id,[]);
  const sourceIdentity=(source:Takeoff['sources'][number])=>JSON.stringify(source);
  for(const item of copies)if(item.duplicateOf&&!invalid.has(item.id)&&byId.has(item.duplicateOf)){
    const original=byId.get(item.duplicateOf)!;
    original.sources=[...new Map([...original.sources,...item.sources].map(source=>[sourceIdentity(source),source])).values()];
    original.issues=[...new Set([...original.issues,...item.issues])];
    if(conflictingDuplicates.has(item.id)){
      original.quantity=null;original.basis='uncertain';
      original.issues.push(`Conflicting duplicate quantities for ${original.description}; reconcile the cited sources before pricing this work.`);
    }
  }
  for(const item of copies){
    if(item.duplicateOf&&!invalid.has(item.id)&&byId.has(item.duplicateOf))continue;
    const key=[item.building,item.floor,item.component,item.id].map(normalized).join('|');
    const prior=output.get(key);
    if(!prior){output.set(key,item);continue;}
    const sourceKey=(s:Takeoff['sources'][number])=>`${s.source}:${s.sheet}:${s.revision}`;
    if(prior.sources.every(s=>item.supersedes.includes(sourceKey(s)))){output.set(key,item);continue;}
    if(item.sources.every(s=>prior.supersedes.includes(sourceKey(s))))continue;
    if(item.quantity!==prior.quantity||normalized(item.unit)!==normalized(prior.unit)){
      prior.quantity=null;prior.basis='uncertain';
      prior.issues.push(`Conflicting quantities for ${item.description}; reconcile the cited drawings and schedules before treating this as a measured quantity.`);
    }
    prior.sources=[...new Map([...prior.sources,...item.sources].map(s=>[JSON.stringify(s),s])).values()];
    prior.issues=[...new Set([...prior.issues,...item.issues])];
  }
  // Explicit child IDs make printed totals evidence checks, not additional physical work.
  for(const [key,item] of [...output]){
    if(item.quantity===null||!item.aggregateOf?.length||invalid.has(item.id))continue;
    const children=item.aggregateOf.map(id=>[...output.values()].find(candidate=>candidate.id===id)).filter(Boolean) as Takeoff[];
    const sum=children.reduce((n,child)=>n+(child.quantity||0),0);
    if(children.length===item.aggregateOf.length&&children.every(child=>child.quantity!==null&&normalized(child.unit)===normalized(item.unit))&&Math.abs(sum-item.quantity)<1e-8)output.delete(key);
    else issues.push(`Printed aggregate ${item.id} could not be reconciled to its referenced work items.`);
  }
  for(const item of output.values())issues.push(...item.issues);
  return {items:[...output.values()],issues:[...new Set(issues)]};
}
export function coverageFor(expected:{source:string;page:number}[],reported:PageRecord[]):DocumentCoverage{
  const pages=expected.map(e=>{
    const matches=reported.filter(r=>r.source===e.source&&r.page===e.page);
    return matches.length===1?matches[0]:{...e,sheet:'',revision:'',status:'unreadable' as const,notes:[matches.length?'Duplicate page review records require verification.':'No completed review record was returned for this page.']};
  });
  return {pages,expectedPages:expected.length,complete:pages.length===expected.length&&pages.every(p=>p.status==='read')};
}
/** Multiple detail-tile batches must ALL be read before one physical page is read. */
export function combineCoverage(parts:DocumentCoverage[],expected?:{source:string;page:number}[]):DocumentCoverage{
  const grouped=new Map<string,PageRecord[]>();
  for(const p of parts.flatMap(c=>c.pages)){const key=JSON.stringify([p.source,p.page]);grouped.set(key,[...(grouped.get(key)||[]),p]);}
  const wanted=expected||[...grouped.values()].map(p=>({source:p[0].source,page:p[0].page}));
  const pages=wanted.map(p=>{
    const rows=grouped.get(JSON.stringify([p.source,p.page]))||[];
    if(!rows.length)return {...p,sheet:'',revision:'',status:'unreadable' as const,notes:['This page was not processed. Review or retry it before relying on the takeoff.']};
    return {...rows[0],status:rows.every(r=>r.status==='read')?'read' as const:rows.some(r=>r.status==='read'||r.status==='partial')?'partial' as const:'unreadable' as const,notes:[...new Set(rows.flatMap(r=>r.notes))]};
  });
  return {pages,expectedPages:wanted.length,complete:pages.every(p=>p.status==='read')};
}
