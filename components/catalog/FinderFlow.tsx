"use client";

/**
 * "Find your look" - a 5-step, image-tap guided finder (no typing):
 *   Room -> Look -> Mood (color) -> Budget feel -> Result.
 * The result is always a curated shortlist (~6 finishes) plus one recommended
 * door, never a single verdict or a dead end. Skippable at any step. Answers
 * persist to sessionStorage so the consultation form can pre-fill them.
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ROOM_CATEGORIES,
  DOOR_STYLE_BY_SLUG,
  narrowCatalog,
  deriveColorFamily,
  getFinishTone,
  getMostLovedFinishes,
  formatPriceTier,
  type Finish,
  type ColorFamily,
  type FinishCategory,
} from "@/shared/catalog";
import { GuidedFlowShell, type GuidedStep } from "@/components/guided-flow";
import { FinishSwatch } from "@/components/catalog/FinishSwatchGrid";
import { DoorStyleHero } from "@/components/catalog/DoorStyleHero";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS: GuidedStep[] = [
  { id: "room", label: "Which room?", shortLabel: "Room" },
  { id: "look", label: "Pick a look", shortLabel: "Look" },
  { id: "mood", label: "Choose a mood", shortLabel: "Mood" },
  { id: "budget", label: "Budget feel", shortLabel: "Budget" },
  { id: "result", label: "Your look", shortLabel: "Result" },
];

interface Look {
  id: string;
  label: string;
  blurb: string;
  door: string;
  finishCategory: FinishCategory;
}

const LOOKS: Look[] = [
  { id: "modern", label: "Sleek & modern", blurb: "Flat slab doors, smooth finishes.", door: "slab", finishCategory: "gloss" },
  { id: "shaker", label: "Classic shaker", blurb: "Framed doors, timeless and warm.", door: "modern-shaker", finishCategory: "matte" },
  { id: "transitional", label: "Transitional", blurb: "A thin shaker frame, soft and current.", door: "thin-shaker", finishCategory: "matte" },
  { id: "wood", label: "Warm & natural", blurb: "Real woodgrain character.", door: "three-piece", finishCategory: "woodgrain" },
];

interface Mood {
  id: string;
  label: string;
  hex: string;
  families?: ColorFamily[];
  tone?: "light" | "dark";
}

const MOODS: Mood[] = [
  { id: "light", label: "Light & airy", hex: "#F2EFE9", tone: "light" },
  { id: "neutral", label: "Warm neutrals", hex: "#D8CFC0", families: ["Beiges"] },
  { id: "grey", label: "Cool greys", hex: "#8A8A8A", families: ["Greys"] },
  { id: "dark", label: "Bold & dark", hex: "#1A1A1A", tone: "dark" },
  { id: "wood", label: "Natural wood", hex: "#9C6B43", families: ["Woods"] },
  { id: "color", label: "Blues & greens", hex: "#3A5A78", families: ["Blues", "Greens"] },
];

interface Budget {
  id: string;
  label: string;
  blurb: string;
  budgetTier?: number;
}

const BUDGETS: Budget[] = [
  { id: "value", label: "Most affordable", blurb: "Our budget-friendly finishes.", budgetTier: 2 },
  { id: "mid", label: "Mid-range", blurb: "A balance of price and choice.", budgetTier: 3 },
  { id: "premium", label: "Premium", blurb: "The full range, including specialty colors.", budgetTier: 5 },
  { id: "any", label: "Show me everything", blurb: "No budget filter.", budgetTier: undefined },
];

interface Answers {
  room?: string;
  look?: string;
  mood?: string;
  budget?: string;
}

function TileButton({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "text-left rounded-lg border bg-card overflow-hidden transition-all hover-elevate",
        active ? "ring-2 ring-accent border-accent" : "border-border",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function FinderFlow() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const rooms = useMemo(() => ROOM_CATEGORIES.slice(0, 8), []);
  const look = LOOKS.find((l) => l.id === answers.look);
  const mood = MOODS.find((m) => m.id === answers.mood);
  const budget = BUDGETS.find((b) => b.id === answers.budget);

  const result = useMemo(() => {
    if (!look) return null;
    const base = narrowCatalog({
      room: answers.room,
      doorStyle: look.door,
      finishCategory: look.finishCategory,
      budgetTier: budget?.budgetTier,
    });
    let finishes: Finish[] = base.finishes;
    if (mood) {
      const moodFinishes = finishes.filter((f) => {
        const famOk = mood.families ? mood.families.includes(deriveColorFamily(f)) : true;
        const toneOk = mood.tone ? getFinishTone(f) === mood.tone : true;
        return famOk && toneOk;
      });
      if (moodFinishes.length >= 4) finishes = moodFinishes;
    }
    let shortlist = finishes.slice(0, 6);
    if (shortlist.length < 6) {
      const loved = getMostLovedFinishes(12).filter(
        (f) => !shortlist.some((s) => s.id === f.id),
      );
      shortlist = [...shortlist, ...loved].slice(0, 6);
    }
    return { shortlist, door: DOOR_STYLE_BY_SLUG[look.door] };
  }, [answers.room, look, mood, budget]);

  const isStepComplete = (i: number) => {
    if (i === 0) return Boolean(answers.room);
    if (i === 1) return Boolean(answers.look);
    if (i === 2) return Boolean(answers.mood);
    if (i === 3) return Boolean(answers.budget);
    return false;
  };

  const canAdvance =
    (index === 0 && answers.room) ||
    (index === 1 && answers.look) ||
    (index === 2 && answers.mood) ||
    (index === 3 && answers.budget) ||
    index === 4;

  function persist() {
    if (typeof window === "undefined" || !result) return;
    try {
      sessionStorage.setItem(
        "brc_finder",
        JSON.stringify({
          room: answers.room,
          look: look?.label,
          mood: mood?.label,
          budget: budget?.label,
          recommendedDoor: result.door?.name,
          recommendedDoorSlug: result.door?.slug,
          finishShortlist: result.shortlist.map((f) => f.slug),
          finishNames: result.shortlist.map((f) => f.name),
        }),
      );
    } catch {
      /* sessionStorage unavailable; non-fatal */
    }
  }

  function next() {
    if (index === 3) persist();
    setIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  // Handoff URL from the result (catalog is the single browse surface now).
  const browseHref = "/catalog";

  const estimateHref = "/estimate";

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/catalog">Skip - show me everything</Link>
        </Button>
      </div>

      <GuidedFlowShell
        steps={STEPS}
        currentIndex={index}
        isStepComplete={isStepComplete}
        onStepClick={(i) => i <= index && setIndex(i)}
        onBack={back}
        onNext={next}
        isFirst={index === 0}
        isLast={index === STEPS.length - 1}
        canAdvance={Boolean(canAdvance)}
        continueLabel="Continue"
        hidePrimaryOnLast
      >
        {/* Step 1: Room */}
        {index === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <TileButton
                key={room.slug}
                active={answers.room === room.slug}
                onClick={() => setAnswers((a) => ({ ...a, room: room.slug }))}
              >
                <div className="relative aspect-[3/2] bg-muted">
                  <Image
                    src={room.heroImage}
                    alt={room.name}
                    fill
                    sizes="(max-width: 640px) 50vw, 200px"
                    className="object-cover"
                  />
                </div>
                <p className="p-3 text-sm font-medium">{room.name}</p>
              </TileButton>
            ))}
          </div>
        )}

        {/* Step 2: Look */}
        {index === 1 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {LOOKS.map((l) => (
              <TileButton
                key={l.id}
                active={answers.look === l.id}
                onClick={() => setAnswers((a) => ({ ...a, look: l.id }))}
              >
                <div className="relative aspect-[4/3] bg-muted">
                  <DoorStyleHero slug={l.door} name={l.label} className="rounded-none" />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium">{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.blurb}</p>
                </div>
              </TileButton>
            ))}
          </div>
        )}

        {/* Step 3: Mood */}
        {index === 2 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {MOODS.map((m) => (
              <TileButton
                key={m.id}
                active={answers.mood === m.id}
                onClick={() => setAnswers((a) => ({ ...a, mood: m.id }))}
              >
                <div className="aspect-[3/2]" style={{ backgroundColor: m.hex }} />
                <p className="p-3 text-sm font-medium">{m.label}</p>
              </TileButton>
            ))}
          </div>
        )}

        {/* Step 4: Budget */}
        {index === 3 && (
          <div className="grid grid-cols-2 gap-4">
            {BUDGETS.map((b) => (
              <TileButton
                key={b.id}
                active={answers.budget === b.id}
                onClick={() => setAnswers((a) => ({ ...a, budget: b.id }))}
                className="p-5"
              >
                <p className="text-base font-medium">{b.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{b.blurb}</p>
                {b.budgetTier && (
                  <p className="text-accent text-sm mt-2">
                    {"$".repeat(Math.min(5, b.budgetTier))} and under
                  </p>
                )}
              </TileButton>
            ))}
          </div>
        )}

        {/* Step 5: Result */}
        {index === 4 && result && (
          <div className="space-y-8">
            <div>
              <p className="brc-label mb-2">Your recommended door</p>
              <MarketingCard className="p-0 overflow-hidden max-w-sm">
                {result.door && (
                  <DoorStyleHero
                    slug={result.door.slug}
                    name={result.door.name}
                    className="rounded-none"
                  />
                )}
                <div className="p-4">
                  <p className="font-medium">{result.door?.name}</p>
                  <p className="text-sm text-muted-foreground">{result.door?.description}</p>
                </div>
              </MarketingCard>
            </div>

            <div>
              <p className="brc-label mb-3">Finishes to start with</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {result.shortlist.map((finish) => (
                  <MarketingCard key={finish.id} className="p-3 flex flex-col gap-2">
                    <FinishSwatch finish={finish} />
                    <p className="text-xs font-medium leading-tight">{finish.name}</p>
                    <p className="text-xs text-accent">{formatPriceTier(finish)}</p>
                  </MarketingCard>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="brand" asChild>
                <Link href={estimateHref} onClick={persist}>
                  Get an estimate <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href={browseHref} onClick={persist}>
                  Browse these finishes
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              This is a starting point, not a final selection. You can change anything
              with our team.
            </p>
          </div>
        )}
      </GuidedFlowShell>
    </div>
  );
}
