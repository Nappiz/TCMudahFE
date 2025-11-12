"use client";

import {
  MessageSquare,
  Eye,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import type { CMSStats } from "@/hooks/useCMSOverview";
import { StatCard } from "./overview-ui";

export default function OverviewKpiKontenPeserta({
  stats,
  loading,
}: {
  stats: CMSStats;
  loading: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<MessageSquare className="h-4 w-4" />}
        title="Testimonials"
        value={loading ? "…" : stats.totalT}
        hint={`${stats.visibleT} tampil • ${stats.hiddenT} disembunyikan`}
        href="/cms/testimonials"
      />
      <StatCard
        icon={<Eye className="h-4 w-4" />}
        title="Kelas Ditampilkan"
        value={loading ? "…" : stats.visibleClasses}
        hint={`dari ${stats.totalClasses} kelas`}
        href="/cms/classes"
      />
      <StatCard
        icon={<UserCheck className="h-4 w-4" />}
        title="Peserta Aktif"
        value={loading ? "…" : stats.participantsActive}
        hint="Unique users dengan order approved"
        href="/cms/orders"
      />
      <StatCard
        icon={<TrendingUp className="h-4 w-4" />}
        title="User Baru (30d)"
        value={loading ? "…" : stats.newUsers30d}
        hint="Mengandalkan created_at jika tersedia"
      />
    </div>
  );
}
