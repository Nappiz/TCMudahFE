"use client";

import {
  Users,
  Shield,
  GraduationCap,
  BookOpenText,
} from "lucide-react";
import type { CMSStats } from "@/hooks/useCMSOverview";
import { StatCard } from "./overview-ui";

export default function OverviewKpiUtama({
  stats,
  loading,
}: {
  stats: CMSStats;
  loading: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<Users className="h-4 w-4" />}
        title="Total Pengguna"
        value={loading ? "…" : stats.totalUsers}
        hint={`${stats.admin} admin • ${stats.mentor} mentor • ${stats.peserta} peserta`}
        href="/cms/user-role"
      />
      <StatCard
        icon={<Shield className="h-4 w-4" />}
        title="Admin & Superadmin"
        value={loading ? "…" : stats.admin + stats.superadmin}
        hint={`${stats.superadmin} superadmin • ${stats.admin} admin`}
        href="/cms/user-role"
      />
      <StatCard
        icon={<GraduationCap className="h-4 w-4" />}
        title="Mentor"
        value={loading ? "…" : stats.totalMentors}
        hint={`${stats.visibleMentors} tampil • rata-rata ${stats.classPerMentor.toFixed(
          1
        )} kelas/mentor`}
        href="/cms/mentors"
      />
      <StatCard
        icon={<BookOpenText className="h-4 w-4" />}
        title="Kurikulum"
        value={loading ? "…" : stats.totalCurr}
        hint="Semester 1–2"
        href="/cms/curriculum"
      />
    </div>
  );
}
