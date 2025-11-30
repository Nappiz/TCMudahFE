"use client";

import { Users, GraduationCap, DollarSign, Activity } from "lucide-react";
import type { CMSStats } from "@/hooks/useCMSOverview";
import { StatCard } from "./overview-ui";
import { rupiah } from "../../../../../lib/format";

export default function OverviewKpiUtama({ stats, loading }: { stats: CMSStats; loading: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<DollarSign className="h-5 w-5" />}
        title="Revenue (30d)"
        value={loading ? "..." : rupiah(stats.revenue30d)}
        trend="+12.5%"
        hint="vs bulan lalu"
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