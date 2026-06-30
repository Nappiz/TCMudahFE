import { Loader2 } from "lucide-react";

export default function CMSLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-4" />
      <p className="text-sm animate-pulse">Memuat data...</p>
    </div>
  );
}
