"use client";

import { Button } from "@/components/ui/Button";
import { RefreshCw, CalendarDays } from "lucide-react";
import type { Me } from "@/types/catalog";

export default function OverviewHeader({
  me,
  err,
  lastLoadedAt,
  onReload,
}: {
  me: Me | null;
  err: string | null;
  lastLoadedAt: Date | null;
  onReload: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
            {greeting}, {me?.full_name?.split(" ")[0] ?? "Admin"}
          </h1>
          <p className="text-slate-400 text-sm">
            Berikut adalah ringkasan aktivitas platform TC Mudah hari ini.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-xs text-slate-400">
                <CalendarDays className="w-3 h-3" />
                {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
            </span>
            <Button
                variant="ghost"
                onClick={onReload}
                className="h-9 px-3 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300"
            >
                <RefreshCw className="h-3 w-3 mr-2" /> Refresh
            </Button>
        </div>
      </div>
      
      {err && (
        <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          Error: {err}
        </div>
      )}
    </div>
  );
}