import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Doc } from "@/types"
import type { FlatDiff, DiffNode } from "@/features/diff"
import type { InspectNode } from "@/features/analyze"
import { parseJsonSafe, formatJsonText } from "@/lib/json"
import { buildInspectTree } from "@/features/analyze/inspect"
import { computeDifferences, computeDiffTree } from "@/features/diff/compute"

import { TopBar } from "@/components/app/TopBar"
import { LeftEditors } from "@/components/app/LeftEditors"
import { DiffPanel } from "@/components/diff/DiffPanel"
import { AnalyzePanel } from "@/components/analyze/AnalyzePanel"

const makeDoc = (n: number): Doc => ({
  id: crypto.randomUUID?.() ?? String(Date.now() + n),
  title: `JSON ${n}`,
  text: "",
  diffText: "",
})

export default function App() {
  // state
  const [docs, setDocs] = useState<Doc[]>(() => [makeDoc(1)])
  const [active, setActive] = useState<string>("")
  const activeDoc = useMemo(() => docs.find((d) => d.id === active), [docs, active])

  const [showDiff, setShowDiff] = useState(false)
  const [showAnalyze, setShowAnalyze] = useState(false)
  const [indent, setIndent] = useState<2 | 4>(2)
  const [sortKeys, setSortKeys] = useState(true)

  const [diffs, setDiffs] = useState<FlatDiff[]>([])
  const [treeNode, setTreeNode] = useState<DiffNode | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "tree">("tree")
  const [diffError, setDiffError] = useState("")
  const [hasCompared, setHasCompared] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const [analyzeRoot, setAnalyzeRoot] = useState<InspectNode | null>(null)
  const [analyzeError, setAnalyzeError] = useState("")
  const [analyzeExpanded, setAnalyzeExpanded] = useState<Record<string, boolean>>({})

  // ensure initial tab
  useEffect(() => { if (!active && docs.length) setActive(docs[0].id) }, [docs, active])
  useEffect(() => { if (active && !docs.find(d => d.id === active) && docs.length) setActive(docs[docs.length - 1].id) }, [docs, active])

  useEffect(() => { setHasCompared(false); setDiffs([]); setTreeNode(null); setDiffError(""); setExpanded({}) }, [showDiff, active])
  useEffect(() => { setAnalyzeRoot(null); setAnalyzeError(""); setAnalyzeExpanded({}) }, [showAnalyze, active])

  // doc helpers
  const addTab = () => { const next = makeDoc(docs.length + 1); setDocs(p => [...p, next]); setActive(next.id) }
  const closeTab = (id: string) => setDocs(p => p.filter(d => d.id !== id))
  const setText = (id: string, text: string) => setDocs(p => p.map(d => d.id === id ? { ...d, text } : d))
  const setDiffText = (id: string, text: string) => setDocs(p => p.map(d => d.id === id ? { ...d, diffText: text } : d))

  useEffect(() => { if (showDiff && activeDoc && typeof activeDoc.diffText === "undefined") setDiffText(activeDoc.id, "") }, [showDiff, activeDoc?.id])

  // actions
  const handleCompare = () => {
    setDiffError(""); setDiffs([]); setTreeNode(null); setHasCompared(true)
    if (!activeDoc) return
    const left = parseJsonSafe(activeDoc.text)
    if (!left.ok) { setDiffError(`Left JSON invalid: ${left.error}`); return }
    const right = parseJsonSafe(activeDoc.diffText ?? "{}")
    if (!right.ok) { setDiffError(`Right JSON invalid: ${right.error}`); return }
    setDiffs(computeDifferences(left.value, right.value))
    setTreeNode(computeDiffTree(left.value, right.value, ""))
  }

  const handleAnalyze = () => {
    setAnalyzeError(""); setAnalyzeRoot(null); setAnalyzeExpanded({})
    if (!activeDoc) return
    const parsed = parseJsonSafe(activeDoc.text)
    if (!parsed.ok) { setAnalyzeError(`JSON invalid: ${parsed.error}`); return }
    setAnalyzeRoot(buildInspectTree(parsed.value, ""))
  }

  const prettify = (minify = false) => {
    if (!activeDoc) return
    const L = formatJsonText(activeDoc.text, { indent, sortKeys, minify })
    if (!L.ok) { alert(`Left JSON invalid: ${L.error}`); return }
    setText(activeDoc.id, L.text)
    if (showDiff) {
      const R = formatJsonText(activeDoc.diffText ?? "{}", { indent, sortKeys, minify })
      if (!R.ok) { alert(`Right JSON invalid: ${R.error}`); return }
      setDiffText(activeDoc.id, R.text)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <TopBar
        showDiff={showDiff} setShowDiff={setShowDiff}
        showAnalyze={showAnalyze} setShowAnalyze={setShowAnalyze}
        indent={indent} setIndent={setIndent}
        sortKeys={sortKeys} setSortKeys={setSortKeys}
        prettify={prettify}
      />
      <div className="flex flex-1 min-h-0">
        <div className="w-1/2 flex flex-col border-r min-h-0">
          <LeftEditors
            docs={docs} active={active} onActiveChange={setActive}
            onAddTab={addTab} onCloseTab={closeTab}
            onSetText={setText} onSetDiffText={setDiffText}
            showDiff={showDiff}
          />
        </div>
        <div className="w-1/2 flex items-center justify-center p-4">
          {!showDiff && !showAnalyze && (
            <Card className="w-full max-w-sm">
              <CardHeader><CardTitle>Welcome</CardTitle><CardDescription>Enter JSON in the left editor or choose a mode.</CardDescription></CardHeader>
              <CardContent className="text-sm opacity-70">Use “Difference” to compare two JSONs, or “Analyze” to browse structure.</CardContent>
            </Card>
          )}
          {showDiff && (
            <DiffPanel
              diffs={diffs} treeNode={treeNode} viewMode={viewMode} setViewMode={setViewMode}
              diffError={diffError} hasCompared={hasCompared}
              expanded={expanded} setExpanded={setExpanded}
              onCompare={handleCompare}
              onClear={() => { setHasCompared(false); setDiffs([]); setTreeNode(null); setDiffError(""); setExpanded({}) }}
            />
          )}
          {showAnalyze && (
            <AnalyzePanel
              root={analyzeRoot} error={analyzeError}
              expanded={analyzeExpanded} setExpanded={setAnalyzeExpanded}
              onAnalyze={handleAnalyze}
              onClear={() => { setAnalyzeRoot(null); setAnalyzeError(""); setAnalyzeExpanded({}) }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
