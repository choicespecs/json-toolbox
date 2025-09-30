import type { InspectKind } from "@/features/analyze";

export function KindBadge({ kind }: { kind: InspectKind }) {
  const label = kind.toUpperCase();
  return (
    <span className="text-[10px] rounded px-1 py-0.5 bg-slate-100 text-slate-900 border border-slate-300">
      {label}
    </span>
  );
}