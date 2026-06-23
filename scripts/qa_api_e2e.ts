import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import { registerRoutes } from "../server/routes";

type SeedResponse = {
  success: boolean;
  seeded: {
    pendingLeadId: string;
    availableLeadId: string;
    purchasedLeadId: string;
  };
};

async function main() {
  process.env.NODE_ENV = process.env.NODE_ENV || "development";

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  await registerRoutes(app);

  const admin = request.agent(app);
  const sub = request.agent(app);
  const subNoAgree = request.agent(app);

  // Unauthenticated should be blocked from /api/leads
  {
    const res = await request(app).get("/api/leads");
    assert.equal(res.status, 401);
  }

  // Dev login as admin
  {
    const res = await admin.post("/api/auth/test-login").send({ userId: "admin-temp-id" });
    assert.equal(res.status, 200);
  }

  // Admin can fetch auth user
  {
    const res = await admin.get("/api/auth/user");
    assert.equal(res.status, 200);
    assert.equal(res.body?.role, "admin");
  }

  // Seed leads
  const seed: SeedResponse = await (async () => {
    const res = await admin.post("/api/dev/seed");
    assert.equal(res.status, 200);
    assert.equal(res.body?.success, true);
    return res.body as SeedResponse;
  })();

  // Admin sees unmasked leads
  {
    const res = await admin.get("/api/leads");
    assert.equal(res.status, 200);
    const leads: any[] = res.body;

    const pending = leads.find((l) => l.id === seed.seeded.pendingLeadId);
    assert.ok(pending);
    assert.notEqual(pending.name, "***");
    assert.equal(pending.status, "pending_admin");

    const available = leads.find((l) => l.id === seed.seeded.availableLeadId);
    assert.ok(available);
    assert.notEqual(available.email, "***");
    assert.equal(available.status, "available");
  }

  // Admin accept pending lead
  {
    const res = await admin.post(`/api/leads/${seed.seeded.pendingLeadId}/accept`).send({});
    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "accepted");
  }

  // Admin notifications endpoint should be accessible
  {
    const res = await admin.get("/api/notifications");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  }

  // Admin decline a fresh pending lead (seed again to get a new pending)
  const seed2: SeedResponse = await (async () => {
    const res = await admin.post("/api/dev/seed");
    assert.equal(res.status, 200);
    return res.body as SeedResponse;
  })();
  {
    const res = await admin.post(`/api/leads/${seed2.seeded.pendingLeadId}/decline`).send({});
    assert.equal(res.status, 200);
    assert.equal(res.body?.status, "available");
  }

  // Dev login as subcontractor
  {
    const res = await sub.post("/api/auth/test-login").send({ userId: "sub-temp-id" });
    assert.equal(res.status, 200);
  }

  // Subcontractor notifications endpoint should be accessible
  {
    const res = await sub.get("/api/notifications");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
  }

  // Subcontractor sees available leads but contact info is masked
  let firstAvailableId: string | null = null;
  {
    const res = await sub.get("/api/leads?availableOnly=true");
    assert.equal(res.status, 200);
    const leads: any[] = res.body;
    assert.ok(leads.length > 0);
    const anyLead = leads[0];
    firstAvailableId = anyLead.id;
    assert.equal(anyLead.name, "***");
    assert.equal(anyLead.email, "***");
    assert.equal(anyLead.phone, "***");
  }

  // Watch/unwatch flow
  {
    assert.ok(firstAvailableId);

    const watchRes = await sub.post(`/api/leads/${firstAvailableId}/watch`).send({});
    assert.equal(watchRes.status, 200);

    const userRes = await sub.get("/api/user");
    assert.equal(userRes.status, 200);
    const watched = userRes.body?.watchedLeads;
    assert.ok(Array.isArray(watched));
    assert.ok(watched.includes(firstAvailableId));

    const watchlistRes = await sub.get("/api/leads/watchlist");
    assert.equal(watchlistRes.status, 200);
    const wl: any[] = watchlistRes.body;
    assert.ok(wl.some((l) => l.id === firstAvailableId));

    const unwatchRes = await sub.post(`/api/leads/${firstAvailableId}/unwatch`).send({});
    assert.equal(unwatchRes.status, 200);
  }

  // Purchase history should include seeded purchased lead (no Stripe needed)
  {
    const res = await sub.get("/api/leads/purchases");
    assert.equal(res.status, 200);
    const purchases: any[] = res.body;
    assert.ok(purchases.length > 0);
    const purchased = purchases.find((p) => p?.lead?.id === seed.seeded.purchasedLeadId);
    assert.ok(purchased);
    assert.notEqual(purchased.lead.name, "***");
  }

  // Stripe endpoints should fail gracefully when not configured
  {
    const res = await sub.post("/api/create-payment-intent").send({ leadId: seed.seeded.availableLeadId });
    assert.equal(res.status, 503);
  }

  // Agreement acceptance: create a subcontractor without agreement, accept it, verify persisted
  {
    const login = await subNoAgree
      .post("/api/auth/test-login")
      .send({ userId: "sub-noagree-id", role: "subcontractor", email: "sub-noagree@example.com" });
    assert.equal(login.status, 200);

    const before = await subNoAgree.get("/api/user");
    assert.equal(before.status, 200);
    assert.equal(Boolean(before.body?.agreementAccepted), false);

    const accept = await subNoAgree.post("/api/user/accept-agreement").send({});
    assert.equal(accept.status, 200);
    assert.equal(Boolean(accept.body?.agreementAccepted), true);

    const after = await subNoAgree.get("/api/user");
    assert.equal(after.status, 200);
    assert.equal(Boolean(after.body?.agreementAccepted), true);
  }

  // Quote submission baseline: if finalQuote omitted but service measurements are provided,
  // the server should auto-calculate pricing to avoid $10 leads.
  let newQuoteId: string | null = null;
  {
    const res = await request(app).post("/api/quotes").send({
      name: "API Quote Test",
      email: "api-quote@example.com",
      phone: "2085550199",
      city: "Kuna",
      propertyType: "residential",
      serviceType: "kitchen-remodel",
      selectedServices: ["kitchen-remodel"],
      address: "123 Test St",
      propertySize: 2000,
      serviceData: {
        "kitchen-remodel": {
          propertySize: 2000,
        },
      },
      // intentionally omit finalQuote/lineItems to ensure server auto-calculates
    });
    assert.equal(res.status, 200);
    assert.equal(res.body?.success, true);
    assert.ok(res.body?.quoteId);
    newQuoteId = res.body.quoteId;
  }

  {
    assert.ok(newQuoteId);
    const statusRes = await request(app).get(`/api/quotes/${newQuoteId}/status`);
    assert.equal(statusRes.status, 200);
    assert.equal(statusRes.body?.quoteId, newQuoteId);
    assert.equal(statusRes.body?.status, "under_review");

    const res = await admin.get("/api/leads");
    assert.equal(res.status, 200);
    const leads: any[] = res.body;
    const created = leads.find((l) => l.quoteId === newQuoteId);
    assert.ok(created);
    assert.ok(created.finalQuote !== null && created.finalQuote !== undefined);
    assert.ok(parseFloat(String(created.baseLeadPrice)) > 10);
    assert.ok(parseFloat(String(created.currentLeadPrice)) > 10);

    const acceptRes = await admin.post(`/api/leads/${created.id}/accept`).send({});
    assert.equal(acceptRes.status, 200);

    const statusRes2 = await request(app).get(`/api/quotes/${newQuoteId}/status`);
    assert.equal(statusRes2.status, 200);
    assert.equal(statusRes2.body?.status, "contact_soon");
  }

  // eslint-disable-next-line no-console
  console.log("[qa_api_e2e] All checks passed.");
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[qa_api_e2e] FAILED:", err);
  process.exit(1);
});

