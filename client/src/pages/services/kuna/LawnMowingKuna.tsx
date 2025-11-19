import { GeoServicePage } from "@/components/templates/GeoServicePage";
import { getServiceBySlug, getCityBySlug } from "@shared/contentData";

export default function LawnMowingKuna() {
  const service = getServiceBySlug('lawn-mowing');
  const city = getCityBySlug('kuna');
  
  if (!service || !city) {
    return <div>Service or city not found</div>;
  }
  
  return <GeoServicePage service={service} city={city} />;
}
