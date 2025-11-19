import { ServiceDetailPage } from '@/components/templates/ServiceDetailPage';
import { getServiceBySlug } from '@shared/contentData';

export default function SeasonalCleanupPage() {
  const service = getServiceBySlug('seasonal-cleanup');
  
  if (!service) {
    return <div>Service not found</div>;
  }
  
  return <ServiceDetailPage service={service} />;
}
