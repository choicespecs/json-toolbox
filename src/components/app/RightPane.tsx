import type { FlatDiff, DiffNode } from "@/features/diff"
import type { InspectNode } from "@/features/analyze"
import { DiffPanel } from "@/components/diff/DiffPanel"
import { AnalyzePanel } from "@/components/analyze/AnalyzePanel"
import VisualizerPanel from "@/components/visualize/VisualizerPanel"
import { JsonStringOutputCard } from "@/components/app/JsonStringOutputCard"

type Props = {
  showDiff: boolean
  showAnalyze: boolean
  showVisualize: boolean

  // output mode
  jsonStringOutput: string

  // visualize
  jsonText: string

  // diff
  diffs: FlatDiff[]
  treeNode: DiffNode | null
  viewMode: "list" | "tree"
  setViewMode: (m: "list" | "tree") => void
  diffError: string
  hasCompared: boolean
  expanded: Record<string, boolean>
  setExpanded: (v: Record<string, boolean>) => void
  onCompare: () => void
  onClearDiff: () => void

  // analyze
  analyzeRoot: InspectNode | null
  analyzeError: string
  analyzeExpanded: Record<string, boolean>
  setAnalyzeExpanded: (v: Record<string, boolean>) => void
  onAnalyze: () => void
  onClearAnalyze: () => void
}

export function RightPane(props: Props) {
  const {
    showDiff,
    showAnalyze,
    showVisualize,

    jsonStringOutput,
    jsonText,

    diffs,
    treeNode,
    viewMode,
    setViewMode,
    diffError,
    hasCompared,
    expanded,
    setExpanded,
    onCompare,
    onClearDiff,

    analyzeRoot,
    analyzeError,
    analyzeExpanded,
    setAnalyzeExpanded,
    onAnalyze,
    onClearAnalyze,
  } = props

  return (
    <div className="w-1/2 flex flex-col p-4 overflow-y-auto">
      {!showDiff && !showAnalyze && !showVisualize && (
        <JsonStringOutputCard value={jsonStringOutput} />
      )}

      {showDiff && (
        <DiffPanel
          diffs={diffs}
          treeNode={treeNode}
          viewMode={viewMode}
          setViewMode={setViewMode}
          diffError={diffError}
          hasCompared={hasCompared}
          expanded={expanded}
          setExpanded={setExpanded}
          onCompare={onCompare}
          onClear={onClearDiff}
        />
      )}

      {showAnalyze && (
        <AnalyzePanel
          root={analyzeRoot}
          error={analyzeError}
          expanded={analyzeExpanded}
          setExpanded={setAnalyzeExpanded}
          onAnalyze={onAnalyze}
          onClear={onClearAnalyze}
        />
      )}

      {showVisualize && <VisualizerPanel jsonText={jsonText} />}
    </div>
  )
}
