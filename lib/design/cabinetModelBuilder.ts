import * as THREE from "three";
import type { FinishCategory } from "@/shared/catalog/doorStyles";
import type { CabinetModule, PreviewConfig } from "@/lib/design/previewConfig";
import type {
  HardwareSpec,
  ResolvedModuleStyle,
} from "@/components/design-studio/CabinetPreview3D";

/**
 * Imperative (no-React) port of the geometry in CabinetPreview3D.tsx. Produces a
 * plain THREE.Group of cabinets ONLY — no room floor/walls — at real-world metre
 * scale with the bottom resting on y=0 so device AR viewers place it on the
 * detected floor. Reused both for GLB/USDZ export and for the photo-overlay
 * transparent cutout. Keep this in sync with CabinetPreview3D's geometry.
 */

const GAP = 0.014;
const FRONT_INSET = 0.02;

export interface BuildCabinetOptions {
  config: PreviewConfig;
  resolveModule: (module: CabinetModule) => ResolvedModuleStyle;
  hardware: HardwareSpec;
  accessories: string[];
  /** Semi-transparent 12 in floor square for AR scale sanity-check. */
  includeScaleReference?: boolean;
}

function shadeColor(hex: string, amt: number): string {
  const c = new THREE.Color(hex);
  if (amt >= 0) c.lerp(new THREE.Color("#ffffff"), amt);
  else c.multiplyScalar(1 + amt);
  return `#${c.getHexString()}`;
}

/* ── Procedural woodgrain texture (cached by color) ─────────────────────── */
const woodCache = new Map<string, THREE.CanvasTexture>();
function getWoodTexture(hex: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const cached = woodCache.get(hex);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, size, size);

  const base = new THREE.Color(hex);
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * size;
    const w = 0.6 + Math.random() * 2.2;
    const dark = Math.random() > 0.5;
    const c = base.clone();
    if (dark) c.multiplyScalar(0.82 + Math.random() * 0.1);
    else c.lerp(new THREE.Color("#ffffff"), 0.06 + Math.random() * 0.06);
    ctx.strokeStyle = `#${c.getHexString()}`;
    ctx.globalAlpha = 0.35 + Math.random() * 0.4;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + (Math.random() - 0.5) * 14,
      size * 0.33,
      x + (Math.random() - 0.5) * 14,
      size * 0.66,
      x + (Math.random() - 0.5) * 8,
      size,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  woodCache.set(hex, tex);
  return tex;
}

function makeMaterial(
  color: string,
  category: FinishCategory,
): THREE.MeshStandardMaterial {
  if (category === "gloss") {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.12,
      metalness: 0.04,
      envMapIntensity: 1.4,
      side: THREE.DoubleSide,
    });
  }
  if (category === "woodgrain") {
    const wood = getWoodTexture(color);
    return new THREE.MeshStandardMaterial({
      color,
      map: wood ?? undefined,
      roughness: 0.55,
      metalness: 0,
      side: THREE.DoubleSide,
    });
  }
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.78,
    metalness: 0,
    side: THREE.DoubleSide,
  });
}

/* ── Hardware ───────────────────────────────────────────────────────────── */
function makeHardwareMaterial(color: string) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.85,
    roughness: 0.28,
  });
}

function addPull(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  horizontal: boolean,
  length: number,
  color: string,
) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, length, 10),
    makeHardwareMaterial(color),
  );
  if (horizontal) mesh.rotation.z = Math.PI / 2;
  g.add(mesh);
  parent.add(g);
}

function addKnob(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  color: string,
) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 14, 14),
    makeHardwareMaterial(color),
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
}

function addHardwareFor(
  parent: THREE.Object3D,
  panelW: number,
  panelH: number,
  z: number,
  drawer: boolean,
  hardware: HardwareSpec,
) {
  if (hardware.category === "handleless") return;
  const isKnob = hardware.category === "knob";

  if (drawer) {
    if (isKnob) {
      addKnob(parent, 0, 0, z + 0.018, hardware.color);
      return;
    }
    addPull(
      parent,
      0,
      0,
      z + 0.018,
      true,
      Math.min(0.18, panelW * 0.5),
      hardware.color,
    );
    return;
  }

  const edgeX = panelW / 2 - 0.035;
  if (isKnob) {
    addKnob(parent, edgeX, panelH / 2 - 0.06, z + 0.018, hardware.color);
    return;
  }
  addPull(
    parent,
    edgeX,
    0,
    z + 0.018,
    false,
    Math.min(0.2, panelH * 0.4),
    hardware.color,
  );
}

/* ── A single door / drawer panel with style-specific relief ────────────── */
function addPanel(
  parent: THREE.Object3D,
  w: number,
  h: number,
  z: number,
  style: ResolvedModuleStyle,
) {
  const { doorStyle, color, category } = style;
  const isSlab = doorStyle === "slab";
  const isRaised = doorStyle === "three-piece" || doorStyle === "alpha-shaker";
  const rail =
    doorStyle === "thin-shaker"
      ? 0.035
      : doorStyle === "beta-shaker"
        ? 0.05
        : 0.06;

  const innerW = Math.max(0.04, w - rail * 2);
  const innerH = Math.max(0.04, h - rail * 2);

  const g = new THREE.Group();
  g.position.z = z;

  const outer = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 0.022),
    makeMaterial(color, category),
  );
  g.add(outer);

  if (!isSlab) {
    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(innerW, innerH, isRaised ? 0.016 : 0.01),
      makeMaterial(
        isRaised ? shadeColor(color, 0.06) : shadeColor(color, -0.08),
        category,
      ),
    );
    inner.position.z = isRaised ? 0.012 : -0.006;
    g.add(inner);
  }

  parent.add(g);
}

function addModuleFronts(
  parent: THREE.Object3D,
  module: CabinetModule,
  style: ResolvedModuleStyle,
  hardware: HardwareSpec,
  accessories: string[],
) {
  const h = module.isWall ? 0.7 : module.height;
  const frontZ = module.depth / 2 + FRONT_INSET;
  const glassUppers = module.isWall && accessories.includes("Glass uppers");

  if (module.front === "drawers") {
    const count = 3;
    const faceH = (h - GAP * (count + 1)) / count;
    const faceW = module.width - GAP * 2;
    for (let i = 0; i < count; i++) {
      const y = -h / 2 + GAP + faceH / 2 + i * (faceH + GAP);
      const g = new THREE.Group();
      g.position.y = y;
      addPanel(g, faceW, faceH, frontZ, style);
      addHardwareFor(g, faceW, faceH, frontZ + 0.011, true, hardware);
      parent.add(g);
    }
    return;
  }

  // doors — split wide runs into multiple panels
  const panelCount = Math.min(4, Math.max(1, Math.round(module.width / 0.62)));
  const panelW = (module.width - GAP * (panelCount + 1)) / panelCount;
  const panelH = h - GAP * 2;
  for (let i = 0; i < panelCount; i++) {
    const x = -module.width / 2 + GAP + panelW / 2 + i * (panelW + GAP);
    const mirrored = i % 2 === 1;
    const g = new THREE.Group();
    g.position.x = x;
    g.scale.x = mirrored ? -1 : 1;

    if (glassUppers) {
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(panelW, panelH, 0.02),
        new THREE.MeshStandardMaterial({
          color: style.color,
          transparent: true,
          opacity: 0.32,
          roughness: 0.05,
          metalness: 0.1,
        }),
      );
      glass.position.z = frontZ;
      g.add(glass);
    } else {
      addPanel(g, panelW, panelH, frontZ, style);
    }

    // counter-mirror the hardware so pulls stay on the outer edge
    const hwGroup = new THREE.Group();
    hwGroup.scale.x = mirrored ? -1 : 1;
    addHardwareFor(hwGroup, panelW, panelH, frontZ + 0.011, false, hardware);
    g.add(hwGroup);

    parent.add(g);
  }
}

function addModule(
  parent: THREE.Object3D,
  module: CabinetModule,
  style: ResolvedModuleStyle,
  hardware: HardwareSpec,
  accessories: string[],
) {
  const y = module.isWall ? 1.55 : module.height / 2;
  const height = module.isWall ? 0.7 : module.height;
  const counterColor = "#D9D4CC";

  const g = new THREE.Group();
  g.position.set(module.x, y, module.z);
  g.rotation.y = module.facing ?? 0;

  // carcass
  const carcass = new THREE.Mesh(
    new THREE.BoxGeometry(module.width, height, module.depth),
    new THREE.MeshStandardMaterial({
      color: shadeColor(style.color, -0.12),
      roughness: 0.85,
    }),
  );
  g.add(carcass);

  addModuleFronts(g, module, style, hardware, accessories);

  // countertop on base modules
  if (!module.isWall) {
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(module.width + 0.03, 0.04, module.depth + 0.04),
      new THREE.MeshStandardMaterial({
        color: counterColor,
        roughness: 0.4,
        metalness: 0.05,
      }),
    );
    counter.position.set(0, height / 2 + 0.02, 0.01);
    g.add(counter);
  }

  // under-cabinet lighting prep glow
  if (module.isWall && accessories.includes("Under-cabinet lighting prep")) {
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(module.width * 0.9, 0.015, 0.04),
      new THREE.MeshStandardMaterial({
        color: "#fff4d6",
        emissive: new THREE.Color("#ffd98a"),
        emissiveIntensity: 1.4,
      }),
    );
    glow.position.set(0, -height / 2 - 0.01, module.depth / 2 - 0.05);
    g.add(glow);
  }

  parent.add(g);
}

/**
 * Build a THREE.Group containing only the cabinets, centred on the X/Z origin
 * with the lowest point at y=0 (ready for floor placement in AR).
 */
/** 12 in (0.3048 m) floor marker — helps verify AR scale on device. */
function addScaleReference(root: THREE.Group, layoutBox: THREE.Box3): void {
  const size = 0.3048;
  const geo = new THREE.BoxGeometry(size, 0.004, size);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x6b7280,
    transparent: true,
    opacity: 0.4,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = "ScaleReference12in";
  const offsetX = layoutBox.max.x + size * 0.75;
  const offsetZ = layoutBox.min.z;
  mesh.position.set(offsetX, 0.002, offsetZ);
  root.add(mesh);
}

export function buildCabinetGroup(opts: BuildCabinetOptions): THREE.Group {
  const { config, resolveModule, hardware, accessories, includeScaleReference } =
    opts;
  const root = new THREE.Group();
  root.name = "CabinetDesign";

  for (const module of config.modules) {
    addModule(root, module, resolveModule(module), hardware, accessories);
  }

  // Recenter on origin and drop the bottom to the floor plane.
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return root;
  const center = box.getCenter(new THREE.Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= box.min.y;

  if (includeScaleReference) {
    const placed = new THREE.Box3().setFromObject(root);
    addScaleReference(root, placed);
  }

  return root;
}

/**
 * Render the cabinets to a transparent PNG (data URL) for compositing over a
 * room photo. Returns null when WebGL/canvas is unavailable (SSR or
 * unsupported device) so callers can fall back gracefully.
 */
export function renderCabinetCutout(
  opts: BuildCabinetOptions,
  width = 1100,
  height = 820,
): string | null {
  if (typeof document === "undefined") return null;
  let renderer: THREE.WebGLRenderer | null = null;
  try {
    const group = buildCabinetGroup(opts);
    const canvas = document.createElement("canvas");
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.add(group);
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dir = new THREE.DirectionalLight(0xffffff, 1.05);
    dir.position.set(3, 6, 4);
    scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dir2.position.set(-4, 3, -2);
    scene.add(dir2);

    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const dist = maxDim * 1.9;
    camera.position.set(
      center.x + dist * 0.18,
      center.y + dist * 0.16,
      center.z + dist,
    );
    camera.lookAt(center);

    renderer.render(scene, camera);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  } finally {
    renderer?.dispose();
  }
}
