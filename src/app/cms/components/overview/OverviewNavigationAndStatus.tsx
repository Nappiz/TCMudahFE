"use client";

import { rupiah } from "../../../../../lib/format";
import type { CMSStats, Me } from "@/hooks/useCMSOverview";
import { QuickPanel } from "./overview-ui";

export default function OverviewNavigationAndStatus({
  me,
  stats,
}: {
  me: Me | null;
  stats: CMSStats;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <QuickPanel
        title="Navigasi Cepat"
        items={[
          { label: "Kelola Role Pengguna", href: "/cms/user-role" },
          { label: "Atur Kurikulum", href: "/cms/curriculum" },
          { label: "Kelola Testimonials", href: "/cms/testimonials" },
          { label: "Kelola Mentor", href: "/cms/mentors" },
          { label: "Validasi Orders", href: "/cms/orders" },
          { label: "Kelola Kelas", href: "/cms/classes" },
          { label: "Shortlinks", href: "/cms/shortlinks" },
        ]}
      />
      <QuickPanel
        title="Status Ringkas"
        custom={
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              • Role aktif:{" "}
              <span className="text-white">{me?.role ?? "-"}</span>
            </li>
            <li>
              • Testimoni:{" "}
              <span className="text-white">{stats.visibleT}</span> tampil,{" "}
              <span className="text-white">{stats.hiddenT}</span> disembunyikan
            </li>
            <li>
              • Mentor tampil:{" "}
              <span className="text-white">{stats.visibleMentors}</span> /{" "}
              <span className="text-white">{stats.totalMentors}</span>
            </li>
            <li>
              • Kelas tampil:{" "}
              <span className="text-white">{stats.visibleClasses}</span> /{" "}
              <span className="text-white">{stats.totalClasses}</span>
            </li>
            <li>
              • Orders: pending{" "}
              <span className="text-white">{stats.pendingOrders}</span>,
              approved{" "}
              <span className="text-white">{stats.approvedOrders}</span>,
              rejected{" "}
              <span className="text-white">{stats.rejectedOrders}</span>,
              expired{" "}
              <span className="text-white">{stats.expiredOrders}</span>
            </li>
            <li>
              • Pemasukan (approved):{" "}
              <span className="text-white">
                {rupiah(stats.revenueApproved)}
              </span>
            </li>
            <li>
              • AOV (approved):{" "}
              <span className="text-white">{rupiah(stats.aov)}</span>
            </li>
            <li>
              • Approval rate:{" "}
              <span className="text-white">{stats.approvalRate}%</span>
            </li>
            <li>
              • Peserta aktif:{" "}
              <span className="text-white">
                {stats.participantsActive}
              </span>
            </li>
          </ul>
        }
      />
    </div>
  );
}
