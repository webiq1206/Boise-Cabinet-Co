'use client';
import {EstimateCalculator} from '@/components/EstimateCalculator';
import {approvedBrand} from './brand';
/** Native estimator: keep the existing engine, storage, uploads, forms and tracking. */
export function ApprovedEstimate(){
 return <section className="approved-estimate" aria-labelledby="approved-estimate-title"><div className="approved-estimate-intro"><div><p className="f-eyebrow">YOUR PROJECT. REVIEWED BY OUR TEAM.</p><h2 id="approved-estimate-title">Start with an idea.<br/>Let’s plan the next step.</h2></div><div><p>{approvedBrand.estimateIntro}</p><p className="approved-estimate-note">Optional step-by-step cabinet scope. Call, chat, or send the short form at the top of the page if you want a reply without walking through every question. Add plans or photos here when you have them. We may need more information or a site visit before confirming your estimate.</p></div></div><div className="approved-native-estimator"><EstimateCalculator sectionId="calculator" headingAs="h2"/></div></section>;
}
