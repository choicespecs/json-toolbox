import { Button } from "@/components/ui/button"
import { SplitSquareHorizontal } from "lucide-react"
import { Dispatch, SetStateAction } from "react"

type TopBarProps = {
  showDiff: boolean
  setShowDiff: Dispatch<SetStateAction<boolean>>
  showAnalyze: boolean
  setShowAnalyze: Dispatch<SetStateAction<boolean>>
  indent: 2 | 4
  setIndent: Dispatch<SetStateAction<2 | 4>>
  sortKeys: boolean
  setSortKeys: Dispatch<SetStateAction<boolean>>
  prettify: (minify?: boolean) => void
}

export function TopBar({
  showDiff, setShowDiff,
  showAnalyze, setShowAnalyze,
  indent, setIndent,
  sortKeys, setSortKeys,
  prettify
}: TopBarProps) {
  return (
    <div className="flex items-center justify-between border-b bg-background/60 px-4 py-2">
      <div className="flex items-center gap-2">
        <Button size="sm" variant={showDiff ? "default" : "outline"} onClick={() => { setShowDiff(v => !v); if (!showDiff) setShowAnalyze(false) }}>
          <SplitSquareHorizontal className="mr-2 h-4 w-4" /> Difference
        </Button>
        <Button size="sm" variant={showAnalyze ? "default" : "outline"} onClick={() => { setShowAnalyze(v => !v); if (!showAnalyze) setShowDiff(false) }}>
          Analyze
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs opacity-70">Indent:</div>
        <div className="flex gap-1">
          <Button size="xs" variant={indent === 2 ? "default" : "outline"} onClick={() => setIndent(2)}>2</Button>
          <Button size="xs" variant={indent === 4 ? "default" : "outline"} onClick={() => setIndent(4)}>4</Button>
        </div>
        <Button size="sm" variant={sortKeys ? "default" : "outline"} onClick={() => setSortKeys(v => !v)}>
          {sortKeys ? "Sort Keys ✓" : "Sort Keys"}
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button size="sm" variant="outline" onClick={() => prettify(false)}>Prettify{showDiff ? " Both" : ""}</Button>
        <Button size="sm" variant="outline" onClick={() => prettify(true)}>Minify{showDiff ? " Both" : ""}</Button>
      </div>
      <div className="text-xs opacity-70">
        {!showDiff && !showAnalyze ? "Single editor" : showDiff ? "Split view enabled" : "Analyze JSON structure"}
      </div>
    </div>
  )
}
