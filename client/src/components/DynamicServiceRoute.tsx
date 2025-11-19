import { lazy, Suspense } from 'react';
import { useParams } from 'wouter';
import { getCityServiceCombo } from '@shared/contentData';
import NotFound from '@/pages/not-found';

// Lazy-load templates for code splitting
const ServiceDetailPage = lazy(() => 
  import('@/components/templates/ServiceDetailPage').then(m => ({ default: m.ServiceDetailPage }))
);

const GeoServicePage = lazy(() => 
  import('@/components/templates/GeoServicePage').then(m => ({ default: m.GeoServicePage }))
);

// Loading skeleton component
function ServiceLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="animate-pulse">
        <div className="h-12 bg-muted rounded w-3/4 mb-6"></div>
        <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

export default function DynamicServiceRoute() {
  const params = useParams();
  const serviceSlug = params.serviceSlug;
  const citySlug = params.citySlug;

  // Validate service/city combination
  const { service, city, isValid } = getCityServiceCombo(serviceSlug || '', citySlug);

  // Show 404 for invalid combinations
  if (!isValid || !service) {
    return <NotFound />;
  }

  return (
    <Suspense fallback={<ServiceLoadingSkeleton />}>
      {city ? (
        <GeoServicePage service={service} city={city} />
      ) : (
        <ServiceDetailPage service={service} />
      )}
    </Suspense>
  );
}
