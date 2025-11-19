import { ServiceDetailPage } from "@/components/templates/ServiceDetailPage";
import { getServiceBySlug } from "@shared/contentData";

export default function AerationPage() {
  const service = getServiceBySlug('aeration');
  
  if (!service) {
    return <div>Service not found</div>;
  }
  
  return <ServiceDetailPage service={service} />;
}
