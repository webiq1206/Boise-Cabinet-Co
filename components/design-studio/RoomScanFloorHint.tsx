/** Small floor-plan hint shown during AR corner scanning. */
export function RoomScanFloorHint() {
  return (
    <svg
      viewBox="0 0 120 100"
      className="mx-auto w-28 h-24 opacity-80"
      aria-hidden
    >
      <rect
        x="20"
        y="15"
        width="80"
        height="70"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-white/50"
      />
      <circle cx="28" cy="22" r="4" className="fill-accent" />
      <circle cx="92" cy="22" r="3" className="fill-white/40" />
      <circle cx="92" cy="78" r="3" className="fill-white/40" />
      <circle cx="28" cy="78" r="3" className="fill-white/40" />
      <path
        d="M 60 95 L 60 88 M 55 93 L 60 88 L 65 93"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        className="text-white/70"
      />
      <text x="60" y="99" textAnchor="middle" className="fill-white/60 text-[7px]">
        you
      </text>
    </svg>
  );
}
