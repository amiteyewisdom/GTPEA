import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
      <p className="text-sm text-brand-text-secondary">Loading reports…</p>
    </div>
  );
}
