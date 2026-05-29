import Image from "next/image";
import { SITE_IMAGES } from "@/shared/siteImages";

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/2Fsvg%3E")`;

export function StatementBand() {
  return (
    <section className="relative overflow-hidden bg-inverse">
      <Image
        src={SITE_IMAGES.statementBand}
        alt="Finished whole-home remodel interior in the Treasure Valley"
        fill
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-inverse/85 via-inverse/60 to-inverse/30" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: GRAIN_URL, backgroundRepeat: "repeat", opacity: 0.03 }}
      />
      <div className="relative z-10 container px-4 py-28 md:py-40">
        <div className="max-w-2xl">
          <div className="brc-label mb-5 text-inverse-muted">Built to last</div>
          <p className="font-serif font-light text-inverse-foreground text-3xl md:text-5xl leading-tight tracking-tight">
            Spaces designed for how you actually live — and built to{" "}
            <em className="italic text-accent">outlast the guarantee</em>.
          </p>
        </div>
      </div>
    </section>
  );
}
