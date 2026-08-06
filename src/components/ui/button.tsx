import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/*
 * One accent per view.
 *
 * `brand` is the single most important action on a screen — save, sign in,
 * add. `default` is the neutral workhorse. If two brand buttons ever appear
 * together, one of them is wrong: the colour stops meaning "do this" the
 * moment it's everywhere.
 *
 * Heights are 40px and up. That's the smallest comfortable touch target, and
 * this app gets used one-handed behind a counter.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "cursor-pointer select-none rounded-[var(--radius-10)]",
    "transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--dur-fast)] ease-[var(--ease)]",
    "active:scale-[0.985]",
    "disabled:pointer-events-none disabled:opacity-45 disabled:cursor-not-allowed",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        brand: "bg-brand text-brand-foreground shadow-[var(--shadow-sm)] hover:bg-brand-hover",
        default: "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:opacity-90",
        outline:
          "border border-border-strong bg-transparent text-foreground hover:bg-accent hover:border-border-strong",
        secondary: "bg-secondary text-secondary-foreground hover:brightness-110",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        destructive:
          "bg-danger text-danger-foreground shadow-[var(--shadow-sm)] hover:brightness-110",
        link: "text-brand underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-9 px-3 text-[13px]",
        default: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-[15px]",
        icon: "size-10",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner and blocks further clicks. */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // asChild renders someone else's element (usually a Link); injecting a
    // spinner into it would break Slot's single-child rule.
    if (asChild) {
      return (
        <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props}>
          {children}
        </Comp>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={loading || props.disabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
