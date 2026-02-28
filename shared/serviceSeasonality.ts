interface SeasonWindow {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

interface ServiceSeasonConfig {
  seasons: SeasonWindow[];
  nearSeasonBufferDays: number;
  isRecurringEligible: boolean;
  maxFrequency: "weekly" | "bi-weekly" | "monthly" | null;
  recurringLeadPrice?: number;
}

const SERVICE_SEASON_CONFIG: Record<string, ServiceSeasonConfig> = {
  "lawn-mowing": {
    seasons: [{ startMonth: 3, startDay: 15, endMonth: 10, endDay: 31 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: true,
    maxFrequency: "weekly",
    recurringLeadPrice: 45,
  },
  "lawn-maintenance": {
    seasons: [{ startMonth: 3, startDay: 15, endMonth: 10, endDay: 31 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: true,
    maxFrequency: "weekly",
    recurringLeadPrice: 50,
  },
  "weed-control": {
    seasons: [{ startMonth: 4, startDay: 1, endMonth: 9, endDay: 30 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: true,
    maxFrequency: "monthly",
    recurringLeadPrice: 55,
  },
  "hedge-trimming": {
    seasons: [{ startMonth: 4, startDay: 1, endMonth: 10, endDay: 31 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: true,
    maxFrequency: "monthly",
    recurringLeadPrice: 55,
  },
  "fertilization": {
    seasons: [{ startMonth: 3, startDay: 15, endMonth: 11, endDay: 15 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "aeration": {
    seasons: [
      { startMonth: 3, startDay: 15, endMonth: 4, endDay: 30 },
      { startMonth: 9, startDay: 1, endMonth: 10, endDay: 31 },
    ],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "dethatching": {
    seasons: [
      { startMonth: 3, startDay: 15, endMonth: 4, endDay: 30 },
      { startMonth: 9, startDay: 1, endMonth: 10, endDay: 31 },
    ],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "overseeding": {
    seasons: [
      { startMonth: 3, startDay: 15, endMonth: 4, endDay: 30 },
      { startMonth: 9, startDay: 1, endMonth: 10, endDay: 31 },
    ],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "spring-cleanup": {
    seasons: [{ startMonth: 3, startDay: 1, endMonth: 4, endDay: 30 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "fall-cleanup": {
    seasons: [{ startMonth: 10, startDay: 1, endMonth: 11, endDay: 30 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "seasonal-cleanup": {
    seasons: [
      { startMonth: 3, startDay: 1, endMonth: 4, endDay: 30 },
      { startMonth: 10, startDay: 1, endMonth: 11, endDay: 30 },
    ],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "sprinkler-blowout": {
    seasons: [{ startMonth: 10, startDay: 1, endMonth: 11, endDay: 15 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "irrigation-maintenance": {
    seasons: [{ startMonth: 3, startDay: 15, endMonth: 10, endDay: 31 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "sprinkler-repair": {
    seasons: [{ startMonth: 3, startDay: 15, endMonth: 10, endDay: 31 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "sprinkler-system-installation": {
    seasons: [{ startMonth: 4, startDay: 1, endMonth: 10, endDay: 31 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "irrigation-repair": {
    seasons: [{ startMonth: 3, startDay: 15, endMonth: 10, endDay: 31 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "snow-removal": {
    seasons: [{ startMonth: 11, startDay: 1, endMonth: 2, endDay: 28 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "christmas-light-installation": {
    seasons: [{ startMonth: 10, startDay: 1, endMonth: 11, endDay: 30 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "tree-trimming": {
    seasons: [{ startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 }],
    nearSeasonBufferDays: 0,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "tree-removal": {
    seasons: [{ startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 }],
    nearSeasonBufferDays: 0,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "stump-grinding": {
    seasons: [{ startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 }],
    nearSeasonBufferDays: 0,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "landscape-lighting": {
    seasons: [{ startMonth: 1, startDay: 1, endMonth: 12, endDay: 31 }],
    nearSeasonBufferDays: 0,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "mulch-installation": {
    seasons: [
      { startMonth: 4, startDay: 1, endMonth: 6, endDay: 30 },
      { startMonth: 9, startDay: 1, endMonth: 10, endDay: 31 },
    ],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "sod-installation": {
    seasons: [
      { startMonth: 4, startDay: 1, endMonth: 6, endDay: 15 },
      { startMonth: 9, startDay: 1, endMonth: 10, endDay: 31 },
    ],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "patio-installation": {
    seasons: [{ startMonth: 4, startDay: 1, endMonth: 11, endDay: 15 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "retaining-walls": {
    seasons: [{ startMonth: 4, startDay: 1, endMonth: 11, endDay: 15 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "fire-pit-installation": {
    seasons: [{ startMonth: 4, startDay: 1, endMonth: 11, endDay: 15 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "lawn-edging": {
    seasons: [{ startMonth: 4, startDay: 1, endMonth: 10, endDay: 31 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "lawn-renovation": {
    seasons: [
      { startMonth: 4, startDay: 1, endMonth: 5, endDay: 31 },
      { startMonth: 9, startDay: 1, endMonth: 10, endDay: 31 },
    ],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "fence": {
    seasons: [{ startMonth: 4, startDay: 1, endMonth: 11, endDay: 15 }],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
  "gutter-cleaning": {
    seasons: [
      { startMonth: 3, startDay: 1, endMonth: 4, endDay: 30 },
      { startMonth: 10, startDay: 1, endMonth: 11, endDay: 30 },
    ],
    nearSeasonBufferDays: 30,
    isRecurringEligible: false,
    maxFrequency: null,
  },
};

function dateToYearDay(month: number, day: number): number {
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let total = 0;
  for (let m = 1; m < month; m++) {
    total += daysInMonth[m];
  }
  return total + day;
}

function isDateInWindow(month: number, day: number, window: SeasonWindow): boolean {
  const current = dateToYearDay(month, day);
  const start = dateToYearDay(window.startMonth, window.startDay);
  const end = dateToYearDay(window.endMonth, window.endDay);

  if (start <= end) {
    return current >= start && current <= end;
  }
  return current >= start || current <= end;
}

function subtractDays(month: number, day: number, daysToSubtract: number): { month: number; day: number } {
  const date = new Date(2024, month - 1, day);
  date.setDate(date.getDate() - daysToSubtract);
  return { month: date.getMonth() + 1, day: date.getDate() };
}

export function isServiceInSeason(serviceId: string, date?: Date): boolean {
  const config = SERVICE_SEASON_CONFIG[serviceId];
  if (!config) return true;

  const now = date || new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  for (const window of config.seasons) {
    if (isDateInWindow(month, day, window)) return true;

    if (config.nearSeasonBufferDays > 0) {
      const bufferStart = subtractDays(window.startMonth, window.startDay, config.nearSeasonBufferDays);
      const bufferWindow: SeasonWindow = {
        startMonth: bufferStart.month,
        startDay: bufferStart.day,
        endMonth: window.startMonth,
        endDay: window.startDay,
      };
      if (isDateInWindow(month, day, bufferWindow)) return true;
    }
  }

  return false;
}

export function getAvailableServices(date?: Date): string[] {
  return Object.keys(SERVICE_SEASON_CONFIG).filter(id => isServiceInSeason(id, date));
}

export function getServiceSeasonLabel(serviceId: string): string | null {
  const config = SERVICE_SEASON_CONFIG[serviceId];
  if (!config) return null;

  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (config.seasons.length === 1) {
    const s = config.seasons[0];
    if (s.startMonth === 1 && s.startDay === 1 && s.endMonth === 12 && s.endDay === 31) {
      return null;
    }
    return `${monthNames[s.startMonth]} - ${monthNames[s.endMonth]}`;
  }

  return config.seasons
    .map(s => `${monthNames[s.startMonth]} - ${monthNames[s.endMonth]}`)
    .join(", ");
}

export function getRecurringEligibleServices(): Set<string> {
  const result = new Set<string>();
  for (const [id, config] of Object.entries(SERVICE_SEASON_CONFIG)) {
    if (config.isRecurringEligible) {
      result.add(id);
    }
  }
  return result;
}

export function getRecurringLeadPrices(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [id, config] of Object.entries(SERVICE_SEASON_CONFIG)) {
    if (config.isRecurringEligible && config.recurringLeadPrice) {
      result[id] = config.recurringLeadPrice;
    }
  }
  return result;
}

export function getMaxFrequencyForServices(serviceIds: string[]): "weekly" | "bi-weekly" | "monthly" | null {
  let best: "weekly" | "bi-weekly" | "monthly" | null = null;
  const rank = { weekly: 3, "bi-weekly": 2, monthly: 1 };

  for (const id of serviceIds) {
    const config = SERVICE_SEASON_CONFIG[id];
    if (config?.maxFrequency) {
      const current = rank[config.maxFrequency] || 0;
      const bestRank = best ? rank[best] || 0 : 0;
      if (current > bestRank) {
        best = config.maxFrequency;
      }
    }
  }

  return best;
}

export function hasAnyRecurringService(serviceIds: string[]): boolean {
  const eligible = getRecurringEligibleServices();
  return serviceIds.some(id => eligible.has(id));
}

export function getServiceMaxFrequency(serviceId: string): "weekly" | "bi-weekly" | "monthly" | null {
  const config = SERVICE_SEASON_CONFIG[serviceId];
  return config?.maxFrequency || null;
}

export function getServiceDefaultFrequency(serviceId: string): string {
  const config = SERVICE_SEASON_CONFIG[serviceId];
  if (!config?.isRecurringEligible) return "one-time";
  if (config.maxFrequency === "weekly") return "bi-weekly";
  if (config.maxFrequency === "monthly") return "monthly";
  return "one-time";
}

export { SERVICE_SEASON_CONFIG };
export type { ServiceSeasonConfig, SeasonWindow };
