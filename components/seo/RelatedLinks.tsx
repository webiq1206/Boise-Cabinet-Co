import Link from 'next/link';
import { CITIES, SERVICES } from '@/shared/contentData';
import { areaPath, cityServicePath, servicePath } from '@/lib/seo-routes';
import { MarketingCard } from '@/components/marketing/MarketingCard';

interface RelatedLinksProps {
  serviceSlug?: string;
  citySlug?: string;
  variant: 'service' | 'area' | 'city-service';
}

export function RelatedLinks({ serviceSlug, citySlug, variant }: RelatedLinksProps) {
  if (variant === 'service' && serviceSlug) {
    return (
      <div>
        <h2 className="font-sans font-light text-section-title mb-6 text-foreground">
          {SERVICES.find((s) => s.slug === serviceSlug)?.name} by city
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              href={cityServicePath(serviceSlug, city.slug)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-border"
            >
              {city.name}, Idaho
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'area' && citySlug) {
    const city = CITIES.find((c) => c.slug === citySlug);
    return (
      <div>
        <h2 className="font-sans font-light text-section-title mb-6 text-foreground">
          Cabinet services in {city?.name}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {SERVICES.map((service) => (
            <Link key={service.slug} href={cityServicePath(service.slug, citySlug)}>
              <MarketingCard className="h-full hover:border-accent/40 transition-colors">
                <h3 className="font-medium text-sm text-foreground mb-2">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.shortDescription}</p>
              </MarketingCard>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'city-service' && serviceSlug && citySlug) {
    const otherCities = CITIES.filter((c) => c.slug !== citySlug).slice(0, 4);
    const otherServices = SERVICES.filter((s) => s.slug !== serviceSlug).slice(0, 3);
    return (
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-sans font-medium text-sm mb-4 text-foreground">
            Same service, nearby cities
          </h2>
          <ul className="space-y-2">
            {otherCities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={cityServicePath(serviceSlug, city.slug)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {SERVICES.find((s) => s.slug === serviceSlug)?.name} in {city.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-sans font-medium text-sm mb-4 text-foreground">
            More services in {CITIES.find((c) => c.slug === citySlug)?.name}
          </h2>
          <ul className="space-y-2">
            {otherServices.map((service) => (
              <li key={service.slug}>
                <Link
                  href={cityServicePath(service.slug, citySlug)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 pt-6 border-t border-border space-y-2">
            <Link href={servicePath(serviceSlug)} className="text-sm font-medium text-foreground hover:text-foreground/70">
              All {SERVICES.find((s) => s.slug === serviceSlug)?.name} areas →
            </Link>
            <Link href={areaPath(citySlug)} className="block text-sm font-medium text-foreground hover:text-foreground/70">
              Cabinets in {CITIES.find((c) => c.slug === citySlug)?.name} →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
