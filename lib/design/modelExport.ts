import * as THREE from "three";

/**
 * Browser-only model exporters. The three.js GLTF/USDZ exporters rely on
 * FileReader/canvas which only exist in the browser, so these must run
 * client-side (verified: server-side GLTF export fails on missing FileReader).
 */

/** Export a THREE scene/group to a binary GLB ArrayBuffer (Android Scene Viewer). */
export async function exportGLB(object: THREE.Object3D): Promise<ArrayBuffer> {
  const { GLTFExporter } = await import(
    "three/examples/jsm/exporters/GLTFExporter.js"
  );
  const exporter = new GLTFExporter();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      object,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          // Non-binary fallback: encode the glTF JSON as bytes.
          const json = JSON.stringify(result);
          resolve(new TextEncoder().encode(json).buffer);
        }
      },
      (error) => reject(error),
      { binary: true },
    );
  });
}

/** Export a THREE scene/group to a USDZ byte array (iOS AR Quick Look). */
export async function exportUSDZ(object: THREE.Object3D): Promise<Uint8Array> {
  const { USDZExporter } = await import(
    "three/examples/jsm/exporters/USDZExporter.js"
  );
  const exporter = new USDZExporter();
  const result = await exporter.parseAsync(object);
  return result as Uint8Array;
}

/** Convert an ArrayBuffer / typed array to a base64 string (browser-safe). */
export function bytesToBase64(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < arr.length; i += chunk) {
    binary += String.fromCharCode(...arr.subarray(i, i + chunk));
  }
  return btoa(binary);
}
