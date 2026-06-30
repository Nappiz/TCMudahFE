"use client";

import { Users, GraduationCap, DollarSign, Activity } from "lucide-react";
import type { CMSStats } from "@/hooks/useCMSOverview";
import { StatCard } from "./overview-ui";
import { rupiah } from "../../../../../lib/format";

import { useMemo } from "react";
import type { AdminOrder } from "@/types/catalog";

export default function OverviewKpiUtama({ stats, loading, orders, startDate, endDate }: { stats: CMSStats; loading: boolean; orders: AdminOrder[]; startDate?: string; endDate?: string; }) {
  const dynamicRevenue = useMemo(() => {
    if (!orders) return 0;
    return orders.reduce((sum, o) => {
      if (o.status !== 'approved') return sum;
      const d = new Date(o.created_at);
      if (startDate && new Date(startDate) > d) return sum;
      if (endDate && new Date(endDate + "T23:59:59") < d) return sum;
      return sum + (o.total || 0);
    }, 0);
  }, [orders, startDate, endDate]);

  const revTitle = (startDate || endDate) ? "Filtered Revenue" : "Total Revenue (All Time)";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<DollarSign className="h-5 w-5" />}
        title={revTitle}
        value={loading ? "..." : rupiah(dynamicRevenue)}
        trend={startDate || endDate ? "" : "+12.5%"}
        hint={startDate || endDate ? "Sesuai rentang tanggal" : "vs bulan lalu"}
      />
      <StatCard
        icon={<Users className="h-5 w-5" />}
        title="Total User"
        value={loading ? "..." : stats.totalUsers}
        hint={`${stats.newUsers30d} user baru`}
      />
      <StatCard
        icon={<Activity className="h-5 w-5" />}
        title="Active Students"
        value={loading ? "..." : stats.participantsActive}
        hint="Order approved"
      />
      <StatCard
        icon={<GraduationCap className="h-5 w-5" />}
        title="Total Kelas"
        value={loading ? "..." : stats.totalClasses}
        hint={`${stats.visibleClasses} published`}
        href="/cms/classes"
      />
    </div>
  );
}