import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-400/60",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
