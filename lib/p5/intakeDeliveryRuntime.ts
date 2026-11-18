import {prepareIntakeEmail} from './intakeEmailDelivery.ts';
import {readStoredBytes} from './objectStorage.ts';
import {linkSecret} from './estimateLinks.ts';
import {query} from './database.ts';
import {ESTIMATOR_BRAND} from './brand.ts';
import {intakeSite} from './intakePolicy.ts';
import {intakeDeliveryWorker,type IntakeTransport} from './intakeDelivery.ts';
import {INTAKE_RUNTIME_PROOF} from './intakeDeliveryPolicy.ts';
import {suppressSyntheticEstimateNotifications} from './estimatorNotifications.ts';
import {qaOperationContext} from './qaOperationContext.ts';
import {p5LeadIntakeTransport} from './p5LeadIntake.ts';

/**
 * The three channels of this site's project request delivery (owner decisions, 13, 17 and 18
 * November 2026).
 *
 * - `customer` and `team`: this site emails the customer and its own team through the brand's
 *   existing mail transport. That team email is the ONE team email for a request.
 * - `crm`: the visitor's unpriced project request is posted to P5 Home Co's lead intake
 *   (`p5LeadIntakeTransport()` in p5LeadIntake.ts), where it becomes a P5 lead and a HubSpot deal in
 *   the first stage. It says `team_alert: "site"`, so P5 sends no second team email. There is no
 *   price in it, so nothing goes to QuickBooks; the estimate the team later publishes joins the same
 *   lead (`syncCrm()` in deliveryAdapter.ts, one lead per project).
 *
 * The `crm` channel is on only while `P5_CRM_DELIVERY` is `on` (`crm-disabled` otherwise), and only
 * for requests saved since the lead system began taking them (`PROJECT_REQUEST_LEADS_SINCE` in
 * p5LeadIntake.ts; `P5_REQUEST_LEADS_SINCE`, an ISO moment, sets another), so older requests the
 * team already answered by email do not all arrive in HubSpot at once. A synthetic QA request is
 * never posted, and a retry is safe: the request's id at P5 is its lead key, so a repeat is a
 * duplicate there.
 *
 * The canonical review receiver (canonicalReviewTransport.ts, project_review_v1) is NOT used by
 * this runtime. It stays in the repository, gated and untouched (`INTAKE_RUNTIME_PROOF.crm`).
 *
 * Existing adapters only. Configuration values and provider errors never enter status payloads.
 * Runtime proof is a reviewed source gate, not a user-supplied option or a credential toggle.
 */
export async function runtimeIntakeTransports():Promise<Record<'customer'|'team'|'crm',IntakeTransport>>{
 const email:IntakeTransport={retryWindowMs:0,identityScope:`${ESTIMATOR_BRAND.id}-email-no-automatic-replay`,
  // The brand adapter owns transport configuration. Loaded lazily, like send, so an
  // isolated harness that replaces the adapter never needs the site's email modules.
  readiness:async()=>{const adapter=await import('./deliveryAdapter.ts');if(typeof adapter.emailTransportReady!=='function'||!adapter.emailTransportReady())return 'configuration-missing';return INTAKE_RUNTIME_PROOF.email?null:'runtime-proof-pending';},
  prepare:(snapshot,envelope)=>prepareIntakeEmail(snapshot,envelope,{query,readBytes:readStoredBytes,secret:linkSecret}),
  send:async envelope=>{if(!envelope.email)throw new Error('payload-review');const {sendEmail}=await import('./deliveryAdapter.ts');return sendEmail({...envelope.email,attachments:envelope.email.attachments.map(f=>({filename:f.filename,content:Buffer.from(f.base64,'base64'),contentType:f.contentType})),key:envelope.key});},
 };
 // The site's existing CRM setting decides whether requests leave for the P5 lead system at all.
 const crm=p5LeadIntakeTransport({enabled:process.env.P5_CRM_DELIVERY==='on',since:process.env.P5_REQUEST_LEADS_SINCE});
 return {customer:email,team:email,crm};
}
export async function processIntakeDeliveries(limit=2){
 if(qaOperationContext())return {processed:0};
 const site=intakeSite(ESTIMATOR_BRAND.id);if(!site)return {processed:0};
 return intakeDeliveryWorker({query,site,transports:await runtimeIntakeTransports(),suppressed:suppressSyntheticEstimateNotifications}).run(limit);
}
