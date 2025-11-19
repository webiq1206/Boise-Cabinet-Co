import { ServiceDetailPage } from '@/components/templates/ServiceDetailPage';
import { getServiceBySlug } from '@shared/contentData';

export default function IrrigationRepairPage() {
  const service = getServiceBySlug('irrigation-repair');
  
  if (!service) {
    return <div>Service not found</div>;
  }
  
  return <ServiceDetailPage service={service} />;
}
