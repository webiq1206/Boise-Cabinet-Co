/**
 * Seed demo portal data for development and staging.
 * Usage: npm run db:seed  (requires DATABASE_URL in .env.local)
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { db } from "../lib/db";
import {
  projects,
  projectInvoices,
  projectMessages,
  projectOrders,
} from "../shared/schema";
import { PLACEHOLDER_PROJECT_ID } from "../shared/portalPlaceholder";

async function main() {
  if (!db) {
    console.error("DATABASE_URL not configured — set it in .env.local and run npm run db:push first.");
    process.exit(1);
  }

  const existing = await db.select().from(projects).limit(1);
  if (existing.length > 0) {
    console.log("Projects already exist — skipping seed.");
    return;
  }

  await db.insert(projects).values({
    id: PLACEHOLDER_PROJECT_ID,
    title: "Kitchen Cabinet Refresh",
    name: "Demo Customer",
    email: "demo@boisecabinet.co",
    phone: "2085550100",
    address: "1842 N Harrison Blvd",
    city: "Boise",
    propertyType: "single-family",
    serviceType: "kitchen-cabinets",
    status: "active",
    currentStage: "design_review",
    estimatedDeliveryDate: new Date("2026-08-01"),
  });

  const [inv1] = await db
    .insert(projectInvoices)
    .values({
      projectId: PLACEHOLDER_PROJECT_ID,
      amount: "2500",
      status: "paid",
      description: "Design & consultation deposit",
      paidAt: new Date("2026-05-08"),
    })
    .returning();

  await db.insert(projectInvoices).values([
    {
      projectId: PLACEHOLDER_PROJECT_ID,
      amount: "8750",
      status: "sent",
      description: "Production deposit — 50%",
      dueDate: new Date("2026-06-15"),
    },
    {
      projectId: PLACEHOLDER_PROJECT_ID,
      amount: "8750",
      status: "draft",
      description: "Final balance — upon installation",
    },
  ]);

  await db.insert(projectOrders).values({
    projectId: PLACEHOLDER_PROJECT_ID,
    orderNumber: "BCC-2026-0142",
    status: "fabrication",
    estimatedShipDate: new Date("2026-07-15"),
  });

  await db.insert(projectMessages).values([
    {
      projectId: PLACEHOLDER_PROJECT_ID,
      senderRole: "admin",
      body: "Hi! Your kitchen design is ready for review. Take a look at the Design tab and let us know if you'd like any changes.",
    },
    {
      projectId: PLACEHOLDER_PROJECT_ID,
      senderRole: "customer",
      body: "Thanks! I love the white oak finish. Can we add a pull-out spice rack to the left of the range?",
    },
  ]);

  console.log("Seeded demo portal project:", PLACEHOLDER_PROJECT_ID);
  console.log("Paid invoice id:", inv1.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
