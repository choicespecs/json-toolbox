import { useEffect, useMemo, useState } from "react"
import type { Doc } from "@/types"
import type { FlatDiff, DiffNode } from "@/features/diff"
import type { InspectNode } from "@/features/analyze"
import { parseJsonSafe, formatJsonText } from "@/lib/json"
import { buildInspectTree } from "@/features/analyze/inspect"
import { computeDifferences, computeDiffTree } from "@/features/diff/compute"
import { jsonToStringLiteral } from "@/lib/jsonToString"

const makeDoc = (n: number): Doc => ({
  id: crypto.randomUUID?.() ?? String(Date.now() + n),
  title: `JSON ${n}`,
  text: "",
  diffText: "",
})

export function useJsonToolboxApp() {
  // modes
  const [showVisualize, setShowVisualize] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [showAnalyze, setShowAnalyze] = useState(false)

  // docs/tabs
  const [docs, setDocs] = useState<Doc[]>(() => [makeDoc(1)])
  const [active, setActive] = useState<string>("")
  const activeDoc = useMemo(() => docs.find((d) => d.id === active), [docs, active])

  // format options
  const [indent, setIndent] = useState<2 | 4>(2)
  const [sortKeys, setSortKeys] = useState(true)

  // diff state
  const [diffs, setDiffs] = useState<FlatDiff[]>([])
  const [treeNode, setTreeNode] = useState<DiffNode | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "tree">("tree")
  const [diffError, setDiffError] = useState("")
  const [hasCompared, setHasCompared] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // analyze state
  const [analyzeRoot, setAnalyzeRoot] = useState<InspectNode | null>(null)
  const [analyzeError, setAnalyzeError] = useState("")
  const [analyzeExpanded, setAnalyzeExpanded] = useState<Record<string, boolean>>({})

  // JSON -> string output
  const [jsonStringOutput, setJsonStringOutput] = useState("")

  // ----- helpers -----
  const resetDiff = () => {
    setHasCompared(false)
    setDiffs([])
    setTreeNode(null)
    setDiffError("")
    setExpanded({})
  }

  const resetAnalyze = () => {
    setAnalyzeRoot(null)
    setAnalyzeError("")
    setAnalyzeExpanded({})
  }

  // ----- effects -----
  useEffect(() => {
    if (!active && docs.length) setActive(docs[0].id)
  }, [docs, active])

  useEffect(() => {
    if (active && !docs.find((d) => d.id === active) && docs.length) {
      setActive(docs[docs.length - 1].id)
    }
  }, [docs, active])

  useEffect(() => {
    resetDiff()
  }, [showDiff, active]) // same behavior as before

  useEffect(() => {
    resetAnalyze()
  }, [showAnalyze, active]) // same behavior as before

  useEffect(() => {
    if (showDiff && activeDoc && typeof activeDoc.diffText === "undefined") {
      setDiffText(activeDoc.id, "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDiff, activeDoc?.id])

  // ----- doc actions -----
  const addTab = () => {
    const next = makeDoc(docs.length + 1)
    setDocs((p) => [...p, next])
    setActive(next.id)
  }

  const closeTab = (id: string) => {
    setDocs((p) => p.filter((d) => d.id !== id))
  }

  const setText = (id: string, text: string) => {
    setDocs((p) => p.map((d) => (d.id === id ? { ...d, text } : d)))
  }

  const setDiffText = (id: string, text: string) => {
    setDocs((p) => p.map((d) => (d.id === id ? { ...d, diffText: text } : d)))
  }

  // ----- feature actions -----
  const handleCompare = () => {
    setDiffError("")
    setDiffs([])
    setTreeNode(null)
    setHasCompared(true)

    if (!activeDoc) return

    const left = parseJsonSafe(activeDoc.text)
    if (!left.ok) {
      setDiffError(`Left JSON invalid: ${left.error}`)
      return
    }

    const right = parseJsonSafe(activeDoc.diffText ?? "{}")
    if (!right.ok) {
      setDiffError(`Right JSON invalid: ${right.error}`)
      return
    }

    setDiffs(computeDifferences(left.value, right.value))
    setTreeNode(computeDiffTree(left.value, right.value, ""))
  }

  const handleAnalyze = () => {
    resetAnalyze()
    if (!activeDoc) return

    const parsed = parseJsonSafe(activeDoc.text)
    if (!parsed.ok) {
      setAnalyzeError(`JSON invalid: ${parsed.error}`)
      return
    }

    setAnalyzeRoot(buildInspectTree(parsed.value, ""))
  }

  const prettify = (minify = false) => {
    if (!activeDoc) return

    const L = formatJsonText(activeDoc.text, { indent, sortKeys, minify })
    if (!L.ok) {
      alert(`Left JSON invalid: ${L.error}`)
      return
    }
    setText(activeDoc.id, L.text)

    if (showDiff) {
      const R = formatJsonText(activeDoc.diffText ?? "{}", { indent, sortKeys, minify })
      if (!R.ok) {
        alert(`Right JSON invalid: ${R.error}`)
        return
      }
      setDiffText(activeDoc.id, R.text)
    }
  }

  const handleJsonToString = () => {
    if (!activeDoc) return

    const converted = jsonToStringLiteral(activeDoc.text)
    if (!converted) {
      alert("Invalid JSON. Please fix syntax first.")
      setJsonStringOutput("")
      return
    }

    setJsonStringOutput(converted)

    // same as your current logic: switch to "output" mode
    setShowDiff(false)
    setShowAnalyze(false)
    setShowVisualize(false)
  }

  // Optional: single mode setter to avoid weird combinations.
  // (Not required; your current code allows multiple true.)
  const setMode = (mode: "output" | "diff" | "analyze" | "visualize") => {
    setShowDiff(mode === "diff")
    setShowAnalyze(mode === "analyze")
    setShowVisualize(mode === "visualize")
  }

  return {
    // mode state
    showVisualize,
    setShowVisualize,
    showDiff,
    setShowDiff,
    showAnalyze,
    setShowAnalyze,
    setMode,

    // docs
    docs,
    active,
    setActive,
    activeDoc,
    addTab,
    closeTab,
    setText,
    setDiffText,

    // format options
    indent,
    setIndent,
    sortKeys,
    setSortKeys,
    prettify,

    // diff
    diffs,
    treeNode,
    viewMode,
    setViewMode,
    diffError,
    hasCompared,
    expanded,
    setExpanded,
    handleCompare,
    clearDiff: resetDiff,

    // analyze
    analyzeRoot,
    analyzeError,
    analyzeExpanded,
    setAnalyzeExpanded,
    handleAnalyze,
    clearAnalyze: resetAnalyze,

    // output
    jsonStringOutput,
    handleJsonToString,
  }
}
