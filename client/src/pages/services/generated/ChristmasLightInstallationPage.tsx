import { ServiceDetailPage } from '@/components/templates/ServiceDetailPage';
import { getServiceBySlug } from '@shared/contentData';

export default function ChristmasLightInstallationPage() {
  const service = getServiceBySlug('christmas-light-installation');
  
  if (!service) {
    return <div>Service not found</div>;
  }
  
  return <ServiceDetailPage service={service} />;
}
