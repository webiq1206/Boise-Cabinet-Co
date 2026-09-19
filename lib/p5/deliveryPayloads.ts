import {ESTIMATOR_BRAND as brand} from './brand.ts';

// A real 133,555-byte production request was rejected with HTTP 413. Keep the
// accepted envelope comfortably below that observed boundary.
export const CRM_PAYLOAD_WARNING_BYTES=80*1024;
export const CRM_PAYLOAD_HARD_BYTES=96*1024;

export class CrmPayloadTooLargeError extends Error {
  readonly code='crm-payload-too-large';
  readonly bytes:number;
  constructor(bytes:number){
    super(`CRM payload is ${bytes} bytes; the ${CRM_PAYLOAD_HARD_BYTES}-byte limit was exceeded.`);
    this.name='CrmPayloadTooLargeError';this.bytes=bytes;
  }
}

const short=(value:unknown,max=1000)=>typeof value==="string"?value.slice(0,max):value;
const compactAnswers=(answers:any)=>Object.fromEntries(Object.entries(answers||{}).map(([key,value])=>[key,short(value,2000)]));
const compactScope=(scope:any)=>({
  text:typeof scope?.text==='string'?scope.text.slice(0,12000):'',
  answers:compactAnswers(scope?.answers),
  reviewedAt:scope?.reviewedAt,
  corrections:Array.isArray(scope?.corrections)?scope.corrections.slice(0,40).map((item:any)=>short(item,500)):[],
});
const compactInternal=(internal:any)=>({
  revision:internal?.revision,
  directCost:internal?.directCost,
  contingency:internal?.contingency,
  riskAdjustedDirectCost:internal?.riskAdjustedDirectCost,
  contractPrice:internal?.contractPrice,
  planningRange:internal?.planningRange,
  operatingProfit:internal?.operatingProfit,
  targetOperatingProfit:internal?.targetOperatingProfit,
  divisor:internal?.divisor,
  directByCategory:internal?.directByCategory,
  lines:Array.isArray(internal?.lines)?internal.lines.map((line:any)=>({
    id:line.id,category:line.category,description:short(line.description,500),quantity:line.quantity,unit:line.unit,
    unitCost:line.unitCost,cost:line.cost,allowance:line.allowance,quantityRange:line.quantityRange,
  })).slice(0,120):[],
  assumptions:Array.isArray(internal?.assumptions)?internal.assumptions.slice(0,60).map((item:any)=>short(item,500)):[],
  exclusions:Array.isArray(internal?.exclusions)?internal.exclusions.slice(0,60).map((item:any)=>short(item,500)):[],
  warnings:Array.isArray(internal?.warnings)?internal.warnings.slice(0,30).map((item:any)=>typeof item==="string"?short(item,500):{severity:item?.severity,code:item?.code,message:short(item?.message,500)}):[],
  pricingWarnings:Array.isArray(internal?.pricingWarnings)?internal.pricingWarnings.slice(0,30).map((item:any)=>short(item,500)):[],
  scopePricing:internal?.scopePricing?{
    issues:Array.isArray(internal.scopePricing.issues)?internal.scopePricing.issues.slice(0,60).map((item:any)=>short(item,500)):[],
    missingInformation:Array.isArray(internal.scopePricing.missingInformation)?internal.scopePricing.missingInformation.slice(0,60).map((item:any)=>short(item,500)):[],
  }:undefined,
});
const compactCustomer=(customer:any)=>({
  summary:typeof customer?.summary==='string'?customer.summary.slice(0,12000):'',
  range:customer?.range,
  message:short(customer?.message,1000),
  assumptions:Array.isArray(customer?.assumptions)?customer.assumptions.slice(0,60).map((item:any)=>short(item,500)):[],
  verificationItems:Array.isArray(customer?.verificationItems)?customer.verificationItems.slice(0,60).map((item:any)=>short(item,500)):[],
  lineItems:Array.isArray(customer?.lineItems)?customer.lineItems.map((line:any)=>({
    id:line.id,description:short(line.description,500),quantity:line.quantity,unit:line.unit,
    low:line.low,high:line.high,pricingStatus:line.pricingStatus,quantityRange:line.quantityRange,
    floor:line.floor,building:line.building,
  })).slice(0,160):[],
  scopeTasks:Array.isArray(customer?.scopeTasks)?customer.scopeTasks.slice(0,100).map((item:any)=>typeof item==="string"?short(item,500):{id:item?.id,category:item?.category,description:short(item?.description,500)}):[],
});

export function crmPayload(record:any,key:string){
  const range=record.customer.range;
  const payload={
    fullName:record.contact.name,
    email:record.contact.email,
    phone:record.contact.phone,
    source:brand.domain,
    externalLeadId:key,
    inquiryId:record.draftId,
    propertyAddress:record.scope.answers.address||undefined,
    city:record.scope.answers.location||undefined,
    projectTypes:[record.scope.answers.service],
    projectScope:record.customer.summary.slice(0,1900),
    // The CRM needs the reviewed scope and selling result, not the entire
    // extraction/provider transcript. Keep internal costing in a bounded,
    // explicit summary for authorized CRM operators without replaying the
    // oversized historical payload that caused HTTP 413 responses.
    estimate:{brand:brand.name,estimator:'p5-policy',id:record.draftId,scope:compactScope(record.scope),internal:compactInternal(record.internal),customer:compactCustomer(record.customer)},
    estimateSummary:JSON.stringify(compactInternal(record.internal)).slice(0,19000),
    estimateLow:range?.low,
    estimateHigh:range?.high,
    estimateRange:range?`$${range.low} to $${range.high}`:undefined,
  };
  return payload;
}

export function crmPayloadBytes(payload:unknown){
  return Buffer.byteLength(JSON.stringify(payload),'utf8');
}

export function assertCrmPayloadSize(payload:unknown){
  const bytes=crmPayloadBytes(payload);
  if(bytes>CRM_PAYLOAD_HARD_BYTES)throw new CrmPayloadTooLargeError(bytes);
  return {bytes,warning:bytes>CRM_PAYLOAD_WARNING_BYTES};
}