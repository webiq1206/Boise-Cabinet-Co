/**
 * The family split: the section head holds the left column and stays put
 * while the content on the right scrolls. Replaces the narrow centred column
 * the catalogue pages used, which left most of a wide screen empty.
 */
export function SplitSection({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="ed-shell">
      <div className="ed-split ed-split-narrow">
        <div className="lg:sticky lg:top-28 lg:self-start">{header}</div>
        <div>{children}</div>
      </div>
    </div>
  );
}
