import { EstimateCalculator } from '@/components/EstimateCalculator';
import { Section } from '@/components/marketing';

/** Use the same immediately available form as /estimate, including direct
 * #calculator visits. Do not wait for a viewport observer to expose it. */
export function LazyEstimateCalculator() {
  return <Section id="calculator" divider><EstimateCalculator headingAs="h2" sectionId={null} /></Section>;
}
