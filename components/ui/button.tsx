import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // tap-target enforces the 44px touch minimum on coarse pointers only, so the
  // default (36px) and sm (32px) sizes stay compact under a mouse while every
  // one of the ~279 call sites meets the touch minimum on a phone.
  "tap-target inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  " brc-lift brc-press-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary-border",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive-border",
        outline:
          // Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color.
          " border [border-color:var(--button-outline)]  shadow-xs active:shadow-none ",
        secondary: "border bg-secondary text-secondary-foreground border border-secondary-border ",
        // Add a transparent border so that when someone toggles a border on later, it doesn't shift layout/size.
        ghost: "border border-transparent",
        /** P5 Home Co family button faces (styles/family-chrome.css .fam-btn): 48px, 16px
            sentence-case label, square corners. brand is the primary: filled with a 3px
            brand-accent bar on the leading edge (charcoal on paper, paper on dark grounds,
            because --primary flips there). */
        brand:
          "rounded-none bg-primary text-primary-foreground border border-primary-border min-h-12 px-6 text-base font-semibold leading-none normal-case tracking-normal gap-2 shadow-[inset_3px_0_0_var(--color-accent)] hover:shadow-[inset_6px_0_0_var(--color-accent)]",
        /** The family secondary: an outline in the current text colour. */
        brandOutline:
          "rounded-none border border-foreground/45 bg-transparent text-foreground min-h-12 px-6 text-base font-semibold leading-none normal-case tracking-normal gap-2 hover:border-foreground hover:bg-foreground/5",
        /** The family secondary over photography: the same outline in paper. */
        heroOutline:
          "rounded-none border border-inverse-foreground/50 bg-transparent text-inverse-foreground min-h-12 px-6 text-base font-semibold leading-none normal-case tracking-normal gap-2 hover:border-inverse-foreground hover:bg-inverse-foreground/[0.08]",
      },
      // Heights are set as "min" heights, because sometimes Ai will place large amount of content
      // inside buttons. With a min-height they will look appropriate with small amounts of content,
      // but will expand to fit large amounts of content.
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-11 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
