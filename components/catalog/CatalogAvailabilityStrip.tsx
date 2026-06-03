import Link from "next/link";
import { Chip } from "@/components/marketing/Chip";

export interface AvailabilityItem {
  label: string;
  href?: string;
}

export interface CatalogAvailabilityStripProps {
  collections?: AvailabilityItem[];
  doorStyles?: AvailabilityItem[];
  finishCount?: number;
  productCount?: number;
  specs?: string[];
}

export function CatalogAvailabilityStrip({
  collections = [],
  doorStyles = [],
  finishCount,
  productCount,
  specs = [],
}: CatalogAvailabilityStripProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {finishCount != null && (
        <Chip>{finishCount} finishes</Chip>
      )}
      {productCount != null && (
        <Chip>{productCount} configurations</Chip>
      )}
      {collections.map((c) =>
        c.href ? (
          <Link key={c.label} href={c.href}>
            <Chip className="hover:bg-muted cursor-pointer">{c.label}</Chip>
          </Link>
        ) : (
          <Chip key={c.label}>{c.label}</Chip>
        ),
      )}
      {doorStyles.slice(0, 4).map((d) =>
        d.href ? (
          <Link key={d.label} href={d.href}>
            <Chip className="hover:bg-muted cursor-pointer capitalize">{d.label}</Chip>
          </Link>
        ) : (
          <Chip key={d.label} className="capitalize">{d.label}</Chip>
        ),
      )}
      {specs.map((s) => (
        <Chip key={s} className="text-xs opacity-80">
          {s}
        </Chip>
      ))}
    </div>
  );
}
