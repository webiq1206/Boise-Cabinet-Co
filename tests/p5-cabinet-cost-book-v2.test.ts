import test from 'node:test';
import assert from 'node:assert/strict';
import { cabinetCustomerRange, calculateEstimate, getDefaultSelectionsForProject, type ConstructionTier, type EstimateSelections } from '../server/estimateEngine.ts';
import { priceBookRates, sharedBookRate, type FinishTier } from '../lib/p5/priceBook.ts';

/**
 * The wizard shows the customer planning range from calculateP5Estimate.
 * Direct book rates stay in the catalog and are not the displayed total.
 */
const LEVELS: Array<{ wizard: ConstructionTier; finish: string; tier: FinishTier }> = [
  { wizard: 'essential', finish: 'refresh', tier: 'builder' },
  { wizard: 'signature', finish: 'mid-range', tier: 'mid' },
  { wizard: 'premium', finish: 'high-end', tier: 'high' },
  { wizard: 'luxury', finish: 'luxury', tier: 'luxury' },
];

type Line = { code: string; feet: number };
type Scenario = {
  name: string;
  room: EstimateSelections;
  lines: Line[];
  direct: Record<ConstructionTier, number>;
  customer: Record<ConstructionTier, { low: number; high: number }>;
};

const kitchen = (size: number, sizeUpper: number): EstimateSelections => ({
  project: 'kitchen', layout: 'galley', size, sizeUpper, doorStyle: 'slab', finishSlug: '',
  finishCategory: 'matte', finishTier: 'standard', construction: 'essential',
});

const SCENARIOS: Scenario[] = [
  {
    name: 'Kitchen, 10 lf base and no uppers',
    room: kitchen(10, 0),
    lines: [{ code: '12-32-01', feet: 10 }],
    direct: { essential: 2050, signature: 3450, premium: 5700, luxury: 8950 },
    customer: {
      essential: { low: 3225, high: 3575 },
      signature: { low: 5425, high: 6025 },
      premium: { low: 8975, high: 9925 },
      luxury: { low: 14100, high: 15600 },
    },
  },
  {
    name: 'Kitchen, 24 lf base and 18 lf uppers',
    room: kitchen(24, 18),
    lines: [{ code: '12-32-01', feet: 24 }, { code: '12-32-02', feet: 18 }],
    direct: { essential: 7440, signature: 12600, premium: 20790, luxury: 32730 },
    customer: {
      essential: { low: 11700, high: 13000 },
      signature: { low: 19800, high: 22000 },
      premium: { low: 32700, high: 36200 },
      luxury: { low: 51500, high: 57000 },
    },
  },
  {
    name: 'Bathroom vanity, 6 lf',
    room: { project: 'bathroom', layout: 'double-vanity', size: 6, sizeUpper: null, doorStyle: 'modern-shaker', finishSlug: '', finishCategory: 'matte', finishTier: 'standard', construction: 'essential' },
    lines: [{ code: '12-41-03', feet: 6 }],
    direct: { essential: 2400, signature: 3600, premium: 5130, luxury: 7200 },
    customer: {
      essential: { low: 3775, high: 4200 },
      signature: { low: 5675, high: 6275 },
      premium: { low: 8075, high: 8950 },
      luxury: { low: 11400, high: 12600 },
    },
  },
  {
    name: 'Laundry, 8 lf base and 6 lf uppers',
    room: { project: 'laundry', layout: '', size: 8, sizeUpper: 6, doorStyle: 'modern-shaker', finishSlug: '', finishCategory: 'matte', finishTier: 'standard', construction: 'essential' },
    lines: [{ code: '12-43-02', feet: 8 }, { code: '12-43-01', feet: 6 }],
    direct: { essential: 2580, signature: 3900, premium: 5830, luxury: 8360 },
    customer: {
      essential: { low: 4075, high: 4500 },
      signature: { low: 6150, high: 6800 },
      premium: { low: 9175, high: 10150 },
      luxury: { low: 13200, high: 14600 },
    },
  },
  {
    name: 'Pantry, 8 lf',
    room: { project: 'pantry', layout: '', size: 8, sizeUpper: null, doorStyle: 'modern-shaker', finishSlug: '', finishCategory: 'matte', finishTier: 'standard', construction: 'essential' },
    lines: [{ code: '12-32-16', feet: 8 }],
    direct: { essential: 2000, signature: 3200, premium: 5200, luxury: 8000 },
    customer: {
      essential: { low: 3150, high: 3500 },
      signature: { low: 5050, high: 5575 },
      premium: { low: 8175, high: 9050 },
      luxury: { low: 12600, high: 14000 },
    },
  },
];

for (const scenario of SCENARIOS) {
  for (const level of LEVELS) {
    test(`${scenario.name} at ${level.wizard} is the customer range`, () => {
      const wizard = calculateEstimate({ ...scenario.room, construction: level.wizard }, 0);
      const direct = scenario.lines.reduce((sum, line) => {
        const rate = sharedBookRate(line.code, level.tier, false);
        assert.ok(rate, `${line.code} is a unit price`);
        return sum + rate.amount * line.feet;
      }, 0);
      const catalog = priceBookRates({ service: 'cabinet-install', finish: level.finish });
      for (const line of scenario.lines) {
        const priced = catalog.find((rate) => rate.code === `PB-${line.code}`);
        assert.equal(priced?.amount, sharedBookRate(line.code, level.tier, false)?.amount, line.code);
      }
      assert.equal(direct, scenario.direct[level.wizard]);
      const expected = scenario.customer[level.wizard];
      assert.notEqual(expected.low, direct);
      assert.equal(wizard?.priceLow, expected.low);
      assert.equal(wizard?.priceHigh, expected.high);
      assert.deepEqual(
        cabinetCustomerRange(scenario.lines.map((line) => ({ code: line.code, quantity: line.feet })), level.wizard),
        expected,
      );
    });
  }
}

test('legacy Good, Better and Best read Essential, Signature and Premium', () => {
  const room = SCENARIOS[1];
  const legacy: Array<[string, ConstructionTier]> = [['good', 'essential'], ['better', 'signature'], ['best', 'premium']];
  for (const [oldLevel, next] of legacy) {
    const priced = calculateEstimate({ ...room.room, construction: oldLevel as ConstructionTier }, 0);
    assert.equal(priced?.priceLow, room.customer[next].low, oldLevel);
    assert.equal(priced?.priceHigh, room.customer[next].high, oldLevel);
  }
});

test('quantity proposals for lines without a clean code stay off the wizard', () => {
  assert.equal(calculateEstimate(getDefaultSelectionsForProject('entertainment')), null);
  // One complete media wall, not a linear-foot conversion.
  assert.deepEqual(cabinetCustomerRange([{ code: '12-44-04', quantity: 1 }], 'signature'), { low: 10100, high: 11200 });
  // A separate home-office upper run, if approved, would use wall cabinets per linear foot.
  assert.deepEqual(cabinetCustomerRange([{ code: '12-32-02', quantity: 7 }], 'signature'), { low: 2650, high: 2925 });
  // A separate built-in upper run, if approved, would use open built-in bookshelves per linear foot.
  assert.deepEqual(cabinetCustomerRange([{ code: '12-44-01', quantity: 7 }], 'signature'), { low: 4475, high: 4950 });
  const office = calculateEstimate(getDefaultSelectionsForProject('home-office'));
  assert.deepEqual(
    office && { low: office.priceLow, high: office.priceHigh },
    cabinetCustomerRange([{ code: '12-44-06', quantity: 10 }], 'signature'),
  );
});
