import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"

type Row = { key: string; type: string }
type Data = {
  title: string
  kind: "object" | "array"
  count?: number
  note?: string
  rows: Row[]
}

function Pill({ children }: { children: string }) {
  return (
    <span className="text-[10px] rounded px-1 py-0.5 bg-slate-100 border border-slate-300">
      {children}
    </span>
  )
}

export default memo(function ContainerNode({ data }: NodeProps<Data>) {
  const { title, kind, count, note, rows } = data

  return (
    <div className="relative rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      {/* Attach points for edges */}
      <Handle type="target" position={Position.Left} id="in" />
      <Handle type="source" position={Position.Right} id="out" />

      {/* header */}
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <div className="font-mono text-xs font-semibold truncate" title={title}>
          {title}
        </div>
        <div className="flex items-center gap-1">
          <Pill>{kind.toUpperCase()}</Pill>
          {typeof count === "number" && (
            <Pill>{kind === "array" ? `${count} items` : `${count} keys`}</Pill>
          )}
          {note && <Pill>{note}</Pill>}
        </div>
      </div>

      {/* rows */}
      {rows.length ? (
        <div className="text-xs">
          <div className="grid grid-cols-[1fr_auto] gap-x-3 px-3 py-2">
            {rows.map((r) => (
              <div key={r.key} className="contents">
                <div className="font-mono truncate" title={r.key}>{r.key}</div>
                <div className="justify-self-end">
                  <Pill>{r.type.toUpperCase()}</Pill>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-[11px] opacity-70 px-3 py-2">No primitive fields</div>
      )}
    </div>
  )
})