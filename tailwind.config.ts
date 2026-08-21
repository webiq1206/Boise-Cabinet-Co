import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      borderRadius: {
        lg: "4px",
        md: "2px",
        sm: "1px",
      },
      colors: {
        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        brass: {
          DEFAULT: "hsl(var(--brass) / <alpha-value>)",
          foreground: "hsl(var(--brass-foreground) / <alpha-value>)",
          border: "var(--brass-border)",
        },
        inverse: {
          DEFAULT: "hsl(var(--inverse) / <alpha-value>)",
          foreground: "hsl(var(--inverse-foreground) / <alpha-value>)",
          muted: "hsl(var(--inverse-muted) / <alpha-value>)",
        },
        "surface-muted": "hsl(var(--surface-muted) / <alpha-value>)",
        "surface-greige": "hsl(var(--surface-greige) / <alpha-value>)",
        "catalog-canvas": "hsl(var(--catalog-canvas) / <alpha-value>)",
        "catalog-chrome": "hsl(var(--catalog-chrome) / <alpha-value>)",
        "catalog-rail": "hsl(var(--catalog-rail) / <alpha-value>)",
        "tint-warm": "hsl(var(--tint-warm) / <alpha-value>)",
        "tint-cool": "hsl(var(--tint-cool) / <alpha-value>)",
        "tint-blush": "hsl(var(--tint-blush) / <alpha-value>)",
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "Helvetica Neue", "system-ui", "sans-serif"],
        serif: ["var(--font-libre-baskerville)", "Georgia", "serif"],
        mono: ["Menlo", "Monaco", "monospace"],
      },
      fontSize: {
        // ─── Readability scale ───────────────────────────────────────────────
        // Tailwind's stock ramp bottoms out at 12px/14px, and this site leans on
        // 300/400 weights for its elegance - light type at 12-14px is genuinely
        // hard to read. Measured on /cabinets/kitchen before this change: 48
        // elements at 14px and 20 at 12px (including body <p> and <li>), only 6
        // at 16px. Redefining the ramp lifts every one of the ~900 existing
        // call sites at once instead of touching them individually, and pairs
        // each step with a line-height tuned for reading rather than Tailwind's
        // tight defaults (12px was rendering at 1.33).
        //
        // Keep every value a real px number, not a ratio, so the rhythm stays
        // predictable when these nest inside components that set their own
        // leading.
        xs: ["0.8125rem", { lineHeight: "1.5" }],      // 13px - micro labels, badges
        sm: ["0.9375rem", { lineHeight: "1.6" }],      // 15px - secondary/UI copy
        base: ["1.0625rem", { lineHeight: "1.65" }],   // 17px - body copy
        lg: ["1.1875rem", { lineHeight: "1.6" }],      // 19px - lead paragraphs
        xl: ["1.3125rem", { lineHeight: "1.5" }],      // 21px - subheads
        "2xl": ["1.5625rem", { lineHeight: "1.35" }],  // 25px - card/section titles
        "3xl": ["1.9375rem", { lineHeight: "1.25" }],  // 31px
        // Semantic tiers so new work names its intent instead of guessing a step.
        label: ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0.08em" }],
        caption: ["0.875rem", { lineHeight: "1.5" }],  // 14px - captions, helper text
        body: ["1.0625rem", { lineHeight: "1.65" }],   // 17px - alias of base
        "body-lg": ["1.1875rem", { lineHeight: "1.65" }],
        display: ["clamp(2.5rem,6vw,5rem)", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        "section-title": ["1.875rem", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
        "section-title-lg": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.025em" }],
        // Fluid H2 tier (32px mobile -> 52px desktop), replacing the repeated
        // text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] triple that was
        // copy-pasted across several hand-rolled section headings.
        "h2-fluid": ["clamp(2rem,4.5vw,3.25rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
      },
      boxShadow: {
        "2xs": "var(--shadow-2xs)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
