// One-off runner to seed managed email templates and sequences. Idempotent.
//   DATABASE_URL=... npx tsx scripts/seed-outreach-content.ts
import { seedOutreachContent } from "../server/services/outreachSeed";

async function main() {
  await seedOutreachContent();
  console.log("[seed-outreach] Templates and sequences seeded.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed-outreach] Failed:", err);
    process.exit(1);
  });
