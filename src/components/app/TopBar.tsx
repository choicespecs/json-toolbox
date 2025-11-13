import { Button } from "@/components/ui/button"
import { SplitSquareHorizontal } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

type TopBarProps = {
  showDiff: boolean
  setShowDiff: Dispatch<SetStateAction<boolean>>
  showAnalyze: boolean
  setShowAnalyze: Dispatch<SetStateAction<boolean>>
  showVisualize: boolean
  setShowVisualize: Dispatch<SetStateAction<boolean>>
  indent: 2 | 4
  setIndent: Dispatch<SetStateAction<2 | 4>>
  sortKeys: boolean
  setSortKeys: Dispatch<SetStateAction<boolean>>
  prettify: (minify?: boolean) => void
  onJsonToString: () => void
}

export function TopBar({
  showDiff,
  setShowDiff,
  showAnalyze,
  setShowAnalyze,
  showVisualize,
  setShowVisualize,
  indent,
  setIndent,
  sortKeys,
  setSortKeys,
  prettify,
  onJsonToString,
}: TopBarProps) {
  // mark currently-unused props as intentionally used
  void indent
  void setIndent
  void sortKeys
  void setSortKeys

  return (
    <div className="flex items-center justify-between border-b bg-background/60 px-4 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant={showDiff ? "default" : "outline"}
          onClick={() => {
            setShowDiff((prev) => {
              const next = !prev
              if (next) {
                setShowAnalyze(false)
                setShowVisualize(false)
              }
              return next
            })
          }}
        >
          <SplitSquareHorizontal className="mr-2 h-4 w-4" /> Difference
        </Button>

        <Button
          size="sm"
          variant={showAnalyze ? "default" : "outline"}
          onClick={() => {
            setShowAnalyze((prev) => {
              const next = !prev
              if (next) {
                setShowDiff(false)
                setShowVisualize(false)
              }
              return next
            })
          }}
        >
          Analyze
        </Button>

        <Button
          size="sm"
          variant={showVisualize ? "default" : "outline"}
          onClick={() => {
            setShowVisualize((prev) => {
              const next = !prev
              if (next) {
                setShowDiff(false)
                setShowAnalyze(false)
              }
              return next
            })
          }}
        >
          Visualize
        </Button>

        <Button size="sm" variant="outline" onClick={() => prettify(false)}>
          Prettify
        </Button>
        <Button size="sm" variant="outline" onClick={() => prettify(true)}>
          Minify
        </Button>

        <Button size="sm" variant="outline" onClick={onJsonToString}>
          JSON → String
        </Button>
      </div>

      <div className="text-xs opacity-70">
        {!showDiff && !showAnalyze && !showVisualize
          ? "Single editor"
          : showDiff
          ? "Split view enabled"
          : showAnalyze
          ? "Analyze JSON structure"
          : "Graph view"}
      </div>
    </div>
  )
}
