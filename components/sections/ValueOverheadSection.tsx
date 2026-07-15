import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";

const OVERHEAD_COSTS = ["Big offices", "Fancy showrooms", "Fleets of trucks", "Layers of management"];

/**
 * Value-positioning band: our low-overhead model means the budget goes to the
 * home, not to running an expensive company. Placed before the estimator so it
 * frames the pricing conversation.
 */
export function ValueOverheadSection() {
  return (
    <Section id="value" variant="inverse" divider>
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeader
            align="center"
            eyebrow="Where your money goes"
            title={
              <>
                Don&apos;t pay for our overhead.
                <br />
                Pay for the <em className="brc-accent text-accent">cabinets</em>.
              </>
            }
            className="mb-8 [&_.brc-label]:justify-center [&_.brc-label]:text-inverse-muted"
          />

          <Reveal delay={60}>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mb-8 text-inverse-muted/70 text-sm md:text-base">
              {OVERHEAD_COSTS.map((c) => (
                <span key={c} className="whitespace-nowrap">
                  {c}.
                </span>
              ))}
            </div>
            <p className="text-base md:text-lg leading-relaxed text-inverse-foreground/85 max-w-2xl mx-auto mb-4">
              Those costs are not absorbed. They get built into the price and passed down the line. So
              we built our shop lean and put the money where it shows up in the finished space:
              skilled craftsmen, better materials, and workmanship we stand behind.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-inverse-foreground max-w-2xl mx-auto mb-10">
              Every dollar goes into the work, not our overhead. More of your budget lands in the
              finished space, with nothing padded in for a showroom you will never use.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <Button variant="brand" asChild>
              <Link href="/estimate">{CTA_ESTIMATE}</Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
