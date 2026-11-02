import { publicWarrantyRow } from "@/shared/claims";
import { OSC_CONSTRUCTION, CATALOG_CONTENT } from "@/shared/catalog";

/**
 * Cabinet construction specification: a numbered hairline matrix of the box
 * features, then the hardware and warranty specification as a ruled two-column
 * list. Its heading is distinct from the page H1 ("How our cabinets are built"),
 * so the page never repeats the same line twice in one screen.
 */
export function ConstructionExplorer() {
  const c = OSC_CONSTRUCTION;
  const box = `${c.boxStyle.charAt(0).toUpperCase()}${c.boxStyle.slice(1)}`;
  const spec = [
    c.hingeType,
    c.drawerSlides,
    c.drawerConstruction,
    c.fillerConstruction,
    publicWarrantyRow(CATALOG_CONTENT.warrantyHeadline),
  ].filter(Boolean);
  return (
    <div>
      <p className="ed-eyebrow">Cabinet construction</p>
      <h2 className="ed-h2 ed-statement">What is inside every box.</h2>
      <p className="ed-lede mt-6 max-w-[46ch]">{box}. Built to order for your Treasure Valley home.</p>
      <ul className="ed-matrix mt-12 list-none p-0" style={{ "--ed-cell-h": "190px" } as React.CSSProperties}>
        {c.features.map((f, i) => (
          <li key={f.id} className="flex flex-col gap-4">
            <span className="ed-step-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="ed-h4">{f.label}</h3>
            <p className="ed-body text-[0.9375rem]">{f.description}</p>
          </li>
        ))}
      </ul>
      <div className="ed-split ed-split-narrow mt-14">
        <h3 className="ed-h3">Hardware and warranty specification</h3>
        <ul className="list-none p-0 border-t" style={{ borderColor: "var(--ed-line)" }}>
          {spec.map((item) => (
            <li key={item} className="ed-body border-b py-4 text-[0.9375rem]" style={{ borderColor: "var(--ed-line)" }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
