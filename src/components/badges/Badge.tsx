export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] rounded px-1 py-0.5 bg-amber-100 text-amber-900 border border-amber-300">
      {children}
    </span>
  );
}