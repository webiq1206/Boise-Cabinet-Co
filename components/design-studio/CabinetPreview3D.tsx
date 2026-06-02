"use client";

import { Canvas } from "@react-three/fiber";
import type { PreviewConfig } from "@/lib/design/previewConfig";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";

function CabinetBox({
  module,
  finishColor,
  doorStyle,
}: {
  module: PreviewConfig["modules"][0];
  finishColor: string;
  doorStyle: string;
}) {
  const y = module.isWall ? 1.5 : module.height / 2;
  const height = module.isWall ? 0.7 : module.height;
  const isShaker = doorStyle.includes("shaker") || doorStyle === "beaded";

  return (
    <group position={[module.x, y, module.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[module.width, height, module.depth]} />
        <meshStandardMaterial color={finishColor} roughness={0.35} metalness={0.05} />
      </mesh>
      {isShaker && (
        <mesh position={[0, 0, module.depth / 2 + 0.002]}>
          <boxGeometry args={[module.width * 0.85, height * 0.85, 0.01]} />
          <meshStandardMaterial color={finishColor} roughness={0.4} />
        </mesh>
      )}
      {!module.isWall && (
        <mesh position={[0, height / 2 + 0.015, module.depth / 2 + 0.01]}>
          <boxGeometry args={[module.width * 0.92, 0.02, 0.02]} />
          <meshStandardMaterial color="#8B7355" metalness={0.6} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
}

function Scene({ config }: { config: PreviewConfig }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.35} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#E8E4DF" roughness={0.9} />
      </mesh>

      <mesh position={[0, 1.5, -1.2]} receiveShadow>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#F0EDE8" roughness={0.95} />
      </mesh>

      {config.modules.map((mod, i) => (
        <CabinetBox
          key={`${mod.x}-${mod.z}-${i}`}
          module={mod}
          finishColor={config.finishColor}
          doorStyle={config.doorStyle}
        />
      ))}

      <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={8} blur={2} />
      <Environment preset="apartment" />
      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={2.5}
        maxDistance={6}
        target={[0, 0.8, 0]}
      />
    </>
  );
}

export function CabinetScene3D({ config }: { config: PreviewConfig }) {
  return (
    <Canvas
      shadows
      camera={{ position: [3.5, 2.2, 3.5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "linear-gradient(180deg, #f8f5f0 0%, #ebe6df 100%)" }}
    >
      <Scene config={config} />
    </Canvas>
  );
}

export function CabinetPreview3D({ config }: { config: PreviewConfig }) {
  return (
    <div className="aspect-video w-full rounded-sm overflow-hidden border border-border">
      <CabinetScene3D config={config} />
    </div>
  );
}
