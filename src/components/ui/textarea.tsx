import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // NOTE:
        // - removed `field-sizing-content` (causes height to expand with content)
        // - removed `flex` (textarea shouldn't be a flex container)
        // - added `overflow-auto overscroll-contain` for internal scrolling
        // - kept a small visual minimum via `min-h-16`; parent can still pass `h-full`
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-auto overscroll-contain resize-none",
        className
      )}
      // Defensive: some UI libs inject a min-height—this guarantees it can shrink.
      style={{ minHeight: 0, ...(props.style || {}) }}
      {...props}
    />
  )
}

export { Textarea }