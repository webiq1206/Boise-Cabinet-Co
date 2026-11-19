import { localAlt } from '@/shared/localAlt';
import Image from "next/image";
import {
  getAccessoryImageDescription,
  getAccessoryImagePath,
  getCatalogProductAlt,
  getHardwareImagePath,
} from "@/shared/catalog/catalogImages";

interface CatalogProductImageProps {
  slug: string;
  name: string;
  type: "hardware" | "accessory";
  className?: string;
}

export function CatalogProductImage({
  slug,
  name,
  type,
  className,
}: CatalogProductImageProps) {
  const src =
    type === "hardware" ? getHardwareImagePath(slug) : getAccessoryImagePath(slug);
  // An accessory's alt says what its picture shows; hardware keeps its product name.
  const alt = type === "hardware" ? getCatalogProductAlt(name, "hardware") : getAccessoryImageDescription(slug, name);
  const ratio = type === "accessory" ? "aspect-square" : "aspect-[4/3]";

  return (
    <div
      className={`relative ${ratio} overflow-hidden rounded-sm bg-muted ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={localAlt(alt)}
        title={name}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover img-brand-grade"
      />
    </div>
  );
}
