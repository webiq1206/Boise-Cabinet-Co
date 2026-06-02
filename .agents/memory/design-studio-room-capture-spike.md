---
name: Design Studio room capture spike
description: Evaluation of iOS RoomPlan vs WebXR for importing wall geometry into Design Studio
---

# Room capture spike (Phase 4)

## Goal

Import measured wall geometry into `roomMeta` + `roomBounds` so the 2D planner and `planAdvisor` validate against the real room—not only user-typed dimensions.

## Options evaluated

### iOS RoomPlan (ARKit)

- **Pros:** Wall segments, doors/windows as categories, LiDAR accuracy on supported iPhones/iPads, export USDZ/JSON via `CapturedRoom`.
- **Cons:** iOS-only; requires native wrapper (Capacitor plugin, companion app, or App Clip) to pass data to the Next.js web app; App Store / maintenance cost.
- **Integration sketch:** Native capture → JSON `{ walls: [{ lengthM, transform }], openings: [...] }` → POST to `/api/designs/room-scan` → map to `RoomMeta` + `RoomBounds` + `obstacles[]`.

### WebXR + manual corner pins (browser)

- **Pros:** Stays in Next.js; Android + desktop can participate with hit-test floor plane.
- **Cons:** No reliable automatic wall mesh in mobile Safari; user still pins corners or traces walls; weaker accuracy than RoomPlan.
- **Integration sketch:** WebXR session → user taps 4 floor corners → compute width/depth → set `roomMeta.userConfirmed` (similar to manual form, slightly faster).

### Tape-measure form (implemented Phase 1)

- **Pros:** Works everywhere; no new permissions; honest accuracy disclaimer.
- **Cons:** User effort; typos possible.

## Recommendation

1. **Ship and iterate on manual `RoomDimensionsForm`** (done) for all users.
2. **Pilot RoomPlan** only if analytics show >60% Design Studio AR usage on iOS and sales cites measurement friction.
3. **Defer full WebXR room mesh** until browser APIs stabilize; use corner-pin WebXR only as a faster manual entry UX, not as “scanning.”

## Acceptance criteria for a RoomPlan MVP

- Import sets `roomMeta.userConfirmed = true` and obstacles for detected openings.
- User can edit imported values before validation runs.
- Clear copy: scan is planning-grade; site template measure still required for order.

## Non-goals for spike

- Feeding AR Quick Look placement coordinates back into the web app (platform limitation).
- Replacing field template measure for final order.
