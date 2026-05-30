import type { TocHeading } from '@/lib/content-utils';

interface GuideContentBlocksProps {
  quickAnswer?: string;
  keyTakeaways?: string[];
  tocHeadings?: TocHeading[];
  children: React.ReactNode;
}

export function GuideContentBlocks({
  quickAnswer,
  keyTakeaways,
  tocHeadings,
  children,
}: GuideContentBlocksProps) {
  const showToc = tocHeadings && tocHeadings.length >= 3;

  return (
    <div className="space-y-8">
      {quickAnswer && (
        <div
          className="quick-answer rounded-lg border border-accent/20 bg-accent/5 p-5 md:p-6"
          data-speakable="summary"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-accent mb-2">Quick answer</p>
          <p className="text-foreground leading-relaxed">{quickAnswer}</p>
        </div>
      )}

      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="key-takeaways rounded-lg border border-border bg-muted/30 p-5 md:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Key takeaways
          </p>
          <ul className="space-y-2 text-sm md:text-base text-foreground list-disc pl-5">
            {keyTakeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {showToc && (
        <nav
          className="rounded-lg border border-border p-5 md:p-6"
          aria-label="Table of contents"
          data-testid="guide-toc"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            On this page
          </p>
          <ol className="space-y-1.5 text-sm">
            {tocHeadings!.map((h) => (
              <li
                key={h.id}
                className={h.level === 3 ? 'ml-4 list-[circle]' : 'list-decimal ml-4'}
              >
                <a
                  href={`#${h.id}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {children}
    </div>
  );
}
