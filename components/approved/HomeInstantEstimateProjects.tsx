import { ArrowUpRight, Phone } from 'lucide-react';
import { FamilyButton } from '@/components/family/Button';
import { CTA_QUOTE_HREF, CTA_REQUEST_QUOTE } from '@/shared/ctaCopy';
import { ESTIMATOR_PROJECT_IDS, ESTIMATOR_PROJECT_LABELS, instantEstimateHref } from '@/shared/instantEstimate';
import { SITE_CONFIG } from '@/shared/siteConfig';

/**
 * The homepage block where the planning range slider used to be (owner,
 * 21 November 2026: one source of prices). KitchenPlanningRange ran this
 * site's own engine and showed figures that differed from the P5 instant
 * estimator, so it was retired; the component stays in the repository,
 * unmounted. This block shows no figure: it opens the central estimator on
 * each project it prices for this brand, with the path to a person beside it.
 *
 * `#ranges` is kept as an anchor at the top of the block so old links from
 * outside the site still land here.
 */
export function HomeInstantEstimateProjects() {
  return (
    <section id="estimate-by-project" className="home-estimate-projects fr-band" aria-labelledby="estimate-by-project-heading" data-testid="home-instant-estimate-projects">
      <span id="ranges" className="home-estimate-legacy-anchor" aria-hidden="true" />
      <div className="section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">INSTANT ESTIMATE</p>
            <h2 id="estimate-by-project-heading">
              Start with your project.
              <br />
              <em>See a preliminary range.</em>
            </h2>
          </div>
          <p>Pick your project and see a preliminary price range from our instant estimate.</p>
        </div>
        <ul className="home-estimate-project-list" aria-label="Projects our instant estimate prices">
          {ESTIMATOR_PROJECT_IDS.map((id) => (
            <li key={id}>
              <FamilyButton href={instantEstimateHref(id)} variant="secondary" size="lg" tone="dark" block className="home-estimate-project" data-estimator-project={id}>
                <span>{ESTIMATOR_PROJECT_LABELS[id]}</span>
                <ArrowUpRight size={18} aria-hidden="true" />
              </FamilyButton>
            </li>
          ))}
        </ul>
        <div className="home-estimate-person">
          <p>Rather talk it through with a person?</p>
          <div className="home-estimate-person-actions">
            <FamilyButton href={CTA_QUOTE_HREF} variant="tertiary" tone="dark">{CTA_REQUEST_QUOTE}</FamilyButton>
            <a className="fam-btn fam-btn--tertiary fam-btn--md fam-btn--on-dark" href={SITE_CONFIG.phoneHref} data-testid="link-phone-estimate-block">
              <Phone size={18} strokeWidth={1.5} aria-hidden="true" />
              Call {SITE_CONFIG.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
