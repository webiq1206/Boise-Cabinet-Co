import assert from "node:assert/strict";
import test from "node:test";
import { generateFAQSchema } from "../lib/schema";
import { getRoomFaqs } from "../shared/catalog/roomFaqs";
import { getRoomBySlug } from "../shared/catalog";
import { calculateEstimate } from "../shared/estimateEngine";
import { CITY_CABINET_GUIDES } from "../shared/content/cityCabinetGuides";
import { PREMIUM_POSTS } from "../shared/content/premiumPosts";
import { getHubPillarFaqs } from "../shared/content/hubFaqs";
import { KITCHEN_PILLAR } from "../shared/content/allHubsContent";
import { WAVE1_COST_CLUSTERS } from "../shared/content/blogPostsData";
import { COST_CLUSTER_CONTENT } from "../shared/content/wave1/costClusterPosts";
import {
  BOISE_REMODELING_COST_GUIDE_HTML,
  BOISE_REMODELING_COST_QUICK_ANSWER,
} from "../shared/content/wave1/boiseRemodelingCostGuide";
import { BOISE_GUIDE_HTML } from "../shared/content/wave1/locationGuides";
import { GUIDE_PAGES } from "../shared/guideContent";
import { LLMS_TXT } from "../shared/llmsTxt";
import { BUDGET_WORKSHEET_BLOCKS } from "../shared/resourcePdfContent";
import { PLACEHOLDER_PROJECT } from "../shared/portalPlaceholder";
import {
  bestLargeKitchenSelections,
  bestLargeKitchenWithInputsPhrase,
  formatBestLargeKitchenRange,
  formatDollars,
  formatSmallKitchenDollars,
  formatTypicalKitchenDollars,
  formatTypicalRoomRange,
  getBestLargeKitchenRange,
  getTypicalRoomRange,
  smallKitchenSelections,
  typicalKitchenInstalledLabel,
  typicalKitchenMidpointDollars,
} from "../shared/typicalRoomRange";
import { readFileSync } from "node:fs";

const KITCHEN_QUESTION = "How much do custom kitchen cabinets cost in Boise?";
const RANGE = "$17k to $29k";
const RANGE_PHRASE = `${RANGE} installed, based on a typical size and Better-tier construction`;
const OLD_RANGE = "$15,000 to $45,000";

test("the kitchen FAQ, FAQPage schema, and cost card share one typical range", () => {
  const room = getRoomBySlug("kitchen");
  assert.ok(room);
  const faqs = getRoomFaqs(room);
  const kitchen = faqs.find((faq) => faq.question === KITCHEN_QUESTION);
  assert.ok(kitchen);

  const range = getTypicalRoomRange("kitchen");
  assert.ok(range);
  assert.equal(formatTypicalRoomRange("kitchen"), RANGE);
  assert.equal(kitchen.answer.includes(RANGE_PHRASE), true);
  assert.equal(kitchen.answer.includes(OLD_RANGE), false);
  assert.equal(
    kitchen.answer,
    `Most Treasure Valley kitchen cabinet packages plan from roughly ${RANGE_PHRASE}, depending on linear footage, door style, finish tier, and interior accessories. See our Boise Cabinet Cost Guide for detailed planning bands.`,
  );

  const schema = generateFAQSchema(faqs);
  const entity = schema.mainEntity.find((item) => item.name === KITCHEN_QUESTION);
  assert.ok(entity);
  assert.equal(entity.acceptedAnswer.text, kitchen.answer);
  assert.equal(entity.acceptedAnswer.text.includes(RANGE), true);
  assert.equal(entity.acceptedAnswer.text.includes(OLD_RANGE), false);

  const page = readFileSync("app/cabinets/[room]/page.tsx", "utf8");
  assert.equal(page.includes("formatTypicalRoomRange(room.slug)"), true);
  assert.equal(page.includes("{typicalRange}"), true);
  assert.equal(page.includes("installed, based on a typical size and Better-tier construction."), true);
  assert.equal(page.includes(OLD_RANGE), false);
  assert.equal(page.includes("function getTypicalRoomRange"), false);

  const bathroom = getRoomFaqs(getRoomBySlug("bathroom")!);
  const vanity = bathroom.find((faq) => faq.question === "How much does a custom bathroom vanity cost in Boise?");
  assert.equal(
    vanity?.answer,
    "Single-vanity packages often plan from roughly $2,500 to $8,000+; double vanities and linen towers increase the investment. Finish tier and drawer interiors matter more than width alone.",
  );
});

test("published kitchen totals match calculateEstimate and drop the old $15k to $45k band", () => {
  const typical = getTypicalRoomRange("kitchen");
  assert.ok(typical);
  const typicalFromEngine = calculateEstimate(
    // The typical label is the default Better kitchen: 24 lf base, 18 lf uppers,
    // island, modern shaker, matte standard, Better construction.
    {
      project: "kitchen",
      layout: "island",
      size: 24,
      sizeUpper: 18,
      doorStyle: "modern-shaker",
      finishSlug: "",
      finishCategory: "matte",
      finishTier: "standard",
      construction: "better",
    },
  );
  assert.ok(typicalFromEngine);
  assert.deepEqual(typical, { priceLow: typicalFromEngine.priceLow, priceHigh: typicalFromEngine.priceHigh });
  assert.equal(typicalFromEngine.priceLow, 17100);
  assert.equal(typicalFromEngine.priceHigh, 28600);
  assert.equal(typicalKitchenInstalledLabel(), "$17k to $29k installed");
  assert.equal(formatTypicalKitchenDollars(), "$17,100 to $28,600");
  assert.equal(
    typicalKitchenMidpointDollars(),
    formatDollars(Math.round((typicalFromEngine.priceLow + typicalFromEngine.priceHigh) / 2)),
  );
  assert.equal(typicalKitchenMidpointDollars(), "$22,850");

  const bestSelections = bestLargeKitchenSelections();
  assert.deepEqual(bestSelections, {
    project: "kitchen",
    layout: "island",
    size: 60,
    sizeUpper: 50,
    doorStyle: "modern-shaker",
    finishSlug: "",
    finishCategory: "matte",
    finishTier: "standard",
    construction: "best",
  });
  const bestFromEngine = calculateEstimate(bestSelections);
  assert.ok(bestFromEngine);
  assert.deepEqual(getBestLargeKitchenRange(), {
    priceLow: bestFromEngine.priceLow,
    priceHigh: bestFromEngine.priceHigh,
  });
  assert.equal(bestFromEngine.priceLow, 51200);
  assert.equal(bestFromEngine.priceHigh, 86000);
  assert.equal(formatBestLargeKitchenRange(), "$51,200 to $86,000");
  assert.equal(
    bestLargeKitchenWithInputsPhrase(),
    "A Best-tier large kitchen (60 linear feet of base cabinets, 50 linear feet of uppers, island layout, modern shaker doors, matte standard finish) plans from $51,200 to $86,000 installed",
  );

  const smallFromEngine = calculateEstimate(smallKitchenSelections());
  assert.ok(smallFromEngine);
  assert.equal(formatSmallKitchenDollars(), `${formatDollars(smallFromEngine.priceLow)} to ${formatDollars(smallFromEngine.priceHigh)}`);
  assert.equal(smallFromEngine.priceLow, 11400);
  assert.equal(smallFromEngine.priceHigh, 19100);

  const installed = typicalKitchenInstalledLabel();
  const bestPhrase = bestLargeKitchenWithInputsPhrase();
  const surfaces: Array<[string, string]> = [
    ["llms.txt", LLMS_TXT],
    ["cost guide html", BOISE_REMODELING_COST_GUIDE_HTML],
    ["cost guide answer", BOISE_REMODELING_COST_QUICK_ANSWER],
    ["boise location guide", BOISE_GUIDE_HTML],
    ["kitchen pillar", KITCHEN_PILLAR.quickAnswer ?? ""],
    ["kitchen cost cluster", COST_CLUSTER_CONTENT["kitchen-cabinet-cost-boise"].html + COST_CLUSTER_CONTENT["kitchen-cabinet-cost-boise"].quickAnswer],
  ];

  for (const guide of CITY_CABINET_GUIDES) {
    surfaces.push([guide.slug, JSON.stringify(guide.faqs) + (guide.content ?? "")]);
  }
  for (const guide of GUIDE_PAGES) {
    if (guide.slug === "boise-cabinet-cost-guide" || guide.slug === "boise-cabinet-guide") {
      surfaces.push([`guide:${guide.slug}`, JSON.stringify(guide.faqs)]);
    }
  }
  const customPost = PREMIUM_POSTS.find((post) => post.slug === "custom-kitchen-cabinet-cost");
  assert.ok(customPost);
  surfaces.push([
    "custom kitchen post",
    `${customPost.content}\n${customPost.metaDescription}\n${customPost.excerpt}\n${customPost.quickAnswer}\n${JSON.stringify(customPost.faqs)}\n${JSON.stringify(customPost.keyTakeaways)}`,
  ]);
  const waveKitchen = WAVE1_COST_CLUSTERS.find((post) => post.slug === "kitchen-cabinet-cost-boise");
  assert.ok(waveKitchen);
  surfaces.push(["wave kitchen excerpt", waveKitchen.excerpt]);
  surfaces.push(["hub kitchen faq", getHubPillarFaqs("kitchen-cabinets").map((faq) => faq.answer).join("\n")]);

  const oldBands = [
    "$15,000 to $45,000",
    "$15,000–$45,000",
    "$15,000 to $45,000+",
    "$15k–$45k",
    "$28,000",
    "$65,000+",
  ];
  for (const [name, text] of surfaces) {
    assert.equal(text.includes(installed), true, `${name} should use the typical installed label`);
    for (const old of oldBands) {
      assert.equal(text.includes(old), false, `${name} still contains ${old}`);
    }
  }

  const highEnd = [
    CITY_CABINET_GUIDES.find((guide) => guide.slug.includes("eagle")),
  ];
  const eagle = highEnd[0];
  assert.ok(eagle);
  assert.equal(JSON.stringify(eagle.faqs).includes(bestPhrase), true);
  assert.equal(customPost.content.includes(bestPhrase), true);
  assert.equal(customPost.content.includes(formatSmallKitchenDollars()), true);
  assert.equal(getHubPillarFaqs("kitchen-cabinets")[0].answer.includes(bestPhrase), true);
  assert.equal((KITCHEN_PILLAR.quickAnswer ?? "").includes(bestPhrase), true);
  assert.equal(COST_CLUSTER_CONTENT["kitchen-cabinet-cost-boise"].html.includes(bestPhrase), true);
  assert.equal(JSON.stringify(GUIDE_PAGES.find((guide) => guide.slug === "boise-cabinet-cost-guide")?.faqs).includes(bestPhrase), true);

  const worksheet = JSON.stringify(BUDGET_WORKSHEET_BLOCKS);
  for (const old of oldBands) {
    assert.equal(worksheet.includes(old), false, `budget worksheet still contains ${old}`);
    assert.equal(PLACEHOLDER_PROJECT.estimate.rangeLabel.includes(old), false);
  }
  assert.equal(worksheet.includes("$17,100"), true);
  assert.equal(worksheet.includes("$28,600"), true);
  assert.equal(worksheet.includes("$51,200"), true);
  assert.equal(worksheet.includes("$86,000"), true);
  assert.equal(worksheet.includes("Closet / garage"), true);
  assert.equal(PLACEHOLDER_PROJECT.estimate.rangeLabel, "$17,100 – $28,600");
  assert.equal(LLMS_TXT.includes("$22,850 midpoint"), true);
  assert.equal(LLMS_TXT.includes("$450 to $900 per linear foot"), true);
  assert.equal(BOISE_REMODELING_COST_QUICK_ANSWER.includes("$4,000"), true);
  assert.equal(BOISE_REMODELING_COST_QUICK_ANSWER.includes("$120,000+"), true);
  assert.equal(BOISE_REMODELING_COST_QUICK_ANSWER.includes("$8,000 to $25,000+"), true);
});
