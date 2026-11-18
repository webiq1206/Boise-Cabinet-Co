import {projectRequestHold} from './p5LeadIntake.ts';
import type {IntakeDeliveryEnvelope} from './intakeDeliveryPayload.ts';
import type {IntakeDeliveryReason} from './intakeDeliveryPolicy.ts';

/** This specialty site has no local lead receiver. Its unpriced project requests are posted to
 * P5 Home Co's lead intake (the `crm` channel in intakeDeliveryRuntime.ts, owner decision, 18
 * November 2026), so the contract check here is the one that channel applies before any post:
 * `projectRequestHold()` in the shared p5LeadIntake.ts. It reads the frozen envelope only. A
 * synthetic QA request, one nobody can be reached about, and an envelope that is not this request
 * are all held. The canonical project_review_v1 receiver is not used and keeps its own validation
 * (intakeProjectReview.ts), untouched. */
export function validateIntakeLocalCrm(envelope:IntakeDeliveryEnvelope):IntakeDeliveryReason|null{
 return projectRequestHold(envelope);
}
