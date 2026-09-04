import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/Section";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";

const OVERHEAD_COSTS = ["Big offices", "Fancy showrooms", "Fleets of trucks", "Layers of management"];

/**
 * Value-positioning band: our low-overhead model means the budget goes to the
 * cabinets, not to running an expensive company. Placed before the estimator so
 * it frames the pricing conversation.
 *
 * WAS a centred column. NOW the family's asymmetric split: the heading on the
 * left at h2 scale, the argument on the right as a lede and a short body, with
 * the four overhead costs set as a hairline strip so they read as the things
 * you are NOT paying for.
 */
export function ValueOverheadSection() {
  return (
    <Section id="value" surface="deep" spacing="xl" edge>
      <div className="ed-shell">
        <div className="ed-split">
          <Reveal>
            <p className="ed-eyebrow">Where your money goes</p>
            <h2 className="ed-h2 ed-statement">
              Don&apos;t pay for our overhead.
              <br />
              Pay for the{" "}
              <em className="not-italic" style={{ color: "var(--ed-accent)" }}>
                cabinets
              </em>
              .
            </h2>
          </Reveal>

          <Reveal delay={60}>
            <p className="ed-lede">
              Those costs are not absorbed. They get built into the price and passed
              down the line.
            </p>
            <p className="ed-body mt-5">
              So we built our shop lean and put the money where it shows up in the
              finished space: skilled craftsmen, better materials, and workmanship
              we stand behind. More of your budget lands in the room, with nothing
              padded in for a showroom you will never use.
            </p>
            <div className="mt-8">
              <Button variant="brand" asChild>
                <Link href="/estimate">{CTA_ESTIMATE}</Link>
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div
            className="ed-matrix mt-[clamp(40px,5vw,72px)]"
            style={{ ["--ed-cols" as string]: 4, ["--ed-cell-h" as string]: "0" }}
          >
            {OVERHEAD_COSTS.map((c, i) => (
              <div key={c} className="flex items-baseline gap-4">
                <span className="ed-small" style={{ color: "var(--ed-accent)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="ed-h4 line-through decoration-1" style={{ textDecorationColor: "var(--ed-accent)" }}>
                  {c}
                </span>
              </div>
            ))}
          </div>
          <p className="ed-small mt-4">Not in your price. Not in our shop.</p>
        </Reveal>
      </div>
    </Section>
  );
}
