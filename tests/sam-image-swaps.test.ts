import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { heroImageAttrs } from "../components/approved/InteriorLayout";
import { BLOG_IMAGE_REGISTRY, HUB_HERO_IMAGES } from "../shared/blogImageRegistry";
import { ROOM_CATEGORIES } from "../shared/catalog/roomCategories";
import { IMAGE_VARIANTS } from "../shared/generated/imageVariants";
import { getServiceImageSet, SERVICE_BACKGROUNDS } from "../shared/serviceBackgrounds";
import { MARKETING_IMAGES, SITE_IMAGES } from "../shared/siteImages";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const HASHES: Record<string, string> = {
  "public/images/marketing/og-catalog-kitchen.jpg":
    "4cc81e8ac5cc618c68d4a5061112ff082e79e7f2c58a73e1777194e3e5f1a39a",
  "public/images/marketing/great-room-oak-built-ins.webp":
    "b20720ba8a4407eb8d42186c0c3abda8eb37a6ac1f7c04347d0b22c2d8a7da5c",
  "public/images/marketing/great-room-oak-built-ins-1280.webp":
    "782c7b6d2b79cda6ddf5b47ba108447849c7fd631cbeaf5bd7c9d41436846715",
  "public/images/marketing/great-room-oak-built-ins-768.webp":
    "ad5ca72b23c9ab99f855d4243f9aab8de682a864a1dba55eead61467f7c54095",
  "public/images/marketing/bath-white-oak-vanity.webp":
    "b8c98969912ef886574d64e2edb767582caea5db65ad921adfb7be4a5187c958",
  "public/images/marketing/bath-white-oak-vanity-1280.webp":
    "db01f5bd897b10cb697ee16d89beff21283f3f590dc852beadbe4c2692141b1d",
  "public/images/marketing/bath-white-oak-vanity-768.webp":
    "78da6304a2d9b524397dc72ca01fe90e0547e8661ad562a874f197d99313769c",
  "public/images/marketing/drawers-black-pulls-oak.webp":
    "ba9ebb1393dcf638c9bceb50fa13ea399bcc482d78ebc9bd50e12c4f5e917642",
  "public/images/marketing/drawers-black-pulls-oak-1280.webp":
    "363de8179d4fcc139db1f406036061b18cb14e00a754725774296a6b86bc6204",
  "public/images/marketing/drawers-black-pulls-oak-768.webp":
    "d4ebbccad58b3cdb49ba68137ab271434a5900be6b715d2a3d10f25e0fc21857",
  "public/images/marketing/warranty-hardware.webp":
    "f00d6dfb550c61dfb5b2a63266cbdd3e4df548187e5bbc2fff570bdaa7e9aa92",
  "public/images/marketing/warranty-hardware-1280.webp":
    "686b3f8bbcab299fdd1f401c3749a47ca6b267adb84b28b2d0d761c3f2785b8e",
  "public/images/marketing/warranty-hardware-768.webp":
    "732cd7422e2b59633b99c9dd1535c401101af2b002424575c1fdd913f3826eac",
  "public/images/marketing/kitchen-farmhouse-shaker.webp":
    "86387dadfd06891c74713b391f673c9119b9fe25130346910d17988f083153d9",
  "public/images/marketing/kitchen-farmhouse-shaker-1280.webp":
    "03dd49ad9819e27ef811613a5e5966cbeddf104eba76416d5a9b0414063ffcf0",
  "public/images/marketing/kitchen-farmhouse-shaker-768.webp":
    "67cf1357879dc8cbbb087a4dbfc1209d89557da1b93769452dbf8db79b06e3a4",
  "public/images/catalog/rooms/kitchen-walnut-mountain.webp":
    "3dbf3b9d80a90fc78fd00d348909d4a83ddac7ec432b8bb5b3ea302d1af5cc2d",
  "public/images/catalog/rooms/kitchen-walnut-mountain-1080.webp":
    "46ef6560305ab9395dddf808608a9cf22286ed43ffe1ebcf6ee23c66b45bd34a",
  "public/images/catalog/rooms/kitchen-walnut-mountain-640.webp":
    "7030bb6d5fd9e30944908a21a8fc68b8e3cf3fa4742b26c2f987a0acc256a9c6",
  "public/images/catalog/rooms/kitchen-walnut-mountain-320.webp":
    "90a1bc1cf26cefa0ffda832e76179bd366ae889660533e0f22e15ea440d03caa",
};

const RETIRED = [
  "/images/marketing/og-catalog.jpg",
  "/images/marketing/statement-whole-home.webp",
  "/images/marketing/hero-contact.webp",
  "/images/marketing/hero-hardware.webp",
  "/images/catalog/rooms/kitchen.webp",
];

function sha256(rel: string) {
  return createHash("sha256").update(fs.readFileSync(path.join(root, rel))).digest("hex");
}

test("Sam r1 files match the checked sha256 values", () => {
  for (const [rel, expected] of Object.entries(HASHES)) {
    assert.equal(sha256(rel), expected, rel);
  }
});

test("imageVariants lists the new widths and drops the retired keys", () => {
  assert.deepEqual(IMAGE_VARIANTS["/images/marketing/great-room-oak-built-ins.webp"], [768, 1280]);
  assert.deepEqual(IMAGE_VARIANTS["/images/marketing/bath-white-oak-vanity.webp"], [768, 1280]);
  assert.equal(IMAGE_VARIANTS["/images/marketing/drawers-black-pulls-oak.webp"], undefined);
  assert.deepEqual(IMAGE_VARIANTS["/images/marketing/warranty-hardware.webp"], [768, 1280]);
  assert.deepEqual(IMAGE_VARIANTS["/images/marketing/kitchen-farmhouse-shaker.webp"], [768, 1280]);
  assert.deepEqual(IMAGE_VARIANTS["/images/catalog/hardware/hinge-soft-close.webp"], [160, 320, 640]);
  assert.deepEqual(IMAGE_VARIANTS["/images/catalog/hardware/push-to-open-hinge.webp"], [160, 320, 640]);
  assert.deepEqual(IMAGE_VARIANTS["/images/catalog/rooms/kitchen-walnut-mountain.webp"], [320, 640, 1080]);
  assert.equal(IMAGE_VARIANTS["/images/marketing/og-catalog-kitchen.jpg"], undefined);
  for (const retired of RETIRED) {
    assert.equal(IMAGE_VARIANTS[retired], undefined, retired);
  }
});

test("serving maps point at the new files and keep the design studio hero", () => {
  assert.equal(MARKETING_IMAGES.statementBand, "/images/marketing/great-room-oak-built-ins.webp");
  assert.equal(SITE_IMAGES.statementBand, MARKETING_IMAGES.statementBand);
  assert.equal(MARKETING_IMAGES.heroContact, "/images/marketing/bath-white-oak-vanity.webp");
  assert.equal(SITE_IMAGES.contactHero, MARKETING_IMAGES.heroContact);
  assert.equal(MARKETING_IMAGES.hardware, "/images/marketing/warranty-hardware.webp");
  assert.equal(MARKETING_IMAGES.cabinetsHero, "/images/marketing/kitchen-farmhouse-shaker.webp");
  assert.equal(MARKETING_IMAGES.designStudio, "/images/marketing/hero-design-studio.webp");
  assert.equal(SERVICE_BACKGROUNDS["kitchen-remodel"], "/images/catalog/rooms/kitchen-walnut-mountain.webp");
  assert.equal(getServiceImageSet("kitchen-remodel").hero, "/images/catalog/rooms/kitchen-walnut-mountain.webp");
  assert.equal(HUB_HERO_IMAGES["kitchen-cabinets"], "/images/catalog/rooms/kitchen-walnut-mountain.webp");
  const kitchen = ROOM_CATEGORIES.find((room) => room.slug === "kitchen");
  assert.equal(kitchen?.heroImage, "/images/catalog/rooms/kitchen-walnut-mountain.webp");
  assert.equal(kitchen?.imageAlt, "Kitchen with walnut cabinets, a stone range wall and a grey-topped island");
  assert.equal(
    BLOG_IMAGE_REGISTRY["cabinet-measurement-design-phase"].alt,
    "Oak kitchen cabinets in a traditional layout",
  );
  assert.equal(BLOG_IMAGE_REGISTRY["cabinet-measurement-design-phase"].alt.includes("before a cabinet refresh"), false);
});

test("retired files stay on disk", () => {
  for (const rel of [
    "public/images/marketing/og-catalog.jpg",
    "public/images/marketing/statement-whole-home.webp",
    "public/images/marketing/hero-contact.webp",
    "public/images/marketing/hero-hardware.webp",
    "public/images/marketing/drawers-black-pulls-oak.webp",
    "public/images/catalog/rooms/kitchen.webp",
    "public/images/catalog/hardware/hinge-soft-close.webp",
    "public/images/catalog/hardware/push-to-open-hinge.webp",
  ]) {
    assert.equal(fs.existsSync(path.join(root, rel)), true, rel);
  }
});

test("heroes srcset the variant widths", () => {
  const room = heroImageAttrs("/images/catalog/rooms/kitchen-walnut-mountain.webp");
  assert.equal(room.src, "/images/catalog/rooms/kitchen-walnut-mountain-1080.webp");
  assert.match(room.srcSet ?? "", /kitchen-walnut-mountain-320\.webp 320w/);
  assert.match(room.srcSet ?? "", /kitchen-walnut-mountain-640\.webp 640w/);
  assert.match(room.srcSet ?? "", /kitchen-walnut-mountain-1080\.webp 1080w/);

  const hardware = heroImageAttrs("/images/marketing/warranty-hardware.webp");
  assert.match(hardware.srcSet ?? "", /warranty-hardware-768\.webp 768w/);
  assert.match(hardware.srcSet ?? "", /warranty-hardware-1280\.webp 1280w/);
  assert.match(hardware.srcSet ?? "", /warranty-hardware\.webp 1536w/);

  const cabinets = heroImageAttrs("/images/marketing/kitchen-farmhouse-shaker.webp");
  assert.match(cabinets.srcSet ?? "", /kitchen-farmhouse-shaker-768\.webp 768w/);
  assert.match(cabinets.srcSet ?? "", /kitchen-farmhouse-shaker-1280\.webp 1280w/);

  const marketing = heroImageAttrs("/images/marketing/bath-white-oak-vanity.webp");
  assert.equal(marketing.src, "/images/marketing/bath-white-oak-vanity-1280.webp");
  assert.match(marketing.srcSet ?? "", /bath-white-oak-vanity-768\.webp 768w/);
  assert.match(marketing.srcSet ?? "", /bath-white-oak-vanity-1280\.webp 1280w/);
  assert.match(marketing.srcSet ?? "", /bath-white-oak-vanity\.webp 1536w/);

  const area = heroImageAttrs("/images/areas/boise.webp");
  assert.equal(area.src, "/images/areas/boise-1080.webp");
  assert.match(area.srcSet ?? "", /boise-640\.webp 640w/);
  assert.equal((area.srcSet ?? "").includes("320w"), false);
});
