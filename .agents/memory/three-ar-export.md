---
name: three.js AR model export
description: Non-obvious constraints for exporting GLB/USDZ from three.js and launching native AR (Scene Viewer / Quick Look).
---

# three.js AR export & native AR launch

- **Export must run client-side.** three.js `GLTFExporter` (and the USDZ path) rely on browser-only globals like `FileReader`/canvas. Running them in a Next.js route (Node) throws "FileReader is not defined". Build geometry and export in the browser, then upload bytes to a hosting route.
- **USDZExporter: use `parseAsync(scene)`.** In the installed three version, `USDZExporter.parse(scene, onDone, onError, options)` is callback-style and returns `void`. `parseAsync` returns the `Uint8Array`. `GLTFExporter.parse(obj, onDone, onError, options)` is callback-style (4 args) — wrap in a Promise.
- **Android Scene Viewer needs an absolute HTTPS `.glb` URL**, not a blob/data URL. Host the generated GLB bytes via a DB-backed API route that serves `model/gltf-binary`, and launch via the `intent://arvr.google.com/scene-viewer/...` intent. iOS Quick Look uses an `<a rel="ar">` pointing at a `.usdz` served as `model/vnd.usdz+zip`.
- **WebGL + native AR are NOT verifiable in the headless sandbox** — no GPU, no device OS viewers. Verify compile/typecheck/route wiring only; treat actual AR launch as environmental.

**Why:** these three failure modes (server export, wrong USDZ method, relative GLB URL) each silently break the AR flow and are not discoverable from a passing typecheck.
