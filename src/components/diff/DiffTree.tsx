import type { DiffNode } from "@/features/diff";
import { Badge } from "@/components/badges/Badge";
import { Pill } from "@/components/badges/Pill";
import { renderVal } from "@/lib/json";

function DiffTreeNode({
  node,
  expanded,
  setExpanded,
  depth = 0,
}: {
  node: DiffNode;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  depth?: number;
}) {
  const isOpen = !!expanded[node.path];
  const toggle = () => setExpanded((prev) => ({ ...prev, [node.path]: !isOpen }));

  const indent = { paddingLeft: `${depth * 12}px` };
  const label = node.path || "(root)";

  const rowClasses = "w-full flex items-center gap-2 text-left p-2 rounded hover:bg-muted/60";

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
  );
}

export function DiffTreeView({
  root,
  expanded,
  setExpanded,
}: {
  root: DiffNode;
  expanded: Record<string, boolean>;
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}) {
  return (
    <div className="max-h-[48vh] overflow-auto rounded-md border p-3 text-xs">
      <div className="mb-2 font-medium">Comparison (Tree):</div>
      <ul className="space-y-1">
        <DiffTreeNode node={root} expanded={expanded} setExpanded={setExpanded} />
      </ul>
    </div>
  );
}