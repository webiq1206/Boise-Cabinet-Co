// Canonical list of admin email addresses for the site and all portals.
// Single source of truth: referenced by the auth role-decision layer
// (lib/auth.ts), the storage upsert layer (server/storage.ts), and the
// production admin bootstrap (instrumentation.ts) so the set of admins can
// never silently diverge across those layers.
//
// Admin access is only ever granted through a verified path: the production
// bootstrap (gated by ADMIN_BOOTSTRAP_PASSWORD, which proves Repl ownership)
// or the verified OIDC login flow. Password self-registration never grants
// admin even for these addresses.
//
// Entries are normalized (trimmed + lowercased) on export because the role
// check in lib/auth.ts does `ADMIN_EMAILS.includes(email.toLowerCase())`; an
// entry with stray capitalization or whitespace would otherwise silently fail
// to match and quietly deny admin access.
const RAW_ADMIN_EMAILS: string[] = [
  "hello@boisecabinet.co",
  "hello@boiseremodeling.co",
  "hello@p5homeco.com",
  "webiq.co@gmail.com",
  "info@webiq.co",
];

export const ADMIN_EMAILS: string[] = Array.from(
  new Set(RAW_ADMIN_EMAILS.map((e) => e.trim().toLowerCase()).filter(Boolean)),
);
