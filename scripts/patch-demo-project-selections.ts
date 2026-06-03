/**
 * Backfill selectionsJson on the demo portal project when the DB was seeded before that field existed.
 * Usage: npm run db:patch-demo-selections
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { projects } from "../shared/schema";
import { PLACEHOLDER_PROJECT_ID } from "../shared/portalPlaceholder";
import { DEMO_PROJECT_SELECTIONS } from "../lib/catalog/resolveProjectSelections";
import { projectSelectionsToStyleJson } from "../lib/design/designSerialization";

function demoSelectionsJson(): Record<string, unknown> {
  return {
    ...projectSelectionsToStyleJson(DEMO_PROJECT_SELECTIONS),
    roomType: DEMO_PROJECT_SELECTIONS.roomType,
    collection: DEMO_PROJECT_SELECTIONS.collection,
    layout: DEMO_PROJECT_SELECTIONS.layout,
  };
}

async function main() {
  if (!db) {
    console.error("DATABASE_URL not configured — set it in .env.local");
    process.exit(1);
  }

  const rows = await db
    .select({ id: projects.id, selectionsJson: projects.selectionsJson })
    .from(projects)
    .where(eq(projects.id, PLACEHOLDER_PROJECT_ID))
    .limit(1);

  if (rows.length === 0) {
    console.error(`No project with id ${PLACEHOLDER_PROJECT_ID}. Run npm run db:seed first.`);
    process.exit(1);
  }

  const styleJson = demoSelectionsJson();
  await db
    .update(projects)
    .set({ selectionsJson: styleJson, updatedAt: new Date() })
    .where(eq(projects.id, PLACEHOLDER_PROJECT_ID));

  console.log("Updated selectionsJson on", PLACEHOLDER_PROJECT_ID);
  console.log(JSON.stringify(styleJson, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
