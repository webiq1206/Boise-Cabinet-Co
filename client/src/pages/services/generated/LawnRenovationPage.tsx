import { ServiceDetailPage } from '@/components/templates/ServiceDetailPage';
import { getServiceBySlug } from '@shared/contentData';

export default function LawnRenovationPage() {
  const service = getServiceBySlug('lawn-renovation');
  
  if (!service) {
    return <div>Service not found</div>;
  }
  
  return <ServiceDetailPage service={service} />;
}
