# GBP Post-Launch Checklist — Boise Cabinet Co

Complete after Google verifies your profile. See [GBP-PLAYBOOK.md](./GBP-PLAYBOOK.md) for full context.

## Immediate (day 1)

- [ ] Search `Boise Cabinet Co` in Google Maps — confirm name, phone, hours, SAB (no street address)
- [ ] Copy public GBP URL → set `NEXT_PUBLIC_GBP_URL` in production `.env`
- [ ] Publish first Google Post (project photo + city name + Book CTA)
- [ ] Seed 8 Q&A pairs from [GBP-PLAYBOOK.md](./GBP-PLAYBOOK.md) Phase 8
- [ ] Enable messaging with welcome message from playbook Phase 10

## Week 1

- [ ] Import profile to **Bing Places** (import from Google)
- [ ] Import profile to **Apple Business Connect**
- [ ] Confirm Facebook + Instagram pages use identical NAP
- [ ] Share GBP review link with install crew (add to project closeout checklist)
- [ ] Upload any remaining real install photos not in `public/gbp-upload/`

## Ongoing

| Cadence | Task |
|---|---|
| Weekly | 1 GBP post (rotate: project, guide, product, seasonal) |
| Per install | Review request email/SMS with GBP review link |
| Within 48h | Respond to every review (mention service + city) |
| Monthly | Upload 2-4 new owner photos from active projects |
| Quarterly | Audit NAP on top 10 citations |

## Website env vars (after milestones)

| Milestone | Variables |
|---|---|
| GBP verified | `NEXT_PUBLIC_GBP_URL` |
| License ready | `NEXT_PUBLIC_LICENSE_NUMBER` |
| 5+ real reviews | `NEXT_PUBLIC_REVIEW_RATING`, `NEXT_PUBLIC_REVIEW_COUNT` |
| Profiles claimed | `NEXT_PUBLIC_HOUZZ_URL`, `NEXT_PUBLIC_BBB_URL`, `NEXT_PUBLIC_YELP_URL` |

## Review response template

> Thank you, [Name]! It was a pleasure designing and installing your [kitchen/vanity] cabinets in [City]. We appreciate you trusting Boise Cabinet Co with your home.

## Google Post rotation (city order)

Boise → Meridian → Eagle → Nampa → Kuna → Star → Middleton → Caldwell → repeat

Appointment CTA URL: `https://boisecabinet.co/contact?utm_source=gbp&utm_medium=organic&utm_campaign=appointment`
