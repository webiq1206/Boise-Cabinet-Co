"use client";

/**
 * CatalogFlipbook — a premium, embedded digital-magazine viewer for the full
 * Boise Cabinet Co catalog PDF. Renders the live PDF with PDF.js (crisp at any
 * zoom, real page text search) and offers two reading modes:
 *   • Flip  — a two-page spread (single page on mobile) with a real page-turn
 *             animation and swipe (react-pageflip).
 *   • Scroll — a continuous vertical scroll of every page, with pinch-zoom.
 * Plus: page thumbnails, zoom controls, jump-to-page, in-catalog text search,
 * fullscreen, keyboard nav, and a PDF download fallback. Fully responsive and
 * touch-optimized.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  LayoutGrid,
  BookOpen,
  ScrollText,
  Search,
  Download,
  X,
  Loader2,
} from "lucide-react";

// PDF.js types are loaded dynamically (client-only), so we keep these loose.
type PdfDoc = any;
type PdfjsModule = typeof import("pdfjs-dist");

interface CatalogFlipbookProps {
  /** Path to the catalog PDF, served from /public. */
  pdfUrl: string;
  /** Download button target (usually the same PDF). */
  downloadUrl?: string;
}

const PAGE_RATIO = 612 / 792; // US Letter width/height ≈ 0.773 (portrait)
const MAX_ZOOM = 3;
const MIN_ZOOM = 1;

/* ------------------------------------------------------------------ */
/* PDF document loader hook                                            */
/* ------------------------------------------------------------------ */
function usePdfDocument(url: string) {
  const [pdf, setPdf] = useState<PdfDoc | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let doc: PdfDoc | null = null;
    setStatus("loading");
    (async () => {
      try {
        const pdfjs: PdfjsModule = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const task = pdfjs.getDocument({ url, cMapPacked: true });
        doc = await task.promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        setPdf(doc);
        setNumPages(doc.numPages);
        setStatus("ready");
      } catch (err) {
        console.error("Catalog PDF failed to load", err);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      if (doc) {
        try {
          doc.destroy();
        } catch {
          /* noop */
        }
      }
    };
  }, [url]);

  return { pdf, numPages, status };
}

/* ------------------------------------------------------------------ */
/* Single rendered PDF page (canvas)                                   */
/* ------------------------------------------------------------------ */
function PdfPageCanvas({
  pdf,
  pageNumber,
  renderWidth,
  eager = false,
  className,
  onClick,
}: {
  pdf: PdfDoc;
  pageNumber: number;
  renderWidth: number; // device-pixel width to rasterize at (crispness)
  eager?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(eager);
  const renderedWidthRef = useRef(0);

  useEffect(() => {
    if (eager || visible) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "1200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager, visible]);

  useEffect(() => {
    if (!visible || !pdf) return;
    // Skip re-render if we already rendered at an equal-or-higher resolution.
    if (renderedWidthRef.current >= renderWidth) return;
    let cancelled = false;
    let renderTask: any = null;
    (async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const scale = renderWidth / base.width;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;
        if (!cancelled) renderedWidthRef.current = renderWidth;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          // eslint-disable-next-line no-console
          console.debug("page render skipped", pageNumber, err?.name);
        }
      }
    })();
    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          /* noop */
        }
      }
    };
  }, [visible, pdf, pageNumber, renderWidth]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ aspectRatio: `${PAGE_RATIO}`, background: "#fff" }}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-label={`Catalog page ${pageNumber}`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main viewer                                                         */
/* ------------------------------------------------------------------ */
export function CatalogFlipbook({ pdfUrl, downloadUrl }: CatalogFlipbookProps) {
  const { pdf, numPages, status } = usePdfDocument(pdfUrl);

  const [mode, setMode] = useState<"flip" | "scroll">("flip");
  const [page, setPage] = useState(1); // 1-indexed current page
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [thumbsOpen, setThumbsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMsg, setSearchMsg] = useState<string | null>(null);
  const [FlipBook, setFlipBook] = useState<any>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [isPortrait, setIsPortrait] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const flipRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(null);

  // Load react-pageflip client-side only (avoids SSR "document" access).
  useEffect(() => {
    let alive = true;
    import("react-pageflip").then((m) => {
      if (alive) setFlipBook(() => m.default);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Track container size for responsive flip sizing.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
      setIsPortrait(rect.width < 720);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fullscreen change listener.
  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Base page shape for react-pageflip (stretch mode fits this to the stage and
  // auto-switches to a single page on narrow screens). Cap the page height to the
  // stage so a wide desktop spread never overflows vertically.
  const flipMax = useMemo(() => {
    const h = containerSize.h || 640;
    const maxHeight = Math.max(360, Math.floor(h - 24));
    const maxWidth = Math.max(280, Math.floor(maxHeight * PAGE_RATIO));
    return { maxWidth, maxHeight };
  }, [containerSize.h]);

  // Fixed, generous device-pixel render width so pages stay crisp at any stretch
  // size and under zoom, without re-rendering on every resize.
  const flipRenderWidth = useMemo(() => {
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1.5;
    return Math.min(1600, Math.round(760 * dpr));
  }, []);

  const scrollRenderWidth = useMemo(() => {
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1.5;
    const base = Math.min(900, containerSize.w || 800);
    return Math.min(2000, Math.round(base * dpr * Math.max(1, zoom)));
  }, [containerSize.w, zoom]);

  /* ---- navigation helpers ---- */
  const goToPage = useCallback(
    (target: number) => {
      const clamped = Math.max(1, Math.min(numPages || 1, target));
      setPage(clamped);
      if (mode === "flip" && flipRef.current) {
        try {
          flipRef.current.pageFlip().turnToPage(clamped - 1);
        } catch {
          /* noop */
        }
      } else if (mode === "scroll") {
        pageRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [numPages, mode],
  );

  const nextPage = useCallback(() => {
    if (mode === "flip" && flipRef.current) {
      try {
        flipRef.current.pageFlip().flipNext();
        return;
      } catch {
        /* noop */
      }
    }
    goToPage(page + (mode === "flip" && !isPortrait ? 2 : 1));
  }, [mode, page, isPortrait, goToPage]);

  const prevPage = useCallback(() => {
    if (mode === "flip" && flipRef.current) {
      try {
        flipRef.current.pageFlip().flipPrev();
        return;
      } catch {
        /* noop */
      }
    }
    goToPage(page - (mode === "flip" && !isPortrait ? 2 : 1));
  }, [mode, page, isPortrait, goToPage]);

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (searchOpen) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevPage();
      } else if (e.key === "Escape" && thumbsOpen) {
        setThumbsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextPage, prevPage, searchOpen, thumbsOpen]);

  // Track current page while scrolling.
  useEffect(() => {
    if (mode !== "scroll") return;
    const root = scrollRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        let best: { n: number; ratio: number } | null = null;
        for (const e of entries) {
          const n = Number((e.target as HTMLElement).dataset.page);
          if (e.isIntersecting && (!best || e.intersectionRatio > best.ratio)) {
            best = { n, ratio: e.intersectionRatio };
          }
        }
        if (best) setPage(best.n);
      },
      { root, threshold: [0.25, 0.5, 0.75] },
    );
    Object.values(pageRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [mode, numPages]);

  /* ---- zoom ---- */
  const clampZoom = (z: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(z.toFixed(2))));
  // Absolute set (used by pinch-to-zoom).
  const setZoomClamped = useCallback((z: number) => setZoom(clampZoom(z)), []);
  // Relative steps use a functional update so rapid successive clicks accumulate
  // correctly even within a single React batch.
  const zoomIn = useCallback(() => setZoom((z) => clampZoom(z + 0.25)), []);
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(z - 0.25)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  // Pinch-to-zoom (touch) on the stage.
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        pinchRef.current = { startDist: dist, startZoom: zoom };
      }
    },
    [zoom],
  );
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        const [a, b] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const ratio = dist / pinchRef.current.startDist;
        setZoomClamped(pinchRef.current.startZoom * ratio);
      }
    },
    [setZoomClamped],
  );
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) pinchRef.current = null;
  }, []);

  /* ---- fullscreen ---- */
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current?.parentElement ?? containerRef.current;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.().catch(() => undefined);
    } else {
      document.exitFullscreen?.().catch(() => undefined);
    }
  }, []);

  /* ---- search ---- */
  const runSearch = useCallback(
    async (term: string) => {
      if (!pdf || !term.trim()) {
        setSearchMsg(null);
        return;
      }
      const needle = term.trim().toLowerCase();
      setSearchMsg("Searching…");
      const start = page; // search forward from current page, wrapping
      for (let offset = 0; offset < numPages; offset++) {
        const p = ((start - 1 + offset) % numPages) + 1;
        try {
          const pageObj = await pdf.getPage(p);
          const text = await pageObj.getTextContent();
          const joined = text.items
            .map((it: any) => ("str" in it ? it.str : ""))
            .join(" ")
            .toLowerCase();
          if (joined.includes(needle)) {
            setSearchMsg(`Found on page ${p}`);
            goToPage(p);
            return;
          }
        } catch {
          /* noop */
        }
      }
      setSearchMsg(`No matches for “${term.trim()}”`);
    },
    [pdf, numPages, page, goToPage],
  );

  /* ---- render states ---- */
  if (status === "loading" || !FlipBook) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-sm border border-border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground">Loading the catalog…</p>
      </div>
    );
  }

  if (status === "error" || !pdf) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-sm border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          The interactive catalog could not be loaded in your browser.
        </p>
        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm text-inverse-foreground"
          >
            <Download className="h-4 w-4" /> Download the catalog (PDF)
          </a>
        )}
      </div>
    );
  }

  const pageNumbers = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div className="catalog-viewer overflow-hidden rounded-sm border border-border bg-[#0f1211]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 bg-[#161a18] px-2 py-2 text-inverse-foreground sm:gap-2 sm:px-3">
        {/* View mode toggle */}
        <div className="flex overflow-hidden rounded-sm border border-white/15">
          <button
            type="button"
            onClick={() => setMode("flip")}
            aria-pressed={mode === "flip"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors ${
              mode === "flip" ? "bg-accent text-white" : "text-inverse-muted hover:bg-white/5"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Flip</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("scroll")}
            aria-pressed={mode === "scroll"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors ${
              mode === "scroll" ? "bg-accent text-white" : "text-inverse-muted hover:bg-white/5"
            }`}
          >
            <ScrollText className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Scroll</span>
          </button>
        </div>

        {/* Page nav */}
        <div className="flex items-center gap-1">
          <IconBtn label="Previous page" onClick={prevPage}>
            <ChevronLeft className="h-4 w-4" />
          </IconBtn>
          <div className="flex items-center gap-1 text-xs text-inverse-muted">
            <input
              type="number"
              min={1}
              max={numPages}
              value={page}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v) goToPage(v);
              }}
              className="w-11 rounded-sm border border-white/15 bg-transparent px-1.5 py-1 text-center text-inverse-foreground [appearance:textfield] focus:border-accent focus:outline-none"
              aria-label="Go to page"
            />
            <span className="whitespace-nowrap">/ {numPages}</span>
          </div>
          <IconBtn label="Next page" onClick={nextPage}>
            <ChevronRight className="h-4 w-4" />
          </IconBtn>
        </div>

        <div className="mx-auto" />

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <IconBtn label="Zoom out" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
            <ZoomOut className="h-4 w-4" />
          </IconBtn>
          <button
            type="button"
            onClick={resetZoom}
            className="min-w-[3rem] rounded-sm px-1.5 py-1 text-xs text-inverse-muted hover:bg-white/5"
            aria-label="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <IconBtn label="Zoom in" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
            <ZoomIn className="h-4 w-4" />
          </IconBtn>
        </div>

        {/* Tools */}
        <IconBtn
          label="Page thumbnails"
          onClick={() => setThumbsOpen((v) => !v)}
          active={thumbsOpen}
        >
          <LayoutGrid className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Search the catalog" onClick={() => setSearchOpen((v) => !v)} active={searchOpen}>
          <Search className="h-4 w-4" />
        </IconBtn>
        <IconBtn label={isFullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </IconBtn>
        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="flex h-8 items-center gap-1.5 rounded-sm px-2 text-xs text-inverse-muted hover:bg-white/5"
            aria-label="Download catalog PDF"
          >
            <Download className="h-4 w-4" /> <span className="hidden md:inline">PDF</span>
          </a>
        )}
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#12100e] px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-inverse-muted" />
          <input
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch(searchTerm);
            }}
            placeholder="Search the catalog (e.g. shaker, walnut, hardware)…"
            className="flex-1 rounded-sm border border-white/15 bg-transparent px-2 py-1.5 text-sm text-inverse-foreground placeholder:text-inverse-muted/60 focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => runSearch(searchTerm)}
            className="rounded-sm bg-accent px-3 py-1.5 text-xs text-white"
          >
            Find
          </button>
          {searchMsg && <span className="hidden text-xs text-inverse-muted sm:inline">{searchMsg}</span>}
          <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
            <X className="h-4 w-4 text-inverse-muted" />
          </button>
        </div>
      )}
      {searchOpen && searchMsg && (
        <div className="border-b border-white/10 bg-[#12100e] px-3 py-1 text-xs text-inverse-muted sm:hidden">
          {searchMsg}
        </div>
      )}

      <div className="relative flex" style={{ height: isFullscreen ? "calc(100vh - 52px)" : "min(78vh, 900px)" }}>
        {/* Thumbnail rail */}
        {thumbsOpen && (
          <div className="w-24 shrink-0 overflow-y-auto border-r border-white/10 bg-[#12100e] p-2 sm:w-28">
            <div className="flex flex-col gap-2">
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    goToPage(n);
                  }}
                  className={`overflow-hidden rounded-sm border transition-colors ${
                    n === page ? "border-accent" : "border-white/10 hover:border-white/30"
                  }`}
                  aria-label={`Go to page ${n}`}
                  aria-current={n === page}
                >
                  <PdfPageCanvas pdf={pdf} pageNumber={n} renderWidth={150} />
                  <div className="bg-black/40 py-0.5 text-center text-[10px] text-inverse-muted">{n}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stage */}
        <div
          ref={containerRef}
          className="relative min-w-0 flex-1 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* FLIP MODE */}
          {mode === "flip" && (
            <div className="h-full w-full overflow-auto">
              <div
                className="flex min-h-full w-full items-center justify-center p-2"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: pinchRef.current ? "none" : "transform 0.15s ease",
                }}
              >
                <FlipBook
                  ref={flipRef}
                  width={520}
                  height={Math.round(520 / PAGE_RATIO)}
                  size="stretch"
                  minWidth={260}
                  maxWidth={flipMax.maxWidth}
                  minHeight={340}
                  maxHeight={flipMax.maxHeight}
                  drawShadow
                  maxShadowOpacity={0.4}
                  showCover={false}
                  mobileScrollSupport={false}
                  usePortrait
                  flippingTime={650}
                  startPage={page - 1}
                  autoSize
                  className="catalog-flipbook"
                  onFlip={(e: any) => setPage((e?.data ?? 0) + 1)}
                >
                  {pageNumbers.map((n) => (
                    <div key={n} className="bg-white shadow-sm" style={{ overflow: "hidden" }}>
                      <PdfPageCanvas
                        pdf={pdf}
                        pageNumber={n}
                        renderWidth={flipRenderWidth}
                        eager={Math.abs(n - page) <= 3}
                      />
                    </div>
                  ))}
                </FlipBook>
              </div>
            </div>
          )}

          {/* SCROLL MODE */}
          {mode === "scroll" && (
            <div ref={scrollRef} className="h-full w-full overflow-auto bg-[#0f1211] px-2 py-4">
              <div className="mx-auto flex flex-col items-center gap-4">
                {pageNumbers.map((n) => (
                  <div
                    key={n}
                    data-page={n}
                    ref={(el) => {
                      pageRefs.current[n] = el;
                    }}
                    className="w-full bg-white shadow-lg"
                    style={{ maxWidth: `${Math.min(900, 520 * zoom)}px` }}
                  >
                    <PdfPageCanvas pdf={pdf} pageNumber={n} renderWidth={scrollRenderWidth} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar icon button                                                 */
/* ------------------------------------------------------------------ */
function IconBtn({
  children,
  label,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-sm transition-colors disabled:opacity-30 ${
        active ? "bg-accent text-white" : "text-inverse-muted hover:bg-white/5 hover:text-inverse-foreground"
      }`}
    >
      {children}
    </button>
  );
}
