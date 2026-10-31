import Image from "next/image";
import { publicWarrantyRow } from "@/shared/claims";
import { OSC_CONSTRUCTION, CATALOG_CONTENT } from "@/shared/catalog";
import { SectionHeader } from "@/components/marketing/SectionHeader";

export function ConstructionExplorer() {
  const c = OSC_CONSTRUCTION;
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Cabinet construction"
        title={<>How our cabinets are built</>}
        description={`${c.boxStyle.charAt(0).toUpperCase()}${c.boxStyle.slice(1)}. Built to order for your Treasure Valley home.`}
        align="left"
      />
      <div className="relative w-full aspect-[5/3] max-w-2xl overflow-hidden rounded-lg border bg-card">
        <Image
          src="/generated/construction.svg"
          alt="Diagram of cabinet box construction with frameless and soft-close options"
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-contain"
        />
      </div>
      <div className="ed-grid-balance grid sm:grid-cols-2 gap-4">
        {c.features.map((f) => (
          <div key={f.id} className="rounded-lg border p-4 bg-card">
            <h3 className="font-medium">{f.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.description}</p>
          </div>
        ))}
      </div>
      <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
        <li>{c.hingeType}</li>
        <li>{c.drawerSlides}</li>
        <li>{c.drawerConstruction}</li>
        <li>{c.fillerConstruction}</li>
        <li>{publicWarrantyRow(CATALOG_CONTENT.warrantyHeadline)}</li>
      </ul>
    </div>
  );
}
