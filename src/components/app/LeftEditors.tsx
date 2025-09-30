import { useEffect, useRef, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import type { Doc } from "@/types"

type LeftEditorsProps = {
  docs: Doc[]
  active: string
  onActiveChange: (id: string) => void
  onAddTab: () => void
  onCloseTab: (id: string) => void
  onSetText: (id: string, text: string) => void
  onSetDiffText: (id: string, text: string) => void
  showDiff: boolean
}

export function LeftEditors({
  docs,
  active,
  onActiveChange,
  onAddTab,
  onCloseTab,
  onSetText,
  onSetDiffText,
  showDiff,
}: LeftEditorsProps) {
  const stripRef = useRef<HTMLDivElement | null>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const updateScrollAffordances = () => {
    const el = stripRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanLeft(scrollLeft > 2)
    setCanRight(scrollLeft + clientWidth < scrollWidth - 2)
  }

  useEffect(() => {
    updateScrollAffordances()
    const el = stripRef.current
    if (!el) return
    const onScroll = () => updateScrollAffordances()
    el.addEventListener("scroll", onScroll)
    const onResize = () => updateScrollAffordances()
    window.addEventListener("resize", onResize)
    return () => {
      el.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  useEffect(() => { updateScrollAffordances() }, [docs])

  return (
    <Tabs value={active} onValueChange={(val) => onActiveChange(val)} className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center border-b gap-1">
        <div className="shrink-0 pl-2">
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7"
            onClick={() => {
              const el = stripRef.current
              if (el) el.scrollBy({ left: -Math.floor(el.clientWidth * 0.9), behavior: "smooth" })
            }}
            disabled={!canLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div ref={stripRef} className="flex-1 min-w-0 overflow-x-auto">
          <TabsList className="flex h-11 bg-transparent p-0 px-2 gap-1 whitespace-nowrap">
            {docs.map((d) => (
              <div key={d.id} className="inline-flex">
                <TabsTrigger value={d.id} className="group relative rounded-t px-3 py-2 data-[state=active]:bg-muted">
                  <span className="max-w-[8rem] truncate">{d.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-5 w-5 opacity-60 hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); onCloseTab(d.id) }}
                    aria-label={`Close ${d.title}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </TabsTrigger>
              </div>
            ))}
          </TabsList>
        </div>

        <div className="shrink-0">
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7"
            onClick={() => {
              const el = stripRef.current
              if (el) el.scrollBy({ left: Math.floor(el.clientWidth * 0.9), behavior: "smooth" })
            }}
            disabled={!canRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-2 shrink-0">
          <Button size="sm" variant="outline" onClick={onAddTab}>
            <Plus className="mr-1 h-4 w-4" /> New
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden min-h-0">
        {docs.map((d) => (
          <TabsContent key={d.id} value={d.id} className="h-full m-0">
            {!showDiff ? (
              <Textarea
                value={d.text}
                onChange={(e) => onSetText(d.id, e.target.value)}
                className="w-full h-full resize-none font-mono text-sm"
                placeholder='{"key":"value"}'
              />
            ) : (
              <div className="grid grid-rows-2 gap-3 h-full min-h-0">
                <Textarea
                  value={d.text}
                  onChange={(e) => onSetText(d.id, e.target.value)}
                  className="w-full h-full resize-none font-mono text-sm"
                  placeholder='{"source":"baseline JSON"}'
                />
                <Textarea
                  value={d.diffText ?? ""}
                  onChange={(e) => onSetDiffText(d.id, e.target.value)}
                  className="w-full h-full resize-none font-mono text-sm"
                  placeholder='{"target":"JSON to compare"}'
                />
              </div>
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
