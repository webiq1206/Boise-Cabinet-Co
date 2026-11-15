import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEstimate, type ConstructionTier, type EstimateSelections } from '../shared/estimateEngine.ts';
import { priceBookRates, sharedBookRate, type FinishTier } from '../lib/p5/priceBook.ts';

/**
 * The cabinet wizard and the shared estimator both read the v2 cost book.
 * Totals below are the book's direct costs for these quantities. remodel is
 * false, matching cabinet-install.
 */
const LEVELS: Array<{ wizard: ConstructionTier; finish: string; tier: FinishTier }> = [
  { wizard: 'essential', finish: 'refresh', tier: 'builder' },
  { wizard: 'signature', finish: 'mid-range', tier: 'mid' },
  { wizard: 'premium', finish: 'high-end', tier: 'high' },
  { wizard: 'luxury', finish: 'luxury', tier: 'luxury' },
];

type Line = { code: string; feet: number };
type Scenario = { name: string; room: EstimateSelections; lines: Line[]; totals: Record<ConstructionTier, number> };

const kitchen = (size: number, sizeUpper: number, construction: ConstructionTier): EstimateSelections => ({
  project: 'kitchen', layout: 'galley', size, sizeUpper, doorStyle: 'slab', finishSlug: '',
  finishCategory: 'matte', finishTier: 'standard', construction,
});

const SCENARIOS: Scenario[] = [
  {
    name: 'Kitchen, 10 lf base and no uppers',
    room: kitchen(10, 0, 'essential'),
    lines: [{ code: '12-32-01', feet: 10 }],
    totals: { essential: 2050, signature: 3450, premium: 5700, luxury: 8950 },
  },
  {
    name: 'Kitchen, 24 lf base and 18 lf uppers',
    room: kitchen(24, 18, 'essential'),
    lines: [{ code: '12-32-01', feet: 24 }, { code: '12-32-02', feet: 18 }],
    totals: { essential: 7440, signature: 12600, premium: 20790, luxury: 32730 },
  },
  {
    name: 'Bathroom vanity, 6 lf',
    room: { project: 'bathroom', layout: 'double-vanity', size: 6, sizeUpper: null, doorStyle: 'modern-shaker', finishSlug: '', finishCategory: 'matte', finishTier: 'standard', construction: 'essential' },
    lines: [{ code: '12-41-03', feet: 6 }],
    totals: { essential: 2400, signature: 3600, premium: 5130, luxury: 7200 },
  },
  {
    name: 'Laundry, 8 lf base and 6 lf uppers',
    room: { project: 'laundry', layout: '', size: 8, sizeUpper: 6, doorStyle: 'modern-shaker', finishSlug: '', finishCategory: 'matte', finishTier: 'standard', construction: 'essential' },
    lines: [{ code: '12-43-02', feet: 8 }, { code: '12-43-01', feet: 6 }],
    totals: { essential: 2580, signature: 3900, premium: 5830, luxury: 8360 },
  },
  {
    name: 'Pantry, 8 lf',
    room: { project: 'pantry', layout: '', size: 8, sizeUpper: null, doorStyle: 'modern-shaker', finishSlug: '', finishCategory: 'matte', finishTier: 'standard', construction: 'essential' },
    lines: [{ code: '12-32-16', feet: 8 }],
    totals: { essential: 2000, signature: 3200, premium: 5200, luxury: 8000 },
  },
];

for (const scenario of SCENARIOS) {
  for (const level of LEVELS) {
    test(`${scenario.name} at ${level.wizard}`, () => {
      const wizard = calculateEstimate({ ...scenario.room, construction: level.wizard }, 0);
      const fromBook = scenario.lines.reduce((sum, line) => {
        const rate = sharedBookRate(line.code, level.tier, false);
        assert.ok(rate, `${line.code} is a unit price`);
        return sum + rate.amount * line.feet;
      }, 0);
      const catalog = priceBookRates({ service: 'cabinet-install', finish: level.finish });
      for (const line of scenario.lines) {
        const priced = catalog.find((rate) => rate.code === `PB-${line.code}`);
        assert.equal(priced?.amount, sharedBookRate(line.code, level.tier, false)?.amount, line.code);
      }
      assert.equal(Math.round(fromBook), scenario.totals[level.wizard]);
      assert.equal(wizard?.priceLow, scenario.totals[level.wizard]);
      assert.equal(wizard?.priceHigh, scenario.totals[level.wizard]);
    });
  }
}

test('legacy Good, Better and Best read Essential, Signature and Premium', () => {
  const room = SCENARIOS[1];
  const legacy: Array<[string, ConstructionTier]> = [['good', 'essential'], ['better', 'signature'], ['best', 'premium']];
  for (const [oldLevel, next] of legacy) {
    const priced = calculateEstimate({ ...room.room, construction: oldLevel as ConstructionTier }, 0);
    assert.equal(priced?.priceLow, room.totals[next], oldLevel);
  }
});
