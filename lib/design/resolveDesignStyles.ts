import {
  buildPreviewConfig,
  getFinishHex,
  getFinishCategory,
  type CabinetModule,
  type PreviewConfig,
} from "@/lib/design/previewConfig";
import { HARDWARE_BY_SLUG } from "@/shared/catalog/hardware";
import type { LayoutSlug } from "@/shared/catalog/layouts";
import type {
  HardwareSpec,
  ResolvedModuleStyle,
} from "@/components/design-studio/CabinetPreview3D";

/**
 * The slice of design state needed to resolve cabinet styles. Matches the
 * fields the live 3D preview, AR export, and photo overlay all read.
 */
export interface DesignStyleInput {
  layout: string | null;
  finish: string | null;
  doorStyle: string | null;
  hardware: string | null;
  accessories: string[];
  modules: CabinetModule[];
  moduleOverrides: Record<
    string,
    { doorStyle?: string | null; finish?: string | null }
  >;
}

const HARDWARE_FINISH_HEX: Record<string, string> = {
  "matte-black": "#1c1c1c",
  "brushed-nickel": "#b6babf",
  "polished-chrome": "#d9dee3",
  "brushed-gold": "#c6a35a",
  "oil-rubbed-bronze": "#3a2f29",
  stainless: "#c2c6ca",
};

/** Resolve a hardware slug to a renderable hardware spec (category + color). */
export function hardwareSpec(slug: string | null): HardwareSpec {
  const hw = slug ? HARDWARE_BY_SLUG[slug] : undefined;
  if (!hw) return { category: "pull", color: "#1c1c1c" };
  const color = HARDWARE_FINISH_HEX[hw.finish] ?? "#1c1c1c";
  if (hw.category === "knob") return { category: "knob", color };
  if (hw.category === "handleless") return { category: "handleless", color };
  if (hw.category === "pull") return { category: "pull", color };
  return { category: "other", color };
}

/** Build the parametric preview config from a design's layout/finish/door. */
export function buildConfigFromDesign(design: DesignStyleInput): PreviewConfig {
  return buildPreviewConfig(
    design.layout as LayoutSlug | null,
    design.finish,
    design.doorStyle,
    design.modules,
  );
}

/**
 * Build a per-module style resolver that honours per-cabinet overrides, falling
 * back to the overall design finish/door style.
 */
export function makeResolveModule(
  design: DesignStyleInput,
): (module: CabinetModule) => ResolvedModuleStyle {
  const overrides = design.moduleOverrides;
  return (module: CabinetModule): ResolvedModuleStyle => {
    const ov = overrides[module.id];
    const finishSlug = ov?.finish ?? design.finish;
    const doorStyle = ov?.doorStyle ?? design.doorStyle ?? "slab";
    return {
      color: getFinishHex(finishSlug),
      category: getFinishCategory(finishSlug),
      doorStyle,
    };
  };
}
