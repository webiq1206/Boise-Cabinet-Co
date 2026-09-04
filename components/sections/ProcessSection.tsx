import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing";
import { HOW_WE_BUILD_STEPS } from "@/shared/siteContent";
import { MARKETING_IMAGES } from "@/shared/siteImages";

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`;

/**
 * Our process.
 *
 * WAS a 50/50 split with a 44px heading and 14px step titles - the process
 * rendered smaller than the marketing copy around it.
 *
 * NOW the family's image-and-content panel at 43/57, reversed so the design
 * studio photograph sits on the right and the timeline leads. Each step is a
 * numbered entry with a serif title, so a homeowner can count to five and know
 * what "yes" sets in motion.
 */
export function ProcessSection() {
  return (
    <Section id="how-we-build" surface="deep" spacing="none" edge className="p-0">
      <div className="ed-panel ed-panel-reverse">
        <div className="ed-panel-media">
          <Image
            src={MARKETING_IMAGES.designStudio}
            alt="Custom cabinet door samples, finish swatches, and a kitchen layout rendering laid out during a Boise Cabinet Co design consultation"
            fill
            sizes="(max-width: 820px) 100vw, 43vw"
            className="object-cover img-brand-grade"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: GRAIN_URL, backgroundRepeat: "repeat", opacity: 0.028 }}
          />
          <p className="ed-panel-caption">Design consultation · Meridian studio</p>
        </div>

        <div className="ed-panel-body">
          <Reveal>
            <p className="ed-eyebrow">Our process</p>
            <h2 className="ed-h2-sm ed-statement">
              From design to{" "}
              <em className="not-italic" style={{ color: "var(--ed-accent)" }}>
                installed cabinets
              </em>
            </h2>
          </Reveal>

          <div className="ed-steps mt-[clamp(32px,4vw,56px)]">
            {HOW_WE_BUILD_STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 40}>
                <div className="ed-step">
                  <span className="ed-step-n">{step.number}</span>
                  <div>
                    <h3 className="ed-h4">{step.title}</h3>
                    <p className="ed-body mt-2 text-[0.875rem]">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
