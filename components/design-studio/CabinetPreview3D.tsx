"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import type { CabinetModule, PreviewConfig, RoomBounds } from "@/lib/design/previewConfig";
import type { FinishCategory } from "@/shared/catalog/doorStyles";

export type ViewMode = "orbit" | "walk";

/** Imperative capture handle exposed by the 3D scene. */
export interface CaptureApi {
  /** Render the current frame and return a PNG data URL (or null on failure). */
  screenshot: () => string | null;
  /** Record a rotating turntable clip and resolve a video Blob (or null). */
  record: (seconds?: number) => Promise<Blob | null>;
}

export type CaptureApiRef = { current: CaptureApi | null };

/** Pick the best supported webm mime type for MediaRecorder. */
function pickVideoMime(): string {
  if (typeof MediaRecorder === "undefined") return "video/webm";
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return "video/webm";
}

export interface ResolvedModuleStyle {
  color: string;
  category: FinishCategory;
  doorStyle: string;
}

export interface HardwareSpec {
  category: "pull" | "knob" | "handleless" | "other";
  color: string;
}

interface SceneProps {
  config: PreviewConfig;
  resolveModule: (module: CabinetModule) => ResolvedModuleStyle;
  hardware: HardwareSpec;
  accessories: string[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  viewMode: ViewMode;
  resetSignal: number;
  /** Scanned room bounds, sizes the floor plane (metres). */
  roomBounds?: RoomBounds | null;
  /** When provided, the scene wires capture (screenshot/video) handlers here. */
  captureApiRef?: CaptureApiRef;
}

const GAP = 0.014;
const FRONT_INSET = 0.02;

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

/* ── Finish material props by category ──────────────────────────────────── */
function FinishMaterial({ color, category }: { color: string; category: FinishCategory }) {
  const wood = useMemo(
    () => (category === "woodgrain" ? getWoodTexture(color) : null),
    [color, category],
  );

  if (category === "gloss") {
    return (
      <meshStandardMaterial
        color={color}
        roughness={0.12}
        metalness={0.04}
        envMapIntensity={1.4}
        side={THREE.DoubleSide}
      />
    );
  }
  if (category === "woodgrain") {
    return (
      <meshStandardMaterial
        color={color}
        map={wood ?? undefined}
        roughness={0.55}
        metalness={0}
        side={THREE.DoubleSide}
      />
    );
  }
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.78}
      metalness={0}
      side={THREE.DoubleSide}
    />
  );
}

/* ── Hardware ───────────────────────────────────────────────────────────── */
function Pull({
  x,
  y,
  z,
  horizontal,
  length,
  color,
}: {
  x: number;
  y: number;
  z: number;
  horizontal: boolean;
  length: number;
  color: string;
}) {
  return (
    <group position={[x, y, z]}>
      <mesh
        rotation={horizontal ? [0, 0, Math.PI / 2] : [0, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.008, 0.008, length, 10]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.28} />
      </mesh>
    </group>
  );
}

function Knob({ x, y, z, color }: { x: number; y: number; z: number; color: string }) {
  return (
    <mesh position={[x, y, z]} castShadow>
      <sphereGeometry args={[0.016, 14, 14]} />
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.28} />
    </mesh>
  );
}

function HardwareFor({
  panelW,
  panelH,
  z,
  drawer,
  hardware,
}: {
  panelW: number;
  panelH: number;
  z: number;
  drawer: boolean;
  hardware: HardwareSpec;
}) {
  if (hardware.category === "handleless") return null;
  const isKnob = hardware.category === "knob";

  if (drawer) {
    if (isKnob) return <Knob x={0} y={0} z={z + 0.018} color={hardware.color} />;
    return (
      <Pull
        x={0}
        y={0}
        z={z + 0.018}
        horizontal
        length={Math.min(0.18, panelW * 0.5)}
        color={hardware.color}
      />
    );
  }

  // door
  const edgeX = panelW / 2 - 0.035;
  if (isKnob) {
    return <Knob x={edgeX} y={panelH / 2 - 0.06} z={z + 0.018} color={hardware.color} />;
  }
  return (
    <Pull
      x={edgeX}
      y={0}
      z={z + 0.018}
      horizontal={false}
      length={Math.min(0.2, panelH * 0.4)}
      color={hardware.color}
    />
  );
}

/* ── A single door / drawer panel with style-specific relief ────────────── */
function Panel({
  w,
  h,
  z,
  style,
}: {
  w: number;
  h: number;
  z: number;
  style: ResolvedModuleStyle;
}) {
  const { doorStyle, color, category } = style;
  const isSlab = doorStyle === "slab";
  const isRaised = false;
  const rail = doorStyle === "thin-shaker" ? 0.035 : 0.06;

  const innerW = Math.max(0.04, w - rail * 2);
  const innerH = Math.max(0.04, h - rail * 2);

  return (
    <group position={[0, 0, z]}>
      {/* outer face */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, 0.022]} />
        <FinishMaterial color={color} category={category} />
      </mesh>

      {!isSlab && (
        <mesh position={[0, 0, isRaised ? 0.012 : -0.006]} castShadow>
          <boxGeometry args={[innerW, innerH, isRaised ? 0.016 : 0.01]} />
          <FinishMaterial
            color={isRaised ? shadeColor(color, 0.06) : shadeColor(color, -0.08)}
            category={category}
          />
        </mesh>
      )}
    </group>
  );
}

function ModuleFronts({
  module,
  style,
  hardware,
  accessories,
}: {
  module: CabinetModule;
  style: ResolvedModuleStyle;
  hardware: HardwareSpec;
  accessories: string[];
}) {
  const h = module.isWall ? 0.7 : module.height;
  const frontZ = module.depth / 2 + FRONT_INSET;
  const glassUppers = module.isWall && accessories.includes("Glass uppers");

  if (module.front === "drawers") {
    const count = 3;
    const faceH = (h - GAP * (count + 1)) / count;
    const faceW = module.width - GAP * 2;
    return (
      <group>
        {Array.from({ length: count }).map((_, i) => {
          const y = -h / 2 + GAP + faceH / 2 + i * (faceH + GAP);
          return (
            <group key={i} position={[0, y, 0]}>
              <Panel w={faceW} h={faceH} z={frontZ} style={style} />
              <HardwareFor
                panelW={faceW}
                panelH={faceH}
                z={frontZ + 0.011}
                drawer
                hardware={hardware}
              />
            </group>
          );
        })}
      </group>
    );
  }

  // doors, split wide runs into multiple panels
  const panelCount = Math.min(4, Math.max(1, Math.round(module.width / 0.62)));
  const panelW = (module.width - GAP * (panelCount + 1)) / panelCount;
  const panelH = h - GAP * 2;
  return (
    <group>
      {Array.from({ length: panelCount }).map((_, i) => {
        const x = -module.width / 2 + GAP + panelW / 2 + i * (panelW + GAP);
        const mirrored = i % 2 === 1;
        return (
          <group key={i} position={[x, 0, 0]} scale={[mirrored ? -1 : 1, 1, 1]}>
            {glassUppers ? (
              <mesh position={[0, 0, frontZ]}>
                <boxGeometry args={[panelW, panelH, 0.02]} />
                <meshStandardMaterial
                  color={style.color}
                  transparent
                  opacity={0.32}
                  roughness={0.05}
                  metalness={0.1}
                />
              </mesh>
            ) : (
              <Panel w={panelW} h={panelH} z={frontZ} style={style} />
            )}
            <group scale={[mirrored ? -1 : 1, 1, 1]}>
              <HardwareFor
                panelW={panelW}
                panelH={panelH}
                z={frontZ + 0.011}
                drawer={false}
                hardware={hardware}
              />
            </group>
          </group>
        );
      })}
    </group>
  );
}

/* ── One cabinet module ─────────────────────────────────────────────────── */
function CabinetModuleMesh({
  module,
  style,
  hardware,
  accessories,
  selected,
  onSelect,
}: {
  module: CabinetModule;
  style: ResolvedModuleStyle;
  hardware: HardwareSpec;
  accessories: string[];
  selected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const y = module.isWall ? 1.55 : module.height / 2;
  const height = module.isWall ? 0.7 : module.height;
  const counterColor = "#D9D4CC";

  return (
    <group
      position={[module.x, y, module.z]}
      rotation={[0, module.facing ?? 0, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(module.id);
      }}
    >
      {/* carcass */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[module.width, height, module.depth]} />
        <meshStandardMaterial color={shadeColor(style.color, -0.12)} roughness={0.85} />
      </mesh>

      <ModuleFronts
        module={module}
        style={style}
        hardware={hardware}
        accessories={accessories}
      />

      {/* countertop on base modules */}
      {!module.isWall && (
        <mesh position={[0, height / 2 + 0.02, 0.01]} castShadow receiveShadow>
          <boxGeometry args={[module.width + 0.03, 0.04, module.depth + 0.04]} />
          <meshStandardMaterial color={counterColor} roughness={0.4} metalness={0.05} />
        </mesh>
      )}

      {/* under-cabinet lighting prep glow */}
      {module.isWall && accessories.includes("Under-cabinet lighting prep") && (
        <mesh position={[0, -height / 2 - 0.01, module.depth / 2 - 0.05]}>
          <boxGeometry args={[module.width * 0.9, 0.015, 0.04]} />
          <meshStandardMaterial
            color="#fff4d6"
            emissive="#ffd98a"
            emissiveIntensity={1.4}
          />
        </mesh>
      )}

      {/* selection highlight */}
      {selected && (
        <lineSegments>
          <edgesGeometry
            args={[
              new THREE.BoxGeometry(
                module.width + 0.05,
                height + 0.06,
                module.depth + 0.05,
              ),
            ]}
          />
          <lineBasicMaterial color="#C2632B" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
}

/* ── Camera rig: positions camera per view mode ─────────────────────────── */
function CameraRig({
  viewMode,
  resetSignal,
  controlsRef,
}: {
  viewMode: ViewMode;
  resetSignal: number;
  controlsRef: React.MutableRefObject<any>;
}) {
  const { camera } = useThree();
  useEffect(() => {
    if (viewMode === "walk") {
      camera.position.set(2.2, 1.45, 2.9);
    } else {
      camera.position.set(3.6, 2.3, 3.6);
    }
    const ctrl = controlsRef.current;
    if (ctrl) {
      ctrl.target.set(0, viewMode === "walk" ? 1.0 : 0.85, 0);
      ctrl.update();
    }
  }, [viewMode, resetSignal, camera, controlsRef]);
  return null;
}

/* ── Capture controller: screenshot + turntable video from the live canvas ── */
function CaptureController({
  captureApiRef,
  controlsRef,
}: {
  captureApiRef: CaptureApiRef;
  controlsRef: React.MutableRefObject<any>;
}) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    const api: CaptureApi = {
      screenshot: () => {
        try {
          gl.render(scene, camera);
          return gl.domElement.toDataURL("image/png");
        } catch {
          return null;
        }
      },
      record: (seconds = 4) =>
        new Promise<Blob | null>((resolve) => {
          try {
            const canvas = gl.domElement as HTMLCanvasElement & {
              captureStream?: (fps?: number) => MediaStream;
            };
            if (
              typeof canvas.captureStream !== "function" ||
              typeof MediaRecorder === "undefined"
            ) {
              resolve(null);
              return;
            }
            const target =
              controlsRef.current?.target?.clone?.() ??
              new THREE.Vector3(0, 0.85, 0);
            const startPos = camera.position.clone();
            const radius = Math.hypot(
              startPos.x - target.x,
              startPos.z - target.z,
            );
            const startAngle = Math.atan2(
              startPos.z - target.z,
              startPos.x - target.x,
            );
            const yLevel = startPos.y;

            const stream = canvas.captureStream(30);
            const mimeType = pickVideoMime();
            const recorder = new MediaRecorder(stream, { mimeType });
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) chunks.push(e.data);
            };
            recorder.onstop = () => {
              // Restore the original camera framing.
              camera.position.copy(startPos);
              camera.lookAt(target);
              controlsRef.current?.update?.();
              gl.render(scene, camera);
              resolve(new Blob(chunks, { type: mimeType }));
            };

            const start = performance.now();
            recorder.start();
            const tick = (now: number) => {
              const frac = Math.min(1, (now - start) / 1000 / seconds);
              const angle = startAngle + frac * Math.PI * 2;
              camera.position.set(
                target.x + radius * Math.cos(angle),
                yLevel,
                target.z + radius * Math.sin(angle),
              );
              camera.lookAt(target);
              gl.render(scene, camera);
              if (frac < 1) {
                requestAnimationFrame(tick);
              } else {
                recorder.stop();
              }
            };
            requestAnimationFrame(tick);
          } catch {
            resolve(null);
          }
        }),
    };
    captureApiRef.current = api;
    return () => {
      if (captureApiRef.current === api) captureApiRef.current = null;
    };
  }, [captureApiRef, controlsRef, gl, scene, camera]);

  return null;
}

function Scene({
  config,
  resolveModule,
  hardware,
  accessories,
  selectedId,
  onSelect,
  viewMode,
  resetSignal,
  roomBounds,
  captureApiRef,
}: SceneProps) {
  const controlsRef = useRef<any>(null);
  const floorW = roomBounds
    ? Math.max(2, roomBounds.maxX - roomBounds.minX + 0.4)
    : 14;
  const floorD = roomBounds
    ? Math.max(2, roomBounds.maxZ - roomBounds.minZ + 0.4)
    : 14;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.15} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.35} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[floorW, floorD]} />
        <meshStandardMaterial color="#E8E4DF" roughness={0.92} />
      </mesh>
      <mesh position={[0, 1.6, -1.35]} receiveShadow>
        <planeGeometry args={[9, 3.4]} />
        <meshStandardMaterial color="#F0EDE8" roughness={0.96} />
      </mesh>

      {config.modules.map((mod) => (
        <CabinetModuleMesh
          key={mod.id}
          module={mod}
          style={resolveModule(mod)}
          hardware={hardware}
          accessories={accessories}
          selected={selectedId === mod.id}
          onSelect={onSelect}
        />
      ))}

      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={9} blur={2.2} />
      <Environment preset="apartment" />

      <CameraRig viewMode={viewMode} resetSignal={resetSignal} controlsRef={controlsRef} />
      {captureApiRef && (
        <CaptureController captureApiRef={captureApiRef} controlsRef={controlsRef} />
      )}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={viewMode === "walk" ? Math.PI / 2.02 : Math.PI / 2.2}
        minDistance={viewMode === "walk" ? 1.2 : 2.5}
        maxDistance={viewMode === "walk" ? 4.5 : 7}
      />
    </>
  );
}

export function CabinetScene3D(props: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [3.6, 2.3, 3.6], fov: 42 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      style={{ background: "linear-gradient(180deg, #f8f5f0 0%, #ebe6df 100%)" }}
      onPointerMissed={() => props.onSelect(null)}
    >
      <Scene {...props} />
    </Canvas>
  );
}
