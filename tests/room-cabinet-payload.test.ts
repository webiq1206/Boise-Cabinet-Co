import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { CABINET_PRODUCTS, getRoomBySlug } from "../shared/catalog";
import { ROOM_CABINET_CARD_FIELDS } from "../shared/catalog/roomCabinetCard";
import { toRoomCabinetCard } from "../shared/catalog/toRoomCabinetCard";

const DROPPED = [
  "id",
  "oscCode",
  "description",
  "widthRange",
  "configuration",
  "attrs",
  "boxImage",
  "compatibleCollectionIds",
  "compatibleDoorStyleIds",
];

function roomCards(slug: string) {
  const room = getRoomBySlug(slug);
  assert.ok(room);
  const roomCats = new Set<string>();
  for (const t of room.typicalCabinetTypes) {
    if (t.includes("vanity")) roomCats.add("vanity");
    else if (t.includes("wall")) roomCats.add("wall");
    else if (t.includes("tall")) roomCats.add("tall");
    else if (t.includes("base")) roomCats.add("base");
  }
  if (roomCats.size === 0) ["base", "wall", "tall"].forEach((c) => roomCats.add(c));
  return CABINET_PRODUCTS.filter((c) => roomCats.has(c.category)).map(toRoomCabinetCard);
}

test("serialized room cabinet props contain only the rendered card fields", () => {
  for (const slug of ["kitchen", "built-ins"]) {
    const cards = roomCards(slug);
    assert.ok(cards.length > 10, slug);
    for (const card of cards) {
      const serialized = JSON.parse(JSON.stringify(card)) as Record<string, unknown>;
      assert.deepEqual(Object.keys(serialized).sort(), [...ROOM_CABINET_CARD_FIELDS].sort());
      for (const field of DROPPED) {
        assert.equal(Object.hasOwn(serialized, field), false, `${slug} still serializes ${field}`);
      }
      for (const field of ROOM_CABINET_CARD_FIELDS) {
        assert.equal(typeof serialized[field], "string");
        assert.ok(serialized[field]);
      }
    }
  }

  const page = readFileSync("app/cabinets/[room]/page.tsx", "utf8");
  assert.equal(page.includes(".map(toRoomCabinetCard)"), true);
  assert.equal(page.includes("cabinets={roomCabinets}"), true);
  const selector = readFileSync("components/catalog/OptionsSelector.tsx", "utf8");
  assert.equal(selector.includes("CABINET_PRODUCTS"), false);
  assert.equal(selector.includes("getCabinetNeedLabel"), false);
  assert.equal(selector.includes("formatCabinetDimensions"), false);
  assert.equal(selector.includes("getProductImages"), false);
});

test("the room hero is a server-rendered image with fetch priority", () => {
  const hero = readFileSync("components/approved/InteriorLayout.tsx", "utf8");
  assert.equal(hero.includes('fetchPriority="high"'), true);
  assert.equal(hero.includes('loading="eager"'), true);
  assert.equal(hero.includes('decoding="sync"'), true);
  assert.equal(hero.includes("use client"), false);
  // Next already emits one matching preload from this img. A second link would download the hero twice.
  assert.equal(hero.includes('rel="preload"'), false);
  const page = readFileSync("app/cabinets/[room]/page.tsx", "utf8");
  assert.equal(page.includes("<InteriorHero"), true);
  assert.equal(page.includes("use client"), false);
});
