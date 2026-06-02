---
name: Design Studio shared module model
description: How the 2D planner and 3D preview stay in sync, and the save-serialization gotcha
---

# Design Studio shared module model

The Design Studio keeps cabinet placement in a SINGLE source of truth:
`design.modules` (array of `CabinetModule`) plus `design.roomBounds` and
`design.selectedModuleId`, all on `DesignStudioProvider`. Both the 2D planner
(`Room2DPlanner.tsx`) and the 3D preview (`LivePreviewPanel` →
`buildPreviewConfig(..., design.modules)`) render from it; selection is lifted
to the provider so highlighting syncs across both views.

**Why:** earlier the 3D preview derived modules from the layout slug and held
selection in local state, so a 2D planner could not stay in sync.

**Save gotcha:** `saveDesign` must serialize `modules`, `moduleOverrides`, AND
`roomBounds` inside `layoutJson`. If you add new per-module state, add it here
too — otherwise edits silently vanish on reload (a prior review caught
`moduleOverrides` being dropped this way).

**Seeding:** changing `design.layout` reseeds `modules` from
`layoutToModules(layout)`, recomputes `roomBounds`, and clears overrides +
selection. Module ids are layout-specific, so overrides keyed by old ids would
orphan.

**Sandbox note:** the WebGL 3D scene cannot be screenshot-verified in the
headless agent sandbox (environmental, not a bug). The 2D planner is SVG and is
DOM/screenshot-verifiable. Verify shared logic via the pure functions in
`lib/design/planAdvisor.ts` instead.
