import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-amber-400/60",
        className,
      )}
      {...props}
    />
  );
});

Select.displayName = "Select";
