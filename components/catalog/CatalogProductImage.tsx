import Image from "next/image";
import {
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
  const alt = getCatalogProductAlt(name, type === "hardware" ? "hardware" : "accessory");
  const ratio = type === "accessory" ? "aspect-square" : "aspect-[4/3]";

  return (
    <div
      className={`relative ${ratio} overflow-hidden rounded-sm bg-muted ${className ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        title={alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover img-brand-grade"
      />
    </div>
  );
}
