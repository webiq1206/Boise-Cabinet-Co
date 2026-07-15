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
                Pay for your <em className="brc-accent text-accent">home</em>.
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
              Those costs are not absorbed. They get built into your project. So we built our
              company differently. Instead of expensive overhead, we invest where it actually shows
              up in your home: skilled craftsmen, better materials, and workmanship we stand behind.
            </p>
            <p className="text-base md:text-lg leading-relaxed text-inverse-foreground max-w-2xl mx-auto mb-10">
              Every dollar you invest should go toward your project, not our bills. Get more home for
              what you spend.
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
