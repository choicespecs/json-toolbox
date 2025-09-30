import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { InspectNode } from "@/features/analyze"
import { InspectTree } from "@/components/analyze/InspectTree"

type AnalyzePanelProps = {
  root: InspectNode | null
  error: string
  expanded: Record<string, boolean>
  setExpanded: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void
  onAnalyze: () => void
  onClear: () => void
}

export function AnalyzePanel({ root, error, expanded, setExpanded, onAnalyze, onClear }: AnalyzePanelProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Analyze JSON</CardTitle>
        <CardDescription>Explore keys, types, values, and nested relationships.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 items-center">
          <Button onClick={onAnalyze} className="shrink-0">Analyze</Button>
          <Button variant="outline" onClick={onClear}>Clear Result</Button>
        </div>

        {error && <div className="text-sm text-destructive break-words">{error}</div>}

        {root ? (
          <InspectTree root={root} expanded={expanded} setExpanded={setExpanded} />
        ) : (
          !error && <div className="text-sm opacity-70">Click “Analyze” to inspect the left JSON.</div>
        )}
      </CardContent>
      <CardFooter className="text-xs opacity-60">
        Click a row to expand/collapse. Objects show key counts; arrays show item counts. Primitives show previews.
      </CardFooter>
    </Card>
  )
}
