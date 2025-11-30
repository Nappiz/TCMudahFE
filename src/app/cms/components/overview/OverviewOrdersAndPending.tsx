"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CMSStats } from "@/hooks/useCMSOverview";
import type { AdminOrder } from "@/types/catalog";
import { GlassCard, MiniBars, PendingTable } from "./overview-ui";
import { rupiah } from "../../../../../lib/format";

export default function OverviewOrdersAndPending({
  stats,
  loading,
  pendingLatest,
}: {
  stats: CMSStats;
  loading: boolean;
  pendingLatest: AdminOrder[];
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Butuh Persetujuan ({stats.pendingOrders})</h3>
            <Link href="/cms/orders" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
        <PendingTable orders={pendingLatest} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard>
            <MiniBars
                title="Revenue Trend (14 Hari)"
                series={stats.revSeries}
                formatValue={(v) => rupiah(v)}
            />
        </GlassCard>
        <GlassCard>
            <MiniBars
                title="Order Volume (14 Hari)"
                series={stats.orderSeries}
                formatValue={(v) => `${v} orders`}
            />
        </GlassCard>
      </div>
    </div>
  );
}