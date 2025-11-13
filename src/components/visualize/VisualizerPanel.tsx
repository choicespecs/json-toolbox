import { useEffect, useMemo, useState } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Node,
  type Edge,
  Position,               // 👈 add this
} from "reactflow"
import "reactflow/dist/style.css"
import ELK from "elkjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { parseJsonSafe } from "@/lib/json"
import {
  buildContainerGraph,
  type ContainerNode as GNode,
  type ContainerEdge as GEdge,
} from "@/features/visualize/buildContainerGraph"
import ContainerNode from "@/components/visualize/ContainerNode"

const elk = new ELK()

// sizes for container boxes; height grows with rows
const BASE_W = 320
const BASE_H = 86  // header + small padding; rows add height

const nodeTypes = { container: ContainerNode }

type VisualizerPanelProps = {
  jsonText: string
}

export default function VisualizerPanel({ jsonText }: VisualizerPanelProps) {
  const [errorMessage, setErrorMessage] = useState("")
  const [rfNodes, setRfNodes] = useState<Node[]>([])
  const [rfEdges, setRfEdges] = useState<Edge[]>([])

  const { gnodes, gedges } = useMemo(() => {
    const parsed = parseJsonSafe(jsonText)
    if (!parsed.ok) {
      setErrorMessage(`JSON invalid: ${parsed.error}`)
      return { gnodes: [] as GNode[], gedges: [] as GEdge[] }
    }
    setErrorMessage("")

    // ❌ was: buildContainerGraph(parsed.value, "(root)")
    // second arg must be BuildOpts, not a string
    const g = buildContainerGraph(parsed.value)   // 👈 just call with the value

    return { gnodes: g.nodes, gedges: g.edges }
  }, [jsonText])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!gnodes.length) { setRfNodes([]); setRfEdges([]); return }

      // Height grows with number of rows (≈24px per row)
      const sizeMap = new Map<string, { w: number; h: number }>()
      gnodes.forEach(n => {
        const rowsH = Math.max(0, n.rows.length) * 24
        const h = BASE_H + rowsH
        sizeMap.set(n.id, { w: BASE_W, h })
      })

      // Build ELK input
      const graph = {
        id: "root",
        layoutOptions: {
          "elk.algorithm": "layered",
          "elk.direction": "RIGHT",
          "elk.layered.spacing.nodeNodeBetweenLayers": "160",
          "elk.spacing.nodeNode": "120",
          "elk.edgeRouting": "ORTHOGONAL",
          "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
          "elk.separateConnectedComponents": "true",
        },
        children: gnodes.map(n => {
          const s = sizeMap.get(n.id)!
          return { id: n.id, width: s.w, height: s.h }
        }),
        edges: gedges.map(e => ({ id: e.id, sources: [e.source], targets: [e.target] })),
      } as const

      const res = await elk.layout(graph as any)
      if (cancelled) return

      const pos = new Map<string, { x: number; y: number }>()
      res.children?.forEach((c: any) => pos.set(c.id, { x: c.x ?? 0, y: c.y ?? 0 }))

      // React Flow nodes
      const nodes: Node[] = gnodes.map(n => {
        const s = sizeMap.get(n.id)!
        return {
          id: n.id,
          type: "container",
          position: pos.get(n.id) ?? { x: 0, y: 0 },
          data: {
            title: n.label,
            kind: n.kind,
            count: n.meta?.count,
            note: n.meta?.note,
            rows: n.rows,
          },
          style: { width: s.w, height: s.h },

          // ❌ was: "right" / "left" (plain strings)
          // ✅ use Position enum so it matches Node type
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        }
      })

      // React Flow edges → attach to our specific handles
      const edges: Edge[] = gedges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: "out",
        targetHandle: "in",
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed },
        label: e.label,
        labelStyle: { fontSize: 10 },
        style: { stroke: "#111", strokeWidth: 2, opacity: 0.95 },
      }))

      setRfNodes(nodes)
      setRfEdges(edges)
    })()
    return () => { cancelled = true }
  }, [gnodes, gedges])

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>JSON Visualizer</CardTitle>
        <CardDescription>Edges connect only containers. Keys & types render inline.</CardDescription>
      </CardHeader>
      <CardContent className="h-[70vh]">
        {errorMessage ? (
          <div className="text-sm text-destructive">{errorMessage}</div>
        ) : rfNodes.length === 0 ? (
          <div className="text-sm opacity-70">Enter valid JSON to render a graph.</div>
        ) : (
          <div className="h-full rounded border">
            <ReactFlow
              nodes={rfNodes}
              edges={rfEdges}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{
                type: "smoothstep",
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: "#111", strokeWidth: 2 },
              }}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              panOnDrag
              zoomOnScroll
              minZoom={0.1}
              maxZoom={1.5}
              proOptions={{ hideAttribution: true }}
            >
              <MiniMap pannable zoomable />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
