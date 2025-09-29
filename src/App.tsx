// src/App.tsx
import { useEffect, useMemo, useRef, useState } from "react"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, X, ChevronLeft, ChevronRight, SplitSquareHorizontal } from "lucide-react"

// -------------------- Types --------------------

type JSONValue = string | number | boolean | null | JSONObject | JSONArray
interface JSONObject { [key: string]: JSONValue }
interface JSONArray extends Array<JSONValue> {}

type Doc = { id: string; title: string; text: string; diffText?: string }

const makeDoc = (n: number): Doc => ({
  id: crypto.randomUUID?.() ?? String(Date.now() + n),
  title: `JSON ${n}`,
  text: "",
  diffText: "",
})

// For flat list diff view
type FlatDiff = {
  key: string
  same: boolean
  left: JSONValue | undefined
  right: JSONValue | undefined
  leftPresent: boolean
  rightPresent: boolean
}

// For tree diff view
type DiffNodeType = "object" | "array" | "value"

type DiffNode = {
  key: string // local key (no dots)
  path: string // full path
  type: DiffNodeType
  same: boolean
  leftPresent: boolean
  rightPresent: boolean
  left?: JSONValue
  right?: JSONValue
  children?: DiffNode[]
  diffCount: number // number of differing leaves under this node
}

// -------------------- Helpers --------------------

function parseJsonSafe(src: string) {
  try {
    const toParse = src.trim().length ? src : "{}"
    return { ok: true as const, value: JSON.parse(toParse) as JSONValue }
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? String(e) }
  }
}

const isPlainObj = (x: JSONValue): x is JSONObject => typeof x === "object" && x !== null && !Array.isArray(x)

function computeDifferences(a: JSONValue, b: JSONValue) {
  const diffs: FlatDiff[] = []

  const flatten = (prefix: string, node: JSONValue, out: Record<string, JSONValue>) => {
    if (isPlainObj(node)) {
      for (const [k, v] of Object.entries(node)) {
        flatten(prefix ? `${prefix}.${k}` : k, v, out)
      }
    } else if (Array.isArray(node)) {
      out[prefix] = node
    } else {
      out[prefix] = node
    }
  }

  const A: Record<string, JSONValue> = {}
  const B: Record<string, JSONValue> = {}
  flatten("", a, A)
  flatten("", b, B)

  const keys = new Set([...Object.keys(A), ...Object.keys(B)])
  for (const k of keys) {
    const leftPresent = k in A
    const rightPresent = k in B
    const va = leftPresent ? A[k] : undefined
    const vb = rightPresent ? B[k] : undefined
    const same = leftPresent && rightPresent && JSON.stringify(va) === JSON.stringify(vb)
    diffs.push({ key: k, same, left: va, right: vb, leftPresent, rightPresent })
  }

  diffs.sort((x, y) => (Number(x.same) - Number(y.same)) || x.key.localeCompare(y.key))
  return diffs
}

function computeDiffTree(a: JSONValue, b: JSONValue, path = ""): DiffNode {
  const leftPresent = typeof a !== "undefined"
  const rightPresent = typeof b !== "undefined"

  const nodeType: DiffNodeType =
    Array.isArray(a) || Array.isArray(b)
      ? "array"
      : (isPlainObj(a) || isPlainObj(b))
        ? "object"
        : "value"

  if (nodeType === "object") {
    const aObj = isPlainObj(a) ? a : {}
    const bObj = isPlainObj(b) ? b : {}
    const keys = Array.from(new Set([...Object.keys(aObj), ...Object.keys(bObj)])).sort()
    const children = keys.map((k) => computeDiffTree(aObj[k], bObj[k], path ? `${path}.${k}` : k))

    const same = leftPresent && rightPresent && children.every((c) => c.same)
    const diffCount = children.reduce((acc, c) => acc + c.diffCount, 0)

    return {
      key: path.split(".").pop() ?? "",
      path,
      type: "object",
      same,
      leftPresent,
      rightPresent,
      children,
      diffCount,
    }
  }

  const same = leftPresent && rightPresent && JSON.stringify(a) === JSON.stringify(b)

  return {
    key: path.split(".").pop() ?? "",
    path,
    type: nodeType,
    same,
    leftPresent,
    rightPresent,
    left: a,
    right: b,
    diffCount: same ? 0 : 1,
  }
}

const renderVal = (v: JSONValue | undefined) => {
  if (typeof v === "undefined") return "(missing)"
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] rounded px-1 py-0.5 bg-amber-100 text-amber-900 border border-amber-300">
      {children}
    </span>
  )
}

function Pill({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-3 w-3 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`}
      title={ok ? "Same" : "Different"}
    />
  )
}

function DiffTreeNode({
  node,
  expanded,
  setExpanded,
  depth = 0,
}: {
  node: DiffNode
  expanded: Record<string, boolean>
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  depth?: number
}) {
  const isOpen = !!expanded[node.path]
  const toggle = () => setExpanded((prev) => ({ ...prev, [node.path]: !isOpen }))

  const indent = { paddingLeft: `${depth * 12}px` }
  const label = node.path || "(root)"

  const rowClasses = "w-full flex items-center gap-2 text-left p-2 rounded hover:bg-muted/60"

  return (
    <li>
      <button type="button" className={rowClasses} onClick={node.type === "object" ? toggle : undefined} style={indent}>
        <span className="font-mono text-xs flex-1 break-words">{label}</span>
        {node.type === "object" && node.diffCount > 0 && (
          <Badge>{node.diffCount} diff{node.diffCount > 1 ? "s" : ""}</Badge>
        )}
        {!node.leftPresent || !node.rightPresent ? <Badge>missing key</Badge> : null}
        <Pill ok={node.same} />
      </button>

      {node.type !== "object" && (
        <div className="mt-1 grid grid-cols-2 gap-3 rounded border p-2 ml-3">
          <div>
            <div className="mb-1 text-[10px] uppercase opacity-70 flex items-center gap-2">
              Left {!node.leftPresent && (
                <span className="rounded bg-rose-100 text-rose-900 border border-rose-300 px-1 py-0.5">missing</span>
              )}
            </div>
            <pre className="max-h-48 overflow-auto text-xs leading-relaxed">{renderVal(node.left)}</pre>
          </div>
          <div>
            <div className="mb-1 text-[10px] uppercase opacity-70 flex items-center gap-2">
              Right {!node.rightPresent && (
                <span className="rounded bg-rose-100 text-rose-900 border border-rose-300 px-1 py-0.5">missing</span>
              )}
            </div>
            <pre className="max-h-48 overflow-auto text-xs leading-relaxed">{renderVal(node.right)}</pre>
          </div>
          <div className="col-span-2 text-[11px] opacity-70">
            {node.same
              ? "Values are identical."
              : (!node.leftPresent || !node.rightPresent)
                ? "Key exists in one JSON but not the other."
                : "Values differ."}
          </div>
        </div>
      )}

      {node.type === "object" && isOpen && node.children?.length ? (
        <ul className="mt-1 space-y-1">
          {node.children!.map((c) => (
            <DiffTreeNode key={c.path || "(root)"} node={c} expanded={expanded} setExpanded={setExpanded} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function DiffTreeView({
  root,
  expanded,
  setExpanded,
}: {
  root: DiffNode
  expanded: Record<string, boolean>
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  return (
    <div className="max-h-[48vh] overflow-auto rounded-md border p-3 text-xs">
      <div className="mb-2 font-medium">Comparison (Tree):</div>
      <ul className="space-y-1">
        <DiffTreeNode node={root} expanded={expanded} setExpanded={setExpanded} />
      </ul>
    </div>
  )
}

// -------------------- App --------------------

export default function App() {
  const [docs, setDocs] = useState<Doc[]>(() => [makeDoc(1)])
  const [active, setActive] = useState<string>("")
  const [showDiff, setShowDiff] = useState(false)

  const [diffs, setDiffs] = useState<FlatDiff[]>([])
  const [treeNode, setTreeNode] = useState<DiffNode | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "tree">("tree")
  const [diffError, setDiffError] = useState("")
  const [hasCompared, setHasCompared] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // Initialize active tab once docs are created
  useEffect(() => {
    if (!active && docs.length) setActive(docs[0].id)
  }, [docs, active])

  // tab strip scroll affordances
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

  // ensure active id stays valid after closing tabs
  useEffect(() => {
    if (active && !docs.find((d) => d.id === active) && docs.length) {
      setActive(docs[docs.length - 1].id)
    }
  }, [docs, active])

  const activeDoc = useMemo(() => docs.find(d => d.id === active), [docs, active])

  const addTab = () => {
    const next = makeDoc(docs.length + 1)
    next.text = ""
    next.diffText = ""
    setDocs((prev) => [...prev, next])
    setActive(next.id)
  }

  const closeTab = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id))
  const setText = (id: string, text: string) => setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, text } : d)))
  const setDiffText = (id: string, text: string) => setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, diffText: text } : d)))

  // when toggling to diff mode, ensure diff text exists
  useEffect(() => {
    if (showDiff && activeDoc && typeof activeDoc.diffText === "undefined") {
      setDiffText(activeDoc.id, "")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDiff, activeDoc?.id])

  // clear compare state when view or active tab changes
  useEffect(() => {
    setHasCompared(false)
    setDiffs([])
    setTreeNode(null)
    setDiffError("")
    setExpanded({})
  }, [showDiff, active])

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

    const result = computeDifferences(left.value, right.value)
    setDiffs(result)

    const root = computeDiffTree(left.value, right.value, "")
    setTreeNode(root)
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <div className="flex items-center justify-between border-b bg-background/60 px-4 py-2">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={showDiff ? "default" : "outline"} onClick={() => setShowDiff((v) => !v)}>
            <SplitSquareHorizontal className="mr-2 h-4 w-4" />
            Difference
          </Button>
        </div>
        <div className="text-xs opacity-70">
          {showDiff ? "Split view enabled (left editor stacked)" : "Single editor"}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left side: editors + tabs */}
        <div className="w-1/2 flex flex-col border-r min-h-0">
          <Tabs value={active} onValueChange={(val) => setActive(val)} className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center border-b gap-1">
              <div className="shrink-0 pl-2">
                {canLeft ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      const el = stripRef.current
                      if (el) el.scrollBy({ left: -Math.floor(el.clientWidth * 0.9), behavior: "smooth" })
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                ) : (<div className="h-7 w-7" aria-hidden />)}
              </div>

              <div ref={stripRef} className="flex-1 min-w-0 overflow-x-auto">
                <TabsList className="flex h-11 bg-transparent p-0 px-2 gap-1 whitespace-nowrap">
                  {docs.map((d) => (
                    <div key={d.id} className="inline-flex">
                      <TabsTrigger
                        value={d.id}
                        className="group relative rounded-t px-3 py-2 data-[state=active]:bg-muted"
                      >
                        <span className="max-w-[8rem] truncate">{d.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 h-5 w-5 opacity-60 hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); closeTab(d.id) }}
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
                {canRight ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => {
                      const el = stripRef.current
                      if (el) el.scrollBy({ left: Math.floor(el.clientWidth * 0.9), behavior: "smooth" })
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (<div className="h-7 w-7" aria-hidden />)}
              </div>

              <div className="px-2 shrink-0">
                <Button size="sm" variant="outline" onClick={addTab}>
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
                      onChange={(e) => setText(d.id, e.target.value)}
                      className="w-full h-full resize-none font-mono text-sm"
                      placeholder='{"key":"value"}'
                    />
                  ) : (
                    <div className="grid grid-rows-2 gap-3 h-full min-h-0">
                      <Textarea
                        value={d.text}
                        onChange={(e) => setText(d.id, e.target.value)}
                        className="w-full h-full resize-none font-mono text-sm"
                        placeholder='{"source":"baseline JSON"}'
                      />
                      <Textarea
                        value={d.diffText ?? ""}
                        onChange={(e) => setDiffText(d.id, e.target.value)}
                        className="w-full h-full resize-none font-mono text-sm"
                        placeholder='{"target":"JSON to compare"}'
                      />
                    </div>
                  )}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>

        {/* Right side: results card */}
        <div className="w-1/2 flex items-center justify-center p-4">
          {!showDiff ? (
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Welcome</CardTitle>
                <CardDescription>Enter JSON in the left editor or switch to Difference mode.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm opacity-70">
                Use the “Difference” button to compare two JSON documents.
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>JSON Difference</CardTitle>
                <CardDescription>Compare the two JSON documents from the left editor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 items-center">
                  <Button onClick={handleCompare} className="shrink-0">Compare JSON</Button>
                  <Button
                    variant="outline"
                    onClick={() => { setHasCompared(false); setDiffs([]); setTreeNode(null); setDiffError(""); setExpanded({}) }}
                  >
                    Clear Result
                  </Button>
                  <div className="ml-auto flex items-center gap-2 text-xs">
                    <span>View:</span>
                    <Button size="sm" variant={viewMode === "tree" ? "default" : "outline"} onClick={() => setViewMode("tree")}>Tree</Button>
                    <Button size="sm" variant={viewMode === "list" ? "default" : "outline"} onClick={() => setViewMode("list")}>List</Button>
                  </div>
                </div>

                {diffError && (<div className="text-sm text-destructive break-words">{diffError}</div>)}

                {hasCompared && !diffError && (
                  viewMode === "tree" ? (
                    treeNode ? (
                      <DiffTreeView root={treeNode} expanded={expanded} setExpanded={setExpanded} />
                    ) : (
                      <div className="text-sm opacity-70">No comparable keys found.</div>
                    )
                  ) : (
                    diffs.length ? (
                      <div className="max-h-[48vh] overflow-auto rounded-md border p-3 text-xs">
                        <div className="mb-2 font-medium">Comparison Result:</div>
                        <ul className="space-y-1">
                          {diffs.map((d) => {
                            const isOpen = !!expanded[d.key]
                            return (
                              <li key={d.key}>
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2 text-left p-2 rounded hover:bg-muted/60"
                                  onClick={() => setExpanded((prev) => ({ ...prev, [d.key]: !isOpen }))}
                                  aria-expanded={isOpen}
                                >
                                  <span className="font-mono text-xs flex-1 break-words">{d.key}</span>
                                  {!d.same && (!d.leftPresent || !d.rightPresent) && (
                                    <span className="text-[10px] rounded px-1 py-0.5 bg-amber-100 text-amber-900 border border-amber-300">
                                      missing key
                                    </span>
                                  )}
                                  <span
                                    className={`inline-block h-3 w-3 rounded-full ${d.same ? "bg-green-500" : "bg-red-500"}`}
                                    title={d.same ? "Same" : "Different"}
                                  />
                                </button>

                                {isOpen && (
                                  <div className="mt-1 grid grid-cols-2 gap-3 rounded border p-2">
                                    <div>
                                      <div className="mb-1 text-[10px] uppercase opacity-70 flex items-center gap-2">
                                        Left {!d.leftPresent && (
                                          <span className="rounded bg-rose-100 text-rose-900 border border-rose-300 px-1 py-0.5">missing</span>
                                        )}
                                      </div>
                                      <pre className="max-h-48 overflow-auto text-xs leading-relaxed">{renderVal(d.left)}</pre>
                                    </div>
                                    <div>
                                      <div className="mb-1 text-[10px] uppercase opacity-70 flex items-center gap-2">
                                        Right {!d.rightPresent && (
                                          <span className="rounded bg-rose-100 text-rose-900 border border-rose-300 px-1 py-0.5">missing</span>
                                        )}
                                      </div>
                                      <pre className="max-h-48 overflow-auto text-xs leading-relaxed">{renderVal(d.right)}</pre>
                                    </div>
                                    <div className="col-span-2 text-[11px] opacity-70">
                                      {d.same
                                        ? "Values are identical."
                                        : (!d.leftPresent || !d.rightPresent)
                                          ? "Key exists in one JSON but not the other."
                                          : "Values differ."}
                                    </div>
                                  </div>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-sm">No comparable keys found.</div>
                    )
                  )
                )}
              </CardContent>
              <CardFooter className="text-xs opacity-60">
                Green = values are the same, Red = different. “Missing key” means the key exists in only one JSON. Click a row to view details.
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
