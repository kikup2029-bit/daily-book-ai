import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  /** Marks the field invalid and wires up the message for screen readers. */
  invalid?: boolean;
}

/*
 * 44px tall on touch, and 16px text on small screens — anything smaller and
 * iOS zooms the page when the field is focused, which feels broken.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-11 w-full rounded-[var(--radius-10)] border border-input bg-surface-1 px-3 py-2",
          "text-base md:h-10 md:text-sm",
          "text-foreground placeholder:text-muted-foreground",
          "transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease)]",
          "hover:border-border-strong",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/25",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
