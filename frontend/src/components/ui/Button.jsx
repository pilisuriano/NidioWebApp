import * as React from "react";
import { cn } from "@/lib/utils";
const Button = React.forwardRef(({
  className,
  variant = "primary",
  size = "default",
  ...props
}, ref) => {
  return <button ref={ref} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", {
    "bg-primary text-on-primary hover:bg-primary-container active:bg-primary/90": variant === "primary",
    "bg-secondary text-on-secondary hover:bg-secondary/90": variant === "secondary",
    "border border-outline bg-surface hover:bg-surface-container-low text-on-surface": variant === "outline",
    "hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface": variant === "ghost",
    "h-10 px-4 py-2": size === "default",
    "h-9 rounded-md px-3": size === "sm",
    "h-11 rounded-md px-8": size === "lg",
    "h-10 w-10": size === "icon"
  }, className)} {...props} />;
});
Button.displayName = "Button";
export { Button };
