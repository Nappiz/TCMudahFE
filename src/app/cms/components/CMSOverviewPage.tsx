"use client";

import { useMemo } from "react";
import {
  useCMSOverview,
  parseDate,
  type AdminOrder,
} from "@/hooks/useCMSOverview";

import OverviewHeader from "./overview/OverviewHeader";
import OverviewKpiUtama from "./overview/OverviewKpiUtama";
import OverviewKpiKontenPeserta from "./overview/OverviewKpiKontenPeserta";
import OverviewOrdersAndPending from "./overview/OverviewOrdersAndPending";
import OverviewNavigationAndStatus from "./overview/OverviewNavigationAndStatus";

export default function CMSOverviewPage() {
  const { me, stats, orders, loading, err, lastLoadedAt, reload } =
    useCMSOverview();

  const pendingLatest: AdminOrder[] = useMemo(
    () =>
      (orders ?? [])
        .filter((o) => o.status === "pending")
        .sort(
          (a, b) =>
            (parseDate(b.created_at)?.getTime() || 0) -
            (parseDate(a.created_at)?.getTime() || 0)
        )
        .slice(0, 8),
    [orders]
  );

  return (
    <div className="space-y-6">
      <OverviewHeader
        me={me}
        err={err}
        lastLoadedAt={lastLoadedAt}
        onReload={reload}
      />

      <OverviewKpiUtama stats={stats} loading={loading} />

      <OverviewKpiKontenPeserta stats={stats} loading={loading} />

      <OverviewOrdersAndPending
        stats={stats}
        loading={loading}
        pendingLatest={pendingLatest}
      />

      <OverviewNavigationAndStatus me={me} stats={stats} />
    </div>
  );
}
