import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/marketing/Section";
import { Button } from "@/components/ui/button";
import { ROOM_CATEGORIES } from "@/shared/catalog/roomCategories";
import { CTA_ESTIMATE } from "@/shared/ctaCopy";

/**
 * Cabinet solutions by room.
 *
 * WAS eight identical cards in a four-column grid with 16px room names: the
 * arrangement the redesign brief singles out. Nothing told you which room
 * mattered and the type was too small to skim.
 *
 * NOW the lead room gets a full-height photograph and a display-size name, and
 * the remaining rooms become a hairline matrix - one bordered object rather
 * than seven floating ones - whose cells carry a serif name over a one-line
 * description and invert to bone on hover. A homeowner scanning for "do they
 * do closets" reads one grid instead of eight cards.
 */
export function RoomCategoriesGrid() {
  const [lead, ...rest] = ROOM_CATEGORIES.slice(0, 8);
  if (!lead) return null;

  return (
    <Section id="cabinets" surface="dark" spacing="xl">
      <div className="ed-shell">
        <div className="ed-split ed-split-end">
          <Reveal>
            <p className="ed-eyebrow">Cabinet solutions</p>
            <h2 className="ed-h2 ed-statement-wide">
              Custom cabinetry for every{" "}
              <em className="not-italic" style={{ color: "var(--ed-accent)" }}>
                room
              </em>
            </h2>
          </Reveal>
          <Reveal delay={60}>
            <p className="ed-body">
              From kitchen and bath to mudroom, closet and garage, every cabinet is
              made to order with your choice of door style, finish and hardware.
            </p>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <Link
            href={`/cabinets/${lead.slug}`}
            className="ed-zoom group mt-[clamp(48px,6vw,88px)] grid overflow-hidden lg:grid-cols-[1.2fr_0.8fr]"
            style={{ border: "1px solid var(--ed-line)" }}
          >
            <div className="relative min-h-[clamp(280px,38vw,460px)] overflow-hidden">
              <Image
                src={lead.heroImage}
                alt={`${lead.name} custom cabinets`}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-[clamp(28px,3.4vw,56px)]">
              <p className="ed-eyebrow ed-eyebrow-accent">Most requested</p>
              <h3 className="ed-h2-sm">{lead.name}</h3>
              <p className="ed-body mt-5">{lead.description}</p>
              <span className="ed-link ed-link-accent mt-8 self-start">
                Explore {lead.name.toLowerCase()} cabinets
                <svg className="ed-arrow" viewBox="0 0 22 15" fill="none" aria-hidden="true">
                  <path d="M0 7.5h20M14 1.5l6 6-6 6" />
                </svg>
              </span>
            </div>
          </Link>
        </Reveal>

        <Reveal delay={120}>
          <div
            className="ed-matrix ed-matrix-hover mt-[clamp(32px,4vw,56px)]"
            style={{ ["--ed-cols" as string]: 4, ["--ed-cell-h" as string]: "210px" }}
          >
            {rest.map((room) => (
              <Link
                key={room.slug}
                href={`/cabinets/${room.slug}`}
                className="group flex flex-col justify-between"
              >
                <span className="ed-arrow self-end transition-transform group-hover:translate-x-1">
                  <svg viewBox="0 0 22 15" fill="none" className="h-[14px] w-[20px]" aria-hidden="true">
                    <path d="M0 7.5h20M14 1.5l6 6-6 6" />
                  </svg>
                </span>
                <span>
                  <h3 className="ed-h4">{room.name}</h3>
                  <p className="ed-small mt-2 line-clamp-2" style={{ color: "inherit", opacity: 0.72 }}>
                    {room.description}
                  </p>
                </span>
              </Link>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 [&>*]:w-full sm:[&>*]:w-auto">
          <Button variant="brand" asChild>
            <Link href="/estimate">{CTA_ESTIMATE}</Link>
          </Button>
          <Button variant="brandOutline" asChild>
            <Link href="/cabinets">View all rooms</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
