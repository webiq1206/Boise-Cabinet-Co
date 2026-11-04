import Image from "next/image";
import Link from "next/link";
import { ProjectDetailStrip } from "@/components/marketing/ProjectDetailStrip";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CASE_STUDIES } from "@/shared/caseStudies";

export function CaseStudiesSection() {
  const description = "Compare cabinet layouts, materials, storage, and planning ranges for kitchens, bathrooms, and whole-home cabinetry.";

  return (
    <Section divider>
      <div className="container px-4 max-w-5xl">
        <SectionHeader
          eyebrow="Design details"
          title={
            <>
              Cabinetry for{" "}
              <em className="brc-accent text-accent">Treasure Valley</em> homes
            </>
          }
          description={description}
          align="left"
          className="mb-10"
        />
        <div className="space-y-16">
          {CASE_STUDIES.map((study) => (
            <article
              key={study.slug}
              className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start"
            >
              <div className="space-y-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-muted">
                  <Image
                    src={study.imageUrl}
                    alt={study.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover img-brand-grade"
                  />
                </div>
                {study.detailImages.length > 0 ? (
                  <ProjectDetailStrip
                    images={study.detailImages}
                    label="Design details"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">
                  {study.service}
                </p>
                <h3 className="ed-h3 text-foreground mb-2">
                  {study.title}
                </h3>
                <p className="ed-body text-muted-foreground mb-4">{study.scope}</p>
                <p className="ed-body text-foreground/90 mb-3">
                  <strong>Planning consideration:</strong> {study.challenge}
                </p>
                <p className="ed-body text-foreground/90 mb-3">
                  <strong>Cabinet layout:</strong> {study.approach}
                </p>
                <p className="ed-body text-foreground/90 mb-4">
                  <strong>Storage and finish details:</strong> {study.outcome}
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
