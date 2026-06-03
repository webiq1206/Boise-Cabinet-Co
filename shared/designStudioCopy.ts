/** Plain-language copy for the Design Studio wizard. */

export const scanCopy = {
  panelTitle: "Set your room size",
  panelHint: "Wall-to-wall measurements in inches so we can show layouts that fit.",
  primaryButton: "Scan your room",
  primaryButtonLoading: "Measuring your room…",
  tryDifferent: "Other ways to measure",
  measureWithCamera: "Quick floor measure (beta)",
  takePhoto: "Estimate from photo",
  takePhotoLoading: "Reading your photo…",
  typeSizePrimary: "Room size (inches)",
  typeSizeHint: "Works in Safari and Chrome. We'll confirm exact sizes at your home visit.",
  widthLabel: "Width — wall to wall",
  depthLabel: "Depth — into the room",
  typicalKitchen: "12×14 ft typical",
  typeSizeAdvanced: "Advanced options",
  presetLabel: "Quick sizes",
  changeSize: "Change size",
  photoPrimaryTitle: "Start with a room photo",
  photoPrimaryHint:
    "Don't know your exact size? Take a wide photo of the whole room — we'll estimate dimensions and you can adjust after.",
  photoPrimaryButton: "Take or upload room photo",
  bucketLabel: "Not sure? Pick the closest size",
  bucketHint: "No tape measure needed — you can refine with a photo or on the layout step.",
  knowSizeLabel: "I know my wall measurements",
  tunerTitle: "Fine-tune the estimate",
  tunerHint: "Nudge smaller or larger until the floor plan feels right.",
  tunerSmaller: "A bit smaller",
  tunerLarger: "A bit larger",
  tunerCurrent: (w: number, d: number) =>
    `About ${Math.round(w / 12)}′ × ${Math.round(d / 12)}′ (${w}" × ${d}")`,
  photoReviewTitle: "Your room",
  photoReviewHint: "Tap two points on the back wall below to refine width, or use the size buttons.",
  photoFallbackTitle: "Used a quick photo estimate",
  photoFallbackNote:
    "AI sizing was unavailable — we estimated from your photo proportions. Adjust with the buttons below.",
  accuracySiteMeasure: "Using your size for layout checks — we confirm exact dimensions at your home visit.",
  accuracyEstimated:
    "Planning estimate from photo or rough size — not a site measure. Layout may flag issues if cabinets won't fit.",
  accuracyPlanningOnly:
    "Template size for preview only — enter a photo or room size before relying on fit checks.",
  traceWalls: "L- or U-shaped room? Trace the walls",
  roomCaptured: "Room size saved",
  scanAgain: "Change size",
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
  desktopScanHint: "Open this page on your phone to set room size or take a photo.",
} as const;

export const wizardCopy = {
  roomSetupTitle: "Your room",
  roomSetupHint:
    "Pick a room, then use a photo or rough size — you'll see and edit the layout in your space on the next steps.",
  roomWhatNext: "Next you'll pick a layout that fits your space.",
  previewStepTitle: "Preview your design",
  previewStepHint: "Orbit the 3D view, then continue to save and request pricing.",
  saveStepTitle: "Save & request quote",
  saveStepHint: "Name your design and send it to our team.",
  layoutNeedScan: "Set your room size first",
  layoutNeedScanHint:
    "Go back and enter your room size so we can show layouts that fit.",
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
    "Add a room photo or size to see your space here, then pick a layout to visualize cabinets.",
  layoutPhotoTitle: "See cabinets on your room photo",
  layoutPhotoHint:
    "Drag and resize the overlay to match your walls. Use the 2D planner below for precise placement.",
  layoutTooLargeHint:
    "This layout needs more space than your room size. Try another shape or go back to adjust your room size.",
} as const;

export const SCAN_CORNER_USER_LABELS = [
  "far left corner",
  "far right corner",
  "near right corner",
  "near left corner",
] as const;
