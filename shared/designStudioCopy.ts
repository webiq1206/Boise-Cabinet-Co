/** Plain-language copy for the Design Studio wizard. */

export const scanCopy = {
  panelTitle: "Scan your room",
  panelHint: "We need your room size so cabinets fit your space.",
  primaryButton: "Scan your room",
  primaryButtonLoading: "Measuring your room…",
  tryDifferent: "Try a different way",
  measureWithCamera: "Measure with phone camera",
  takePhoto: "Take a room photo",
  typeSizeAdvanced: "Type room size (advanced)",
  traceWalls: "L- or U-shaped room? Trace the walls",
  roomCaptured: "Room size saved",
  scanAgain: "Scan again",
  sourceAr: "measured with phone camera",
  sourcePhoto: "estimated from photo",
  sourceManual: "typed in",
  measuringPhoto: "Measuring your room…",
  photoSuccess: "Room size from photo",
  photoFailed: "Couldn't read your photo",
  photoFailedHint:
    "Try again with a wide photo of the whole room, or measure with your phone camera.",
  photoNotReady:
    "We couldn't read your photo. Try again or use phone camera measure.",
  arUnavailable: "Camera ruler isn't available on this phone.",
  arTryPhoto: "Take a room photo instead",
  lowConfidenceTitle: "Does this look about right?",
  lowConfidenceBody: (w: number, d: number, notes?: string) =>
    `Your room looks about ${w}" wide × ${d}" deep.${notes ? ` ${notes}` : ""}`,
  lowConfidenceConfirm: "Yes, continue",
  lowConfidenceCancel: "Try again",
  lowConfidenceAck: "I know we'll double-check sizes at your home",
  manualTitle: "Type your room size (inches)",
  manualApply: "Use these sizes",
  manualInvalid: "Width and depth must be at least 48 inches.",
  standInDoorway: "Stand in your doorway, facing into the room.",
  cornerProgress: (n: number, total: number) => `Corner ${n} of ${total}`,
  arInstructionFirst:
    "Stand in your doorway. Tap the far left corner where the wall meets the floor.",
  arInstructionNext: (label: string, n: number, total: number) =>
    `Tap the ${label} (${n} of ${total}).`,
  arAllDone: "All corners marked. Tap Done.",
  arDone: "Done, use this size",
  arUndo: "Undo",
  arReset: "Start over",
  arTooSmall: "Room looks too small, step back and try again.",
  arNeedMore: (n: number) =>
    `Mark ${n} more corner${n === 1 ? "" : "s"} on the floor.`,
  desktopScanHint: "Open this page on your phone to scan your room.",
} as const;

export const wizardCopy = {
  roomSetupTitle: "Your room",
  roomSetupHint: "Pick a room, then tap Scan your room.",
  layoutNeedScan: "Scan your room first",
  layoutNeedScanHint:
    "Go back and scan your room so we can show layouts that fit.",
  layoutTitle: "Pick a layout",
  layoutHint: (w: number, d: number) =>
    `Your room is ${w}" × ${d}". These layouts fit your space.`,
  layoutSlack: (w: number, d: number) =>
    `Extra space: ${w}" wider, ${d}" deeper than this layout needs.`,
  lookTitle: "Pick your look",
  lookHint: "Choose doors, colors, and handles.",
  finishTitle: "Preview and save",
  finishHint: "See your design and save it when you're ready.",
  previewPlaceholder:
    "Scan your room to see your floor plan here, then pick a layout for the 3D preview.",
} as const;

export const SCAN_CORNER_USER_LABELS = [
  "far left corner",
  "far right corner",
  "near right corner",
  "near left corner",
] as const;
