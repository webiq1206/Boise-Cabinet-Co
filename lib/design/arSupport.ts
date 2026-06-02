/** Device routing and pre-flight checks for room scan (AR vs photo). */

export type ScanRoute = "ar" | "photo" | "desktop-handoff";

type XRNavigator = Navigator & {
  xr?: XRSystem;
};

export type ArSupportResult =
  | { ok: true }
  | { ok: false; reason: string };

/** Whether immersive AR with hit-test is available in this browser. */
export async function checkArSupport(): Promise<ArSupportResult> {
  const nav = navigator as XRNavigator;
  if (!nav.xr) {
    return {
      ok: false,
      reason: "Camera ruler isn't available on this phone.",
    };
  }

  try {
    const supported = await nav.xr.isSessionSupported("immersive-ar");
    if (!supported) {
      return {
        ok: false,
        reason:
          "Camera ruler needs a newer phone, try Safari on iPhone or Chrome on Android.",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      reason: "Couldn't start camera ruler on this browser.",
    };
  }
}

/** Pick the best scan method for the current device. */
export async function resolveScanRoute(isDesktop: boolean): Promise<ScanRoute> {
  if (isDesktop) return "desktop-handoff";
  const ar = await checkArSupport();
  return ar.ok ? "ar" : "photo";
}
