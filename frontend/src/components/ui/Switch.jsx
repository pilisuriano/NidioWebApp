import * as React from "react";
import { cn } from "@/lib/utils";

/** Interruptor on/off simple (sin dependencias), estilo iOS/Material. */
const Switch = React.forwardRef(({
  checked,
  onCheckedChange,
  label,
  className,
  ...props
}, ref) => <label className={cn("flex items-center gap-2 cursor-pointer select-none", className)}>
    {label && <span className="text-xs font-bold text-on-surface-variant">{label}</span>}
    <button ref={ref} type="button" role="switch" aria-checked={checked} onClick={() => onCheckedChange(!checked)} className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200", checked ? "bg-primary" : "bg-outline-variant")} {...props}>
      <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200", checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  </label>);
Switch.displayName = "Switch";
export { Switch };
