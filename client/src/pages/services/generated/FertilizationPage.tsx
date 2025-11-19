import { ServiceDetailPage } from "@/components/templates/ServiceDetailPage";
import { getServiceBySlug } from "@shared/contentData";

export default function FertilizationPage() {
  const service = getServiceBySlug('fertilization');
  
  if (!service) {
    return <div>Service not found</div>;
  }
  
  return <ServiceDetailPage service={service} />;
}
