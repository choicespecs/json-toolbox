import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({
  className,
  onPaste,
  style,
  ...props
}: React.ComponentProps<"textarea">) {
  const handlePaste: React.ClipboardEventHandler<HTMLTextAreaElement> = (e) => {
    // Save current window scroll so we can restore it
    const prevScrollY = window.scrollY
    const prevScrollX = window.scrollX

    if (onPaste) {
      onPaste(e)
    }
    if (e.defaultPrevented) return

    const el = e.currentTarget

    requestAnimationFrame(() => {
      // 🔒 Keep the page from jumping
      window.scrollTo(prevScrollX, prevScrollY)

      // 🔝 Keep the textarea view at the top
      el.scrollTop = 0
      el.selectionStart = 0
      el.selectionEnd = 0
    })
  }

  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-auto overscroll-contain resize-none",
        className
      )}
      style={{ minHeight: 0, ...(style || {}) }}
      onPaste={handlePaste}
      {...props}
    />
  )
}

export { Textarea }
