import { ServiceDetailPage } from '@/components/templates/ServiceDetailPage';
import { getServiceBySlug } from '@shared/contentData';

export default function FirePitInstallationPage() {
  const service = getServiceBySlug('fire-pit-installation');
  
  if (!service) {
    return <div>Service not found</div>;
  }
  
  return <ServiceDetailPage service={service} />;
}
