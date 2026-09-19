import {ESTIMATOR_BRAND as brand} from './brand.ts';

export function crmPayload(record:any,key:string){
  const range=record.customer.range;
  return {
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
    estimate:{brand:brand.name,estimator:'p5-policy',id:record.draftId,scope:record.scope,internal:record.internal,customer:record.customer},
    estimateSummary:JSON.stringify(record.internal).slice(0,19000),
    estimateLow:range?.low,
    estimateHigh:range?.high,
    estimateRange:range?`$${range.low} to $${range.high}`:undefined,
  };
}