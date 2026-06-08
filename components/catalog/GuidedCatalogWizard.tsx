"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { narrowCatalog, getRecommendations } from "@/shared/catalog";
import type { FinishCategory, CabinetProductCategory } from "@/shared/catalog";
import { FinishSwatchGrid } from "@/components/catalog/FinishSwatchGrid";
import { ROOM_CATEGORIES } from "@/shared/catalog/roomCategories";
import { DOOR_STYLES } from "@/shared/catalog/doorStyles";
import { COLLECTIONS } from "@/shared/catalog/collections";

const STEPS = ["room", "collection", "doorStyle", "finish", "results"] as const;

export function GuidedCatalogWizard() {
  const [step, setStep] = useState(0);
  const [room, setRoom] = useState("");
  const [collection, setCollection] = useState("");
  const [doorStyle, setDoorStyle] = useState("");
  const [finishCategory, setFinishCategory] = useState<FinishCategory | "">("");

  const input = {
    collection: collection || undefined,
    doorStyle: doorStyle || undefined,
    finishCategory: finishCategory || undefined,
  };
  const rec = getRecommendations(input);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <p className="text-sm text-muted-foreground">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      {step === 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {ROOM_CATEGORIES.slice(0, 8).map((r) => (
            <button
              key={r.slug}
              type="button"
              className={`rounded-lg border p-4 text-left hover:border-primary ${room === r.slug ? "border-primary bg-primary/5" : ""}`}
              onClick={() => setRoom(r.slug)}
            >
              <span className="font-medium">{r.name}</span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {COLLECTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`rounded-lg border p-4 text-left hover:border-primary ${collection === c.id ? "border-primary bg-primary/5" : ""}`}
              onClick={() => setCollection(c.id)}
            >
              <span className="font-medium">{c.name}</span>
              <p className="text-xs text-muted-foreground mt-1">{c.tagline}</p>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {DOOR_STYLES.map((d) => (
            <button
              key={d.slug}
              type="button"
              className={`rounded-lg border p-4 text-left hover:border-primary ${doorStyle === d.slug ? "border-primary bg-primary/5" : ""}`}
              onClick={() => setDoorStyle(d.slug)}
            >
              <span className="font-medium">{d.name}</span>
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-wrap gap-2">
          {(["matte", "gloss", "woodgrain"] as FinishCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`rounded-full border px-4 py-2 capitalize ${finishCategory === cat ? "border-primary bg-primary/5" : ""}`}
              onClick={() => setFinishCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <FinishSwatchGrid finishes={rec.topFinishes} />
          <p className="text-sm text-muted-foreground">
            {rec.topProducts.length} cabinet configurations match your choices.
          </p>
          <Button variant="brand" asChild>
            <Link href="/estimate">
              Get an estimate
            </Link>
          </Button>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
        ) : null}
      </div>
    </div>
  );
}
