import {safeEmailReplyTo} from './emailReplyTo.ts';
import { getUncachableResendClient as getUncachableEmailClient } from "../../server/resend";
import { getAdminRecipientEmails,formatFromAddress,decoratePreliminaryEstimateEmail } from "../../server/services/emailLayout";
import { ESTIMATOR_BRAND as brand } from "./brand";
export async function adminRecipients(){return [...new Set(await getAdminRecipientEmails(brand.email))];}
export const EMAIL_SUPPORTS_IDEMPOTENCY=true;
export async function sendEmail(input:{to:string;replyTo?:string;subject:string;text:string;html?:string;attachments:{filename:string;content:Buffer;contentType?:string}[];key:string}){
  const {client,fromEmail}=await getUncachableEmailClient();
  const sender=client.emails as unknown as {send:(body:unknown,options:unknown)=>Promise<any>};
  // Customer preliminary-estimate mail gains the Schedule now button here.
  // Other subjects, including project-request mail, are returned unchanged.
  // The shared intake test replaces emailLayout with a stub that has no
  // decorator; those messages must keep the bytes the renderer produced.
  const message=typeof decoratePreliminaryEstimateEmail==="function"?decoratePreliminaryEstimateEmail(input):input;
  const result=await sender.send({from:formatFromAddress(fromEmail),to:input.to,replyTo:safeEmailReplyTo(input.replyTo,brand.email),subject:message.subject,text:message.text,html:message.html,attachments:input.attachments},{idempotencyKey:input.key});
  if(result?.error)throw new Error("Email provider rejected delivery");
  const id=result?.data?.id||result?.id;
  if(!id||id==="noop"||result?.skipped)throw new Error("Email delivery is not configured");
  return String(id);
}
/**
 * The published estimate's CRM delivery (owner decisions, 13, 17 and 18 November 2026): the estimate
 * is posted to P5 Home Co's lead intake as form `p5-estimator` with `estimate` of kind `document`.
 * P5 attaches it to the lead the visitor's project request made (one lead per project) and creates
 * the QuickBooks customer and an UNSENT estimate from its figures. Customer amounts only: the shared
 * builder reads no cost, margin, markup, profit, contingency or overhead figure. It says
 * `team_alert: "site"` because this site has already emailed the team its internal estimate record,
 * so P5 sends no second team email.
 *
 * The outbox calls this only while `P5_CRM_DELIVERY` is `on`. It throws a short Error when P5 does
 * not accept the post, so the outbox marks the CRM job for review as it does for any CRM failure.
 * A synthetic QA record is never posted. The old lead dashboard is no longer called from here.
 *
 * The forwarder is loaded with a dynamic import, never a static one: the shared
 * tests/p5-intake-reply-to.test.ts runs this file in a VM with a fixed dependency list.
 * `options` is a test seam (a fake fetch, another address); the outbox passes none.
 */
export async function syncCrm(record:any,key:string,options:{fetch?:typeof fetch;url?:string}={}){
  const {forwardEstimateToP5}=await import("./p5LeadIntake.ts");
  return forwardEstimateToP5(record,key,{fetch:options.fetch,url:options.url,brand:brand.name});
}
/** Synchronous readiness only: the Resend key or the Replit connector identity must be present before an intake notification is attempted. */
export function emailTransportReady(){return Boolean(process.env.RESEND_API_KEY||(process.env.REPLIT_CONNECTORS_HOSTNAME&&(process.env.REPL_IDENTITY||process.env.WEB_REPL_RENEWAL)));}
