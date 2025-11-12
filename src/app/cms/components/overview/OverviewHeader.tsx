"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RefreshCw, Sparkles } from "lucide-react";
import type { Me } from "@/hooks/useCMSOverview";

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
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs text-white/60">Selamat datang kembali 👋</div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {me?.full_name ?? "Pengguna"}{" "}
            <span className="text-white/60">— CMS Overview</span>
          </h1>
          {lastLoadedAt && (
            <div className="mt-1 text-[11px] text-white/50">
              Terakhir diperbarui:{" "}
              {lastLoadedAt.toLocaleString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "short",
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={onReload}
            className="inline-flex items-center gap-2"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
            Muat Ulang
          </Button>
          <Link href="/cms/user-role">
            <Button
              variant="secondary"
              className="inline-flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Kelola
            </Button>
          </Link>
        </div>
      </div>
      {err && (
        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {err}
        </div>
      )}
    </div>
  );
}
