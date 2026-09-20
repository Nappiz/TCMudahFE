import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminOrder, Me } from "@/types/catalog";
import { api } from "../../lib/api";

export type DailyPoint = { key: string; label: string; value: number };

export type CMSStats = {
  totalUsers: number;
  superadmin: number;
  admin: number;
  mentor: number;
  peserta: number;
  newUsers30d: number;
  totalCurr: number;
  totalT: number;
  visibleT: number;
  hiddenT: number;
  totalMentors: number;
  visibleMentors: number;
  totalClasses: number;
  visibleClasses: number;
  classPerMentor: number;
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  expiredOrders: number;
  revenueApproved: number;
  revenue30d: number;
  participantsActive: number;
  aov: number;
  approvalRate: number;
  orderSeries: DailyPoint[];
  revSeries: DailyPoint[];
};

export type DashboardTopClass = {
  id: string;
  title: string;
  count: number;
  revenue: number;
};

export type DashboardPeriod = {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  expiredOrders: number;
  revenueApproved: number;
  aov: number;
  approvalRate: number;
  classRevenue: number;
  packageRevenue: number;
  topClasses: DashboardTopClass[];
};

type ApiSeriesPoint = { key: string; value: number };

type DashboardOverviewResponse = {
  me: Me;
  stats: {
    total_users: number;
    superadmin: number;
    admin: number;
    mentor: number;
    peserta: number;
    new_users_30d: number;
    total_curriculum: number;
    total_testimonials: number;
    visible_testimonials: number;
    hidden_testimonials: number;
    total_mentors: number;
    visible_mentors: number;
    total_classes: number;
    visible_classes: number;
    class_per_mentor: number;
    total_orders: number;
    pending_orders: number;
    approved_orders: number;
    rejected_orders: number;
    expired_orders: number;
    revenue_approved: number;
    revenue_30d: number;
    participants_active: number;
    aov: number;
    approval_rate: number;
    order_series: ApiSeriesPoint[];
    revenue_series: ApiSeriesPoint[];
  };
  period: {
    total_orders: number;
    pending_orders: number;
    approved_orders: number;
    rejected_orders: number;
    expired_orders: number;
    revenue_approved: number;
    aov: number;
    approval_rate: number;
    class_revenue: number;
    package_revenue: number;
    top_classes: DashboardTopClass[];
  };
  pending_latest: AdminOrder[];
  recent_orders: AdminOrder[];
};

export function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatSeries(points: ApiSeriesPoint[]): DailyPoint[] {
  return points.map((point) => ({
    key: point.key,
    label: new Date(`${point.key}T00:00:00Z`).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
    value: Number(point.value),
  }));
}

function mapStats(data: DashboardOverviewResponse["stats"]): CMSStats {
  return {
    totalUsers: Number(data.total_users),
    superadmin: Number(data.superadmin),
    admin: Number(data.admin),
    mentor: Number(data.mentor),
    peserta: Number(data.peserta),
    newUsers30d: Number(data.new_users_30d),
    totalCurr: Number(data.total_curriculum),
    totalT: Number(data.total_testimonials),
    visibleT: Number(data.visible_testimonials),
    hiddenT: Number(data.hidden_testimonials),
    totalMentors: Number(data.total_mentors),
    visibleMentors: Number(data.visible_mentors),
    totalClasses: Number(data.total_classes),
    visibleClasses: Number(data.visible_classes),
    classPerMentor: Number(data.class_per_mentor),
    totalOrders: Number(data.total_orders),
    pendingOrders: Number(data.pending_orders),
    approvedOrders: Number(data.approved_orders),
    rejectedOrders: Number(data.rejected_orders),
    expiredOrders: Number(data.expired_orders),
    revenueApproved: Number(data.revenue_approved),
    revenue30d: Number(data.revenue_30d),
    participantsActive: Number(data.participants_active),
    aov: Number(data.aov),
    approvalRate: Number(data.approval_rate),
    orderSeries: formatSeries(data.order_series),
    revSeries: formatSeries(data.revenue_series),
  };
}

function mapPeriod(data: DashboardOverviewResponse["period"]): DashboardPeriod {
  return {
    totalOrders: Number(data.total_orders),
    pendingOrders: Number(data.pending_orders),
    approvedOrders: Number(data.approved_orders),
    rejectedOrders: Number(data.rejected_orders),
    expiredOrders: Number(data.expired_orders),
    revenueApproved: Number(data.revenue_approved),
    aov: Number(data.aov),
    approvalRate: Number(data.approval_rate),
    classRevenue: Number(data.class_revenue),
    packageRevenue: Number(data.package_revenue),
    topClasses: data.top_classes.map((item) => ({
      ...item,
      count: Number(item.count),
      revenue: Number(item.revenue),
    })),
  };
}

export function useCMSOverview(startDate = "", endDate = "") {
  const [me, setMe] = useState<Me | null>(null);
  const [stats, setStats] = useState<CMSStats | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod | null>(null);
  const [pendingLatest, setPendingLatest] = useState<AdminOrder[]>([]);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams({ days: "14" });
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);
      const response = await api<DashboardOverviewResponse>(
        `/admin/dashboard/overview?${params.toString()}`,
      );
      if (requestId !== requestIdRef.current) return;
      setMe(response.me);
      setStats(mapStats(response.stats));
      setPeriod(mapPeriod(response.period));
      setPendingLatest(response.pending_latest);
      setRecentOrders(response.recent_orders);
    } catch (errorValue: unknown) {
      if (requestId !== requestIdRef.current) return;
      setErr(
        errorValue instanceof Error ? errorValue.message : "Gagal memuat CMS.",
      );
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    me,
    stats,
    period,
    pendingLatest,
    recentOrders,
    loading,
    err,
    reload,
  };
}
