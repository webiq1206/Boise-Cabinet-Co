# GBP playbook implementation

- Source of truth: `shared/gbpConfig.ts` (NAP, services, products, Q&A, UTM URLs).
- User-facing doc: `docs/GBP-SETUP-GUIDE.md` (single plain-language step-by-step; no code). Regenerate: `npm run gbp:docs`.
- Commands: `npm run gbp:prepare` (verify + photos + docs), `npm run gbp:photos` → `public/gbp-upload/` (36 SEO-named assets).
- After GBP verification: set `NEXT_PUBLIC_GBP_URL` in production env.
- Homepage FAQ consultation answer must not mention showroom (SAB, no public showroom).
- Schema `serviceArea` includes Garden City for GBP alignment.
