import { GeoServicePage } from '@/components/templates/GeoServicePage';
import { getServiceBySlug, getCityBySlug } from '@shared/contentData';

export default function LandscapeLightingKuna() {
  const service = getServiceBySlug('landscape-lighting');
  const city = getCityBySlug('kuna');
  
  if (!service || !city) {
    return <div>Service or city not found</div>;
  }
  
  return <GeoServicePage service={service} city={city} />;
}
