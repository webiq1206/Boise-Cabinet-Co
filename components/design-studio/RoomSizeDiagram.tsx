"use client";

/** Top-down room diagram: width = left-right, depth = into the room from doorway. */
export function RoomSizeDiagram({
  widthIn,
  depthIn,
}: {
  widthIn: number;
  depthIn: number;
}) {
  const w = Math.max(48, widthIn || 120);
  const d = Math.max(48, depthIn || 120);
  const aspect = w / d;
  const boxW = aspect >= 1 ? 120 : 120 * aspect;
  const boxH = aspect >= 1 ? 120 / aspect : 120;

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-md border bg-muted/30 p-3"
      aria-hidden
    >
      <svg
        viewBox="0 0 140 100"
        className="w-full max-w-[200px] text-muted-foreground"
        role="img"
        aria-label="Room diagram"
      >
        <rect
          x={(140 - boxW) / 2}
          y={(80 - boxH) / 2}
          width={boxW}
          height={boxH}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-accent/80"
        />
        <text x="70" y="12" textAnchor="middle" fontSize="8" fill="currentColor">
          Width {w}&quot;
        </text>
        <text
          x="8"
          y="45"
          textAnchor="middle"
          fontSize="8"
          fill="currentColor"
          transform="rotate(-90 8 45)"
        >
          Depth {d}&quot;
        </text>
        <text x="70" y="92" textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.7">
          doorway
        </text>
      </svg>
      <p className="text-[12px] text-muted-foreground text-center leading-snug">
        Width is the wall you face from the doorway. Depth runs into the room.
      </p>
    </div>
  );
}
