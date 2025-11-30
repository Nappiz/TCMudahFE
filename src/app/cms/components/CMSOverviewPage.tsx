"use client";

import { useMemo } from "react";
import { useCMSOverview, parseDate } from "@/hooks/useCMSOverview";
import type { AdminOrder } from "@/types/catalog";
import OverviewHeader from "./overview/OverviewHeader";
import OverviewKpiUtama from "./overview/OverviewKpiUtama";
import OverviewOrdersAndPending from "./overview/OverviewOrdersAndPending";
import OverviewActivityFeed from "./overview/OverviewActivityFeed";
import OverviewTopClasses from "./overview/OverviewTopClasses";
import { Loader2 } from "lucide-react";

export default function CMSOverviewPage() {
  const { me, stats, orders, classes, loading, err, lastLoadedAt, reload } = useCMSOverview(); // Ambil classes juga

  const pendingLatest: AdminOrder[] = useMemo(
    () => (orders ?? []).filter((o) => o.status === "pending")
      .sort((a, b) => (parseDate(b.created_at)?.getTime() || 0) - (parseDate(a.created_at)?.getTime() || 0))
      .slice(0, 5),
    [orders]
  );

  if (loading && !stats) {
      return <div className="h-[70vh] flex items-center justify-center"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
  }

  if (!stats) return <div className="text-center p-10 text-red-400">Gagal memuat data statistik.</div>;

  return (
    <div className="space-y-6 pb-10">
      <OverviewHeader me={me} err={err} lastLoadedAt={lastLoadedAt} onReload={reload} />

      <OverviewKpiUtama stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-2 space-y-6">
              <OverviewOrdersAndPending stats={stats} loading={loading} pendingLatest={pendingLatest} />
              
              <OverviewTopClasses orders={orders} classes={classes} />
          </div>

          <div className="lg:col-span-1 space-y-6">
              <OverviewActivityFeed orders={orders} />
              
              <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-slate-800 to-slate-900 p-5 text-center">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">System Status</div>
                  <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-emerald-400 font-bold">Operational</span>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">Database Connected • Storage OK</p>
              </div>
          </div>
      </div>
    </div>
  );
}