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
export const ADMIN_EMAILS: string[] = [
  "hello@boisecabinet.co",
  "webiq.co@gmail.com",
  "info@webiq.co",
];
