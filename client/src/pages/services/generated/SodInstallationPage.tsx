import { ServiceDetailPage } from "@/components/templates/ServiceDetailPage";
import { getServiceBySlug} from "@shared/contentData";

export default function SodInstallationPage() {
  const service = getServiceBySlug('sod-installation');
  
  if (!service) {
    return <div>Service not found</div>;
  }
  
  return <ServiceDetailPage service={service} />;
}
