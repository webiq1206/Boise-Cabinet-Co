import {safeEmailReplyTo} from './emailReplyTo.ts';
import { getUncachableResendClient as getUncachableEmailClient } from "../../server/resend";
import { getAdminRecipientEmails,decoratePreliminaryEstimateEmail } from "../../server/services/emailLayout";
import { ESTIMATOR_BRAND as brand } from "./brand";
import {assertCrmPayloadSize,crmPayload,CrmPayloadTooLargeError} from "./deliveryPayloads";
import {crmIdentity,deliverKeyedCrm} from "./keyedCrm";

/**
 * Jared ruling: every estimator email is From P5 Home Co.
 * The mailbox is hello@p5homeco.com, or SMTP_FROM when that value is another
 * p5homeco.com mailbox. The display name does not follow the brand.
 */
export function estimatorFromAddress(env: Record<string, string | undefined> = process.env): string {
  const configured = String(env.SMTP_FROM ?? "").trim();
  const named = configured.match(/^[^<>@\r\n]*<([^<>\r\n]+)>$/);
  const mailbox = (named ? named[1] : configured).trim();
  if (configured && !/[\r\n]/.test(configured) && /^[^\s@<>,;]+@p5homeco\.com$/i.test(mailbox)) {
    return `P5 Home Co <${mailbox}>`;
  }
  return "P5 Home Co <hello@p5homeco.com>";
}

export function emailSendShouldRetry(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  const detail = `${code} ${message}`;
  if (/ECONNRESET|ETIMEDOUT|ECONNREFUSED|EAI_AGAIN|EPIPE|ESOCKET/i.test(detail)) return true;
  if (/\b(408|425|429|500|502|503|504)\b/.test(message)) return true;
  if (/socket hang up|timed out|try again|temporarily/i.test(message)) return true;
  return false;
}

export async function adminRecipients(){return [...new Set(await getAdminRecipientEmails(brand.email))];}
export const EMAIL_SUPPORTS_IDEMPOTENCY=true;
export {CrmPayloadTooLargeError};
export async function sendEmail(input:{to:string;replyTo?:string;subject:string;text:string;html?:string;attachments:{filename:string;content:Buffer;contentType?:string}[];key:string}){
  const {client}=await getUncachableEmailClient();
  const sender=client.emails as unknown as {send:(body:unknown,options:unknown)=>Promise<any>};
  // Customer preliminary-estimate mail gains the Schedule now button here when
  // the shared renderer has not already included the booking link.
  // Other subjects, including project-request mail, are returned unchanged.
  // The shared intake test replaces emailLayout with a stub that has no
  // decorator; those messages must keep the bytes the renderer produced.
  const message=typeof decoratePreliminaryEstimateEmail==="function"?decoratePreliminaryEstimateEmail(input):input;
  const body={from:estimatorFromAddress(),to:input.to,replyTo:safeEmailReplyTo(input.replyTo,brand.email),subject:message.subject,text:message.text,html:message.html,attachments:input.attachments};
  const once=async()=>{
    const result=await sender.send(body,{idempotencyKey:input.key});
    if(result?.error)throw new Error("Email provider rejected delivery");
    const id=result?.data?.id||result?.id;
    if(!id||id==="noop"||result?.skipped)throw new Error("Email delivery is not configured");
    return String(id);
  };
  try{
    return await once();
  }catch(error){
    if(!emailSendShouldRetry(error))throw error;
    const reason=error instanceof Error?error.message:"Delivery failed";
    console.error(`[p5-delivery] email send retry for ${input.key}: ${reason.slice(0,200)}`);
    return await once();
  }
}
export async function syncCrm(record:any,key:string){
  const identity=crmIdentity(record,key,brand.domain);
  const payload={...crmPayload(record,identity.externalLeadId),...identity};
  assertCrmPayloadSize(payload);
  return deliverKeyedCrm(payload,key,process.env.LEAD_DASHBOARD_KEY||'',process.env.LEAD_DASHBOARD_API_URL||brand.crmUrl);
}
/** Synchronous readiness only: the Resend key or the Replit connector identity must be present before an intake notification is attempted. */
export function emailTransportReady(){return Boolean(process.env.RESEND_API_KEY||(process.env.REPLIT_CONNECTORS_HOSTNAME&&(process.env.REPL_IDENTITY||process.env.WEB_REPL_RENEWAL)));}
