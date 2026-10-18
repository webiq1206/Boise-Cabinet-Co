import { Check } from "lucide-react";
import { CABINET_LEAD_TIME_LINE, HOW_P5_WORKS, HOW_P5_WORKS_TITLE } from "@/shared/siteContent";

export function HowP5Works({ showLeadTime = false }: { showLeadTime?: boolean }) {
  const lines = showLeadTime ? [...HOW_P5_WORKS, CABINET_LEAD_TIME_LINE] : [...HOW_P5_WORKS];
  return (
    <div>
      <h2 id="how-p5-works" className="text-2xl font-semibold tracking-tight mb-6">
        {HOW_P5_WORKS_TITLE}
      </h2>
      <ul className="grid sm:grid-cols-2 gap-3 m-0 list-none p-0">
        {lines.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
