import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { FlatDiff, DiffNode } from "@/features/diff"
import { DiffTreeView } from "@/components/diff/DiffTree"
import { renderVal } from "@/lib/json"
import type { Dispatch, SetStateAction } from "react"   // 👈 add this

type DiffPanelProps = {
  diffs: FlatDiff[]
  treeNode: DiffNode | null
  viewMode: "list" | "tree"
  setViewMode: (v: "list" | "tree") => void
  diffError: string
  hasCompared: boolean
  expanded: Record<string, boolean>
  setExpanded: Dispatch<SetStateAction<Record<string, boolean>>>  // 👈 fix type
  onCompare: () => void
  onClear: () => void
}

export function DiffPanel({
  diffs, treeNode, viewMode, setViewMode,
  diffError, hasCompared, expanded, setExpanded,
  onCompare, onClear
}: DiffPanelProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>JSON Difference</CardTitle>
        <CardDescription>Compare the two JSON documents from the left editor.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 items-center">
          <Button onClick={onCompare} className="shrink-0">Compare JSON</Button>
          <Button variant="outline" onClick={onClear}>Clear Result</Button>
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span>View:</span>
            <Button size="sm" variant={viewMode === "tree" ? "default" : "outline"} onClick={() => setViewMode("tree")}>Tree</Button>
            <Button size="sm" variant={viewMode === "list" ? "default" : "outline"} onClick={() => setViewMode("list")}>List</Button>
          </div>
        </div>

        {diffError && <div className="text-sm text-destructive break-words">{diffError}</div>}

        {hasCompared && !diffError && (
          viewMode === "tree" ? (
            treeNode ? (
              <DiffTreeView root={treeNode} expanded={expanded} setExpanded={setExpanded} />
            ) : (
              <div className="text-sm opacity-70">No comparable keys found.</div>
            )
          ) : diffs.length ? (
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
                        onClick={() => setExpanded(prev => ({ ...prev, [d.key]: !isOpen }))}
                        aria-expanded={isOpen}
                      >
                        <span className="font-mono text-xs flex-1 break-words">{d.key}</span>
                        {!d.same && (!d.leftPresent || !d.rightPresent) && (
                          <span className="text-[10px] rounded px-1 py-0.5 bg-amber-100 text-amber-900 border border-amber-300">missing key</span>
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
        )}
      </CardContent>
      <CardFooter className="text-xs opacity-60">
        Green = values are the same, Red = different. “Missing key” means the key exists in only one JSON. Click a row to view details.
      </CardFooter>
    </Card>
  )
}
