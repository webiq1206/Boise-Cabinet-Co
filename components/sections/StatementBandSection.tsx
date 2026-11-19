import { localAlt } from '@/shared/localAlt';
import Image from "next/image";
import { SITE_IMAGES } from "@/shared/siteImages";

const STATEMENT_BAND_ALT =
  "Living room with white oak built-in shelves and cabinets on each side of a white fireplace with an oak mantel";

/** Full-bleed photography band to break long light section stretches. Shown clean: a wash over a short slice read as a blurred photo. */
export function StatementBandSection() {
  return (
    <section className="relative h-56 md:h-80 lg:h-[26rem] overflow-hidden">
      <Image
        src={SITE_IMAGES.statementBand}
        alt={localAlt(STATEMENT_BAND_ALT)}
        fill
        sizes="100vw"
        className="object-cover img-brand-grade"
      />
    </section>
  );
}
