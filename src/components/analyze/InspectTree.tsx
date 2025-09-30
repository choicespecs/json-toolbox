import type { InspectNode } from "@/features/analyze";
import { KindBadge } from "@/components/badges/KindBadge";
import { Badge } from "@/components/badges/Badge";

function InspectRow({
  node,
  expanded,
  setExpanded,
  depth = 0,
}: {
  node: InspectNode;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  depth?: number;
}) {
  const isOpen = !!expanded[node.path];
  const toggle = () => setExpanded(prev => ({ ...prev, [node.path]: !isOpen }));
  const indent = { paddingLeft: `${depth * 12}px` };
  const label = node.path || "(root)";
  const isContainer = node.kind === "object" || node.kind === "array";

  return (
    <li>
      <button
        type="button"
        className="w-full flex items-center gap-2 text-left p-2 rounded hover:bg-muted/60"
        onClick={isContainer ? toggle : undefined}
        style={indent}
      >
        <span className="font-mono text-xs flex-1 break-words">{label}</span>
        <KindBadge kind={node.kind} />
        {node.kind === "array" && <Badge>{node.count ?? 0} items</Badge>}
        {node.kind === "object" && <Badge>{node.count ?? 0} keys</Badge>}
        {node.preview && node.kind !== "object" && node.kind !== "array" ? (
          <span className="text-[10px] opacity-70 truncate max-w-[180px]">{node.preview}</span>
        ) : null}
      </button>

      {isContainer && isOpen && !!node.children?.length && (
        <ul className="mt-1 space-y-1">
          {node.children!.map((c) => (
            <InspectRow
              key={c.path || Math.random().toString(36)}
              node={c}
              expanded={expanded}
              setExpanded={setExpanded}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function InspectTree({
  root,
  expanded,
  setExpanded,
}: {
  root: InspectNode;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <div className="max-h-[48vh] overflow-auto rounded-md border p-3 text-xs">
      <div className="mb-2 font-medium">Analyze (Structure):</div>
      <ul className="space-y-1">
        <InspectRow node={root} expanded={expanded} setExpanded={setExpanded} />
      </ul>
    </div>
  );
}