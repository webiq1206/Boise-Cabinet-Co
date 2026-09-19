import {ESTIMATOR_BRAND as brand} from './brand.ts';
import {buildCrmPayload,crmPayloadBytes,CRM_PAYLOAD_LIMIT_BYTES,CrmPayloadTooLargeError} from './boundedCrmPayload.ts';
export {crmPayloadBytes,CrmPayloadTooLargeError};
export const CRM_PAYLOAD_WARNING_BYTES=80*1024;
export const CRM_PAYLOAD_HARD_BYTES=CRM_PAYLOAD_LIMIT_BYTES;
export function crmPayload(record:any,key:string){return buildCrmPayload({...record,brand:record.brand||brand.name,estimator:record.estimator||"p5-policy"},key,brand.domain);}
export function assertCrmPayloadSize(payload:unknown){
 const bytes=crmPayloadBytes(payload);if(bytes>CRM_PAYLOAD_HARD_BYTES)throw new CrmPayloadTooLargeError(bytes);
 return {bytes,warning:bytes>CRM_PAYLOAD_WARNING_BYTES};
}
