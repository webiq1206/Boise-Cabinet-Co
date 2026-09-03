/**
 * Formal parity gate: the calculate API must return byte-identical pricing to
 * the guided estimator's own composition of the engine for the same inputs.
 *
 * Run with: npm run test:parity   (npx tsx tests/pricing/estimate-parity.test.ts)
 *
 * The wizard renders from calculateCombinedEstimate(rooms) directly; the API
 * (used by the conversational assistant) imports the same module. This test
 * drives both paths - direct module calls and the actual HTTP route handler -
 * with identical fixtures and asserts exact numeric equality, so "guided
 * estimator says $18,500 while the assistant says $21,000" cannot ship.
 */

import { NextRequest } from "next/server";
import {
  calculateCombinedEstimate,
  buildCombinedStoredEstimate,
  getDefaultSelectionsForProject,
  EMPTY_SELECTIONS,
  type EstimateSelections,
} from "../../shared/estimateEngine";
import { POST as calculateRoute } from "../../app/api/estimate/calculate/route";

let passed = 0;
let failed = 0;

function check(condition: boolean, message: string) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`FAIL: ${message}`);
  }
}

// The route now requires contact details (it never returns a price to an
// anonymous caller). The parity test supplies a fixture contact so it can still
// exercise the pricing path; the number must not depend on who is asking.
const FIXTURE_CONTACT = { name: "Parity Test", email: "parity@example.com" };

async function callRoute(rooms: EstimateSelections[]) {
  const request = new NextRequest("http://localhost/api/estimate/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rooms, contact: FIXTURE_CONTACT }),
  });
  const response = await calculateRoute(request);
  return { status: response.status, body: await response.json() };
}

const FIXTURES: Array<{ name: string; rooms: EstimateSelections[] }> = [
  { name: "kitchen defaults", rooms: [getDefaultSelectionsForProject("kitchen")] },
  {
    name: "kitchen + bathroom + pantry",
    rooms: [
      getDefaultSelectionsForProject("kitchen"),
      getDefaultSelectionsForProject("bathroom"),
      getDefaultSelectionsForProject("pantry"),
    ],
  },
  {
    name: "fully upgraded kitchen",
    rooms: [
      {
        ...EMPTY_SELECTIONS,
        project: "kitchen",
        layout: "island",
        size: 60,
        sizeUpper: 50,
        doorStyle: "beta-shaker",
        finishCategory: "gloss",
        finishTier: "reserve",
        construction: "best",
      },
    ],
  },
  {
    name: "partial selections (size only)",
    rooms: [{ ...EMPTY_SELECTIONS, project: "laundry", size: 12, sizeUpper: 8 }],
  },
  {
    name: "mixed priceable + unpriceable rooms",
    rooms: [getDefaultSelectionsForProject("built-ins"), EMPTY_SELECTIONS],
  },
  {
    name: "out-of-range sizes (engine clamps both paths identically)",
    rooms: [{ ...getDefaultSelectionsForProject("kitchen"), size: 500, sizeUpper: 500 }],
  },
];

async function main() {
  for (const fixture of FIXTURES) {
    // Path 1: exactly how the wizard composes the engine.
    const direct = calculateCombinedEstimate(fixture.rooms);
    const directStored = buildCombinedStoredEstimate(fixture.rooms);

    // Path 2: the HTTP route handler.
    const { status, body } = await callRoute(fixture.rooms);
    check(status === 200, `${fixture.name}: route responds 200 (got ${status})`);
    if (status !== 200) continue;

    if (!direct) {
      check(body.priceable === false, `${fixture.name}: both paths agree it is unpriceable`);
      continue;
    }

    check(body.priceable === true, `${fixture.name}: route prices what the wizard prices`);
    check(
      body.combined?.priceLow === direct.priceLow &&
        body.combined?.priceHigh === direct.priceHigh,
      `${fixture.name}: EXACT total parity (wizard ${direct.priceLow}..${direct.priceHigh}, api ${body.combined?.priceLow}..${body.combined?.priceHigh})`,
    );
    check(
      body.combined?.rooms?.length === direct.rooms.length,
      `${fixture.name}: same room count`,
    );
    direct.rooms.forEach((room, i) => {
      const apiRoom = body.combined?.rooms?.[i];
      check(
        apiRoom?.priceLow === room.priceLow && apiRoom?.priceHigh === room.priceHigh,
        `${fixture.name}: room ${i + 1} (${room.projectLabel}) EXACT parity`,
      );
    });
    check(
      body.stored?.priceLow === directStored?.priceLow &&
        body.stored?.priceHigh === directStored?.priceHigh,
      `${fixture.name}: stored (consultation handoff) parity`,
    );
    check(
      body.record?.rangeLow === direct.priceLow && body.record?.rangeHigh === direct.priceHigh,
      `${fixture.name}: estimate record parity`,
    );
  }

  // Bad inputs are rejected, never mispriced.
  {
    const { status } = await callRoute([
      { ...EMPTY_SELECTIONS, project: "castle" as never, size: 24 },
    ]);
    check(status === 400, `unknown project type rejected with 400 (got ${status})`);

    const absurd = await callRoute([
      { ...getDefaultSelectionsForProject("kitchen"), size: 999999 },
    ]);
    check(absurd.status === 400, `absurd size rejected with 400 (got ${absurd.status})`);

    const request = new NextRequest("http://localhost/api/estimate/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rooms: [] }),
    });
    const response = await calculateRoute(request);
    check(response.status === 400, `empty rooms rejected with 400 (got ${response.status})`);

    // The contact gate: a fully valid rooms payload with NO contact must be
    // rejected and must not leak a price.
    const noContact = new NextRequest("http://localhost/api/estimate/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rooms: [getDefaultSelectionsForProject("kitchen")] }),
    });
    const noContactRes = await calculateRoute(noContact);
    const noContactBody = await noContactRes.json();
    check(
      noContactRes.status === 400,
      `valid rooms without contact rejected with 400 (got ${noContactRes.status})`,
    );
    check(
      noContactBody?.combined == null && noContactBody?.priceable !== true,
      "no price returned when contact is missing",
    );
  }

  console.log(`\n${passed} checks passed, ${failed} failed.`);
  if (failed > 0) {
    console.error("Parity suite FAILED.");
    process.exit(1);
  }
  console.log("Wizard-vs-API parity suite passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
