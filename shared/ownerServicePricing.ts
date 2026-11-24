export const OWNER_SERVICE_RATE = 120;
export const LEGACY_DIRECT_COST_FACTOR = 1.618;
export const OWNER_SERVICE_PRICING_VERSION = "owner-services-2026-11-23-v1";

export const OWNER_SERVICES = [
  { code: "01-31-03", label: "Project management", qboItemId: 48, hoursPerThousand: 0.5, minimumHours: 0.25 },
  { code: "01-31-04", label: "Project administration", qboItemId: 49, hoursPerThousand: 0.2, minimumHours: 0.125 },
  { code: "01-31-05", label: "Project accounting", qboItemId: 47, hoursPerThousand: 0.1, minimumHours: 0.125 },
] as const;

export const PROJECT_MILESTONES = [
  { id: "planning", label: "Planning and scope" },
  { id: "procurement", label: "Procurement and readiness" },
  { id: "execution", label: "Installation and coordination" },
  { id: "closeout", label: "Completion and accounting" },
] as const;

export type OwnerServiceCode = (typeof OWNER_SERVICES)[number]["code"];
export type ProjectMilestone = (typeof PROJECT_MILESTONES)[number]["id"];
export type OwnerServiceOverrides = Partial<Record<OwnerServiceCode, Partial<Record<ProjectMilestone, number>>>>;
export type OwnerServiceBasisLine = {
  id?: unknown;
  code?: unknown;
  reference?: unknown;
  description?: unknown;
  trade?: unknown;
  category?: unknown;
  cost?: unknown;
  sellingAmount?: unknown;
  quantity?: unknown;
  unitCost?: unknown;
  ownerLaborTreatment?: unknown;
  milestone?: unknown;
  allowance?: unknown;
  evidence?: { reference?: unknown; basis?: unknown };
};

export type OwnerServiceLine = {
  code: OwnerServiceCode;
  qboItemId: number;
  service: string;
  milestone: ProjectMilestone;
  milestoneLabel: string;
  hours: number;
  rate: 120;
  amount: number;
};

export type OwnerServicePricing = {
  baseDirectCost: number;
  lines: OwnerServiceLine[];
  ownerLaborCredits: Array<{ source: string; amount: number }>;
  creditAmount: number;
  grossAmount: number;
  totalAmount: number;
  milestoneWeights: Record<ProjectMilestone, number>;
  version: typeof OWNER_SERVICE_PRICING_VERSION;
};

export type EstimateWithOwnerServices = {
  directCost: number;
  contractPrice: number;
  planningRange: { low: number; high: number };
  planningBandHigh: number;
  lines: readonly OwnerServiceBasisLine[];
};

const finiteNonNegative = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
const text = (value: unknown): string => typeof value === "string" ? value : "";
const roundHours = (hours: number): number => Math.round((hours + Number.EPSILON) * 1_000_000) / 1_000_000;
const roundMoney = (amount: number): number => Math.round((amount + Number.EPSILON) * 100) / 100;
const milestoneLabel = (id: ProjectMilestone) => PROJECT_MILESTONES.find((item) => item.id === id)!.label;

function lineCost(line: OwnerServiceBasisLine): number {
  if (typeof line.cost === "number" && Number.isFinite(line.cost)) return Math.max(0, line.cost);
  return finiteNonNegative(line.quantity) * finiteNonNegative(line.unitCost);
}

function lineCode(line: OwnerServiceBasisLine): string {
  return [line.code, line.id, line.reference, line.evidence?.reference].map(text).join(" ");
}

function isPriorOwnerLabor(line: OwnerServiceBasisLine): boolean {
  return /\b01-31-0[12]\b/.test(lineCode(line)) ||
    (line.ownerLaborTreatment === "included-in-overhead" &&
      /supervis|owner|management|salary/i.test(`${text(line.category)} ${text(line.description)}`));
}

function isOwnerService(line: OwnerServiceBasisLine): boolean {
  return /\b01-31-0[345]\b/.test(lineCode(line));
}

function isTaxOrIndirect(line: OwnerServiceBasisLine): boolean {
  const value = `${text(line.category)} ${text(line.description)} ${lineCode(line)}`.toLowerCase();
  return /\b(?:tax(?:es)?|overhead|profit|contingency|markup|margin)\b/.test(value);
}

function isExcludedOwnerAllowance(line: OwnerServiceBasisLine): boolean {
  const value = `${text(line.category)} ${text(line.description)} ${lineCode(line)}`.toLowerCase();
  return Boolean(line.allowance) &&
    /\b(?:owner|supervision|management|project administration|project accounting)\b/.test(value);
}

export function milestoneForBasisLine(line: OwnerServiceBasisLine): ProjectMilestone {
  if (PROJECT_MILESTONES.some((item) => item.id === line.milestone)) return line.milestone as ProjectMilestone;
  const value = `${text(line.category)} ${text(line.trade)} ${text(line.description)}`.toLowerCase();
  if (/\b(closeout|punch.?list|final clean|warranty|completion|accounting)\b/.test(value)) return "closeout";
  if (/\b(material|cabinet|countertop|hardware|supplier|delivery|freight|procure|selection|order)\b/.test(value)) return "procurement";
  if (/\b(plan|design|permit|engineering|survey|measure|mobiliz|protect|demolition|demo|site prep)\b/.test(value)) return "planning";
  return "execution";
}

/**
 * Computes the additive owner-service charge from outside direct job cost.
 * These lines are final selling-rate additions, not direct costs, and must not
 * pass through contingency, overhead, or profit a second time.
 */
export function calculateOwnerServicePricing(input: {
  lines?: readonly OwnerServiceBasisLine[];
  baseDirectCost?: number;
  /** Optional pre-owner direct estimate for paths without a detailed cost book. */
  fallbackDirectCost?: number;
  overrides?: OwnerServiceOverrides | null;
}): OwnerServicePricing {
  const lines = input.lines || [];
  const overrides = input.overrides || {};
  for (const [code, milestones] of Object.entries(overrides)) {
    if (!OWNER_SERVICES.some((service) => service.code === code)) throw new Error(`Unknown owner service override: ${code}.`);
    if (!milestones || typeof milestones !== "object" || Array.isArray(milestones)) {
      throw new Error(`Owner service override for ${code} must map milestones to positive hours.`);
    }
    for (const [milestone, hours] of Object.entries(milestones)) {
      if (!PROJECT_MILESTONES.some((item) => item.id === milestone)) throw new Error(`Unknown project milestone override: ${milestone}.`);
      if (typeof hours !== "number" || !Number.isFinite(hours) || hours <= 0 || hours > 10000) {
        throw new Error(`Owner service override for ${code} must be positive hours.`);
      }
    }
  }
  const milestoneWeights: Record<ProjectMilestone, number> = {
    planning: 0, procurement: 0, execution: 0, closeout: 0,
  };
  let base = 0;
  const creditsBySource = new Map<string, number>();
  for (const line of lines) {
    const amount = lineCost(line);
    if (amount <= 0) continue;
    if (isPriorOwnerLabor(line)) {
      const source = lineCode(line).match(/\b01-31-0[12]\b/)?.[0] ||
        text(line.id) || text(line.description) || "included owner labor";
      // 01-31-01/02 can describe the same owner's overlapping time. Keep one
      // credit per source; the project-level credit is capped below.
      const charged = finiteNonNegative(line.sellingAmount) || amount;
      creditsBySource.set(source, Math.max(creditsBySource.get(source) || 0, charged));
      continue;
    }
    if (isOwnerService(line) || isTaxOrIndirect(line) || isExcludedOwnerAllowance(line) ||
      line.ownerLaborTreatment === "included-in-overhead") continue;
    base += amount;
    milestoneWeights[milestoneForBasisLine(line)] += amount;
  }
  if (base <= 0) {
    base = finiteNonNegative(input.baseDirectCost) || finiteNonNegative(input.fallbackDirectCost);
  }
  if (base > 0 && Object.values(milestoneWeights).every((value) => value === 0)) {
    // The local range calculator has no line-level phase costs, so its project
    // base is allocated equally across the four milestones.
    for (const milestone of PROJECT_MILESTONES) milestoneWeights[milestone.id] = base / PROJECT_MILESTONES.length;
  } else {
    const weightedTotal = Object.values(milestoneWeights).reduce((sum, value) => sum + value, 0);
    if (weightedTotal > 0 && base > weightedTotal) {
      const scale = base / weightedTotal;
      for (const milestone of PROJECT_MILESTONES) milestoneWeights[milestone.id] *= scale;
    }
  }
  const activeMilestones = PROJECT_MILESTONES.filter((milestone) => milestoneWeights[milestone.id] > 0);
  const defaultMilestones = activeMilestones.length ? activeMilestones : [...PROJECT_MILESTONES];
  const creditRows = [...creditsBySource].map(([source, amount]) => ({ source, amount: roundMoney(amount) }));
  const linesOut: OwnerServiceLine[] = [];
  let grossAmount = 0;

  for (const service of OWNER_SERVICES) {
    const defaultHours = Math.max(service.minimumHours, (base / 1000) * service.hoursPerThousand);
    const override = input.overrides?.[service.code] || {};
    const overrideEntries = Object.entries(override).filter(([milestone, hours]) =>
      PROJECT_MILESTONES.some((item) => item.id === milestone) && hours !== undefined);
    for (const [, hours] of overrideEntries) {
      if (typeof hours !== "number" || !Number.isFinite(hours) || hours <= 0 || hours > 10000) {
        throw new Error(`Owner service override for ${service.code} must be positive hours.`);
      }
    }
    const overriddenHours = overrideEntries.reduce((sum, [, hours]) => sum + Number(hours), 0);
    const remainingHours = Math.max(0, defaultHours - overriddenHours);
    const overriddenMilestones = overrideEntries
      .map(([milestone]) => PROJECT_MILESTONES.find((item) => item.id === milestone)!)
      .filter(Boolean);
    const milestones = [...new Map([...defaultMilestones, ...overriddenMilestones].map((item) => [item.id, item])).values()];
    const remainingMilestones = milestones.filter((milestone) => override[milestone.id] === undefined);
    const remainingWeight = remainingMilestones.reduce((sum, milestone) => sum + milestoneWeights[milestone.id], 0);
    const defaultMilestoneHours = new Map<ProjectMilestone, number>();
    let assignedDefaultHours = 0;
    for (const milestone of milestones) {
      if (override[milestone.id] !== undefined) {
        defaultMilestoneHours.set(milestone.id, roundHours(Number(override[milestone.id])));
      } else if (remainingMilestones.length) {
        const index = remainingMilestones.findIndex((item) => item.id === milestone.id);
        if (index >= 0) {
          const share = remainingWeight > 0
            ? milestoneWeights[milestone.id] / remainingWeight
            : 1 / remainingMilestones.length;
          const hours = index === remainingMilestones.length - 1
            ? roundHours(remainingHours - assignedDefaultHours)
            : roundHours(remainingHours * share);
          defaultMilestoneHours.set(milestone.id, hours);
          assignedDefaultHours += hours;
        }
      }
    }
    const serviceLines: Omit<OwnerServiceLine, "amount">[] = [];
    for (const milestone of milestones) {
      const hours = roundHours(defaultMilestoneHours.get(milestone.id) || 0);
      if (hours <= 0) continue;
      serviceLines.push({
        code: service.code,
        qboItemId: service.qboItemId,
        service: service.label,
        milestone: milestone.id,
        milestoneLabel: milestone.label,
        hours,
        rate: OWNER_SERVICE_RATE,
      });
    }
    const serviceAmount = roundMoney(serviceLines.reduce((sum, line) => sum + line.hours, 0) * OWNER_SERVICE_RATE);
    let assignedAmount = 0;
    serviceLines.forEach((line, index) => {
      const amount = index === serviceLines.length - 1
        ? roundMoney(serviceAmount - assignedAmount)
        : roundMoney(line.hours * OWNER_SERVICE_RATE);
      assignedAmount += amount;
      grossAmount += amount;
      linesOut.push({ ...line, amount });
    });
  }
  // The two legacy supervision rows may represent the same owner's time.
  // Credit the larger recognized allowance once rather than stacking them.
  const creditAmount = roundMoney(Math.max(0, ...creditRows.map((row) => row.amount)));
  const appliedCredit = roundMoney(Math.min(grossAmount, creditAmount));
  const totalAmount = roundMoney(Math.max(0, grossAmount - appliedCredit));
  return {
    baseDirectCost: roundMoney(base),
    lines: linesOut,
    ownerLaborCredits: creditRows,
    creditAmount: appliedCredit,
    grossAmount: roundMoney(grossAmount),
    totalAmount,
    milestoneWeights: Object.fromEntries(PROJECT_MILESTONES.map((item) => [
      item.id, roundMoney(milestoneWeights[item.id]),
    ])) as Record<ProjectMilestone, number>,
    version: OWNER_SERVICE_PRICING_VERSION,
  };
}

/** Append exact final-rate services after the base estimate's markup calculation. */
export function applyOwnerServicesToEstimate<T extends EstimateWithOwnerServices>(
  estimate: T,
  overrides?: OwnerServiceOverrides | null,
): T & { ownerServices: OwnerServicePricing; ownerServiceReconciliation: number } {
  const priorOwnerLines = estimate.lines.filter(isOwnerService);
  const priorOwnerLaborLines = estimate.lines.filter(isPriorOwnerLabor);
  const priorOwnerSelling = priorOwnerLines.reduce((sum, line) => sum + finiteNonNegative(line.sellingAmount), 0);
  const priorOwnerDirect = priorOwnerLines.reduce((sum, line) => sum + lineCost(line), 0);
  const priorOwnerLaborDirect = priorOwnerLaborLines.reduce((sum, line) => sum + lineCost(line), 0);
  const baseEstimate = {
    ...estimate,
    lines: estimate.lines.filter((line) => !isOwnerService(line)),
    directCost: Math.max(0, estimate.directCost - priorOwnerDirect - priorOwnerLaborDirect),
    contractPrice: Math.max(0, estimate.contractPrice - priorOwnerSelling),
    planningRange: {
      low: Math.max(0, estimate.planningRange.low - priorOwnerSelling),
      high: Math.max(0, estimate.planningRange.high - priorOwnerSelling),
    },
    planningBandHigh: Math.max(0, estimate.planningBandHigh - priorOwnerSelling),
  };
  const ownerServices = calculateOwnerServicePricing({
    lines: baseEstimate.lines,
    baseDirectCost: baseEstimate.directCost,
    overrides,
  });
  return {
    ...baseEstimate,
    contractPrice: baseEstimate.contractPrice + ownerServices.totalAmount,
    planningRange: {
      low: baseEstimate.planningRange.low + ownerServices.totalAmount,
      high: baseEstimate.planningRange.high + ownerServices.totalAmount,
    },
    planningBandHigh: baseEstimate.planningBandHigh + ownerServices.totalAmount,
    ownerServices,
    ownerServiceReconciliation: ownerServices.totalAmount - (ownerServices.grossAmount - ownerServices.creditAmount),
  };
}
