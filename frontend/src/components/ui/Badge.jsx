import * as React from "react";
import { cn } from "@/lib/utils";
function Badge({
  className,
  variant = "default",
  ...props
}) {
  return <div className={cn("inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2", {
    "bg-primary/10 text-primary": variant === "default",
    "bg-good-value/10 text-good-value": variant === "good",
    "bg-alert-price/10 text-alert-price": variant === "alert",
    "text-on-surface border border-outline-variant": variant === "outline",
    "bg-surface-container text-on-surface-variant": variant === "secondary"
  }, className)} {...props} />;
}
export { Badge };
