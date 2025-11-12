"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  EyeOff,
  LineChart,
} from "lucide-react";
import type { CMSStats, AdminOrder } from "@/hooks/useCMSOverview";
import {
  Panel,
  StatRow,
  KPIBlock,
  MiniBars,
  PendingTable,
} from "./overview-ui";
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
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Ringkasan Orders"
          right={
            <Link href="/cms/orders">
              <Button variant="ghost" className="text-sm">
                Lihat Semua
              </Button>
            </Link>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <StatRow
              icon={<Receipt className="h-4 w-4" />}
              label="Total Orders"
              value={loading ? "…" : stats.totalOrders}
            />
            <StatRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Approved"
              value={loading ? "…" : stats.approvedOrders}
            />
            <StatRow
              icon={<Clock className="h-4 w-4" />}
              label="Pending"
              value={loading ? "…" : stats.pendingOrders}
            />
            <StatRow
              icon={<XCircle className="h-4 w-4" />}
              label="Rejected"
              value={loading ? "…" : stats.rejectedOrders}
            />
            <StatRow
              icon={<EyeOff className="h-4 w-4" />}
              label="Expired"
              value={loading ? "…" : stats.expiredOrders}
            />
            <StatRow
              icon={<LineChart className="h-4 w-4" />}
              label="Approval Rate"
              value={loading ? "…" : `${stats.approvalRate}%`}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <KPIBlock
              label="Pemasukan (Approved - All time)"
              value={loading ? "…" : rupiah(stats.revenueApproved)}
            />
            <KPIBlock
              label="Average Order Value (Approved)"
              value={loading ? "…" : rupiah(stats.aov)}
            />
          </div>
          <div className="mt-4">
            <KPIBlock
              label="Revenue 30 hari terakhir"
              value={loading ? "…" : rupiah(stats.revenue30d)}
            />
          </div>
        </Panel>

        <Panel title="Tren 14 Hari Terakhir">
          <div className="grid gap-4">
            <MiniBars
              title="Orders per Hari"
              series={stats.orderSeries}
              formatValue={(v) => `${v} orders`}
            />
            <MiniBars
              title="Revenue per Hari"
              series={stats.revSeries}
              formatValue={(v) => rupiah(v)}
            />
          </div>
        </Panel>
      </div>

      <Panel title="Pending Orders Terbaru">
        <PendingTable orders={pendingLatest} />
      </Panel>
    </div>
  );
}
