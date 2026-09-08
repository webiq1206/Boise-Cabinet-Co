import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CASE_STUDIES } from "@/shared/caseStudies";

export function CaseStudiesSection() {
  const hasConcept = CASE_STUDIES.some((s) => s.kind === "concept");
  const allVerified = CASE_STUDIES.length > 0 && !hasConcept;
  const description = allVerified
    ? "Detailed kitchen, bath, and whole-home projects completed for Treasure Valley homeowners, with scope, timeline, and finish details."
    : "Representative kitchen, bath, and whole-home scenarios drawn from typical Treasure Valley projects and our published planning ranges. Images are illustrative design renderings, not photographs of specific completed homes.";

  return (
    <Section divider>
      <div className="container px-4 max-w-5xl">
        <SectionHeader
          eyebrow={allVerified ? "Project case studies" : "Representative scenarios"}
          title={
            <>
              Detailed looks at{" "}
              <em className="brc-accent text-accent">Treasure Valley</em> cabinet
              work
            </>
          }
          description={description}
          align="left"
          className="mb-10"
        />
        <div className="space-y-12">
          {CASE_STUDIES.map((study) => (
            <article
              key={study.slug}
              className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-muted">
                <Image
                  src={study.imageUrl}
                  alt={study.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover img-brand-grade"
                />
                {study.kind === "concept" && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-sm bg-inverse/75 backdrop-blur-sm text-inverse-foreground text-[12px] tracking-[0.14em] uppercase font-medium">
                    Illustrative rendering
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">
                  {study.area}, Idaho · {study.service}
                </p>
                <h3 className="text-xl font-serif font-medium text-foreground mb-2">
                  {study.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{study.scope}</p>
                <p className="text-sm text-foreground/90 mb-3">
                  <strong>Challenge:</strong> {study.challenge}
                </p>
                <p className="text-sm text-foreground/90 mb-3">
                  <strong>Approach:</strong> {study.approach}
                </p>
                <p className="text-sm text-foreground/90 mb-4">
                  <strong>Outcome:</strong> {study.outcome}
                </p>
                <dl className="ed-grid-balance grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                  {study.details.map((d) => (
                    <div key={d.label}>
                      <dt className="text-muted-foreground">{d.label}</dt>
                      <dd className="text-foreground">{d.value}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {study.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="tap-target text-accent hover:underline underline-offset-2"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
