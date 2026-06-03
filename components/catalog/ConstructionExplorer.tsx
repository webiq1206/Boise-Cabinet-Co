import { OSC_CONSTRUCTION } from "@/shared/catalog";
import { SectionHeader } from "@/components/marketing/SectionHeader";

export function ConstructionExplorer() {
  const c = OSC_CONSTRUCTION;
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Cabinet construction"
        title={<>How One Source cabinets are built</>}
        description={`${c.boxStyle}. Manufactured in ${c.facilities.join(" and ")}.`}
        align="left"
      />
      <div className="grid sm:grid-cols-2 gap-4">
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
        <li>{c.warranty}</li>
      </ul>
    </div>
  );
}
