"use client";

import { useMemo, useState } from "react";
import { useCMSOverview, parseDate } from "@/hooks/useCMSOverview";
import type { AdminOrder, ClassItem } from "@/types/catalog";
import type { CMSStats } from "@/hooks/useCMSOverview";
import Link from "next/link";
import { rupiah } from "../../../../lib/format";
import {
  Loader2, RefreshCw, CalendarDays, DollarSign, Users, Activity,
  GraduationCap, ShoppingCart, CheckCircle, XCircle, Clock, AlertTriangle,
  TrendingUp, ArrowRight, Trophy, PieChart, Package,
  BookOpen, MessageSquare, Star, FileVideo, Link2,
  UserCheck, UserPlus, BarChart3, Calendar, Zap,
} from "lucide-react";
import type { Me } from "@/types/catalog";
import { Button } from "@/components/ui/Button";

/* ================================================================
 * HELPERS
 * ==============================================================*/

function filterByDate(orders: AdminOrder[], start: string, end: string) {
  if (!start && !end) return orders;
  return orders.filter((o) => {
    const d = parseDate(o.created_at);
    if (!d) return false;
    if (start && d < new Date(start)) return false;
    if (end && d > new Date(end + "T23:59:59")) return false;
    return true;
  });
}

function timeAgo(date: Date) {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)}h lalu`;
}

/* ================================================================
 * PRIMITIVES
 * ==============================================================*/

function Card({ title, icon, children, className = "", noPadding = false, action }: {
  title?: string; icon?: React.ReactNode; children: React.ReactNode;
  className?: string; noPadding?: boolean; action?: React.ReactNode;
}) {
  return (
    <div className={`relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#111827]/90 to-[#0d1117]/90 overflow-hidden ${className}`}>
      {/* Top shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {(title || icon || action) && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            {icon && <span className="text-slate-500">{icon}</span>}
            {title && <h3 className="text-[13px] font-semibold text-slate-300 tracking-wide">{title}</h3>}
          </div>
          {action}
        </div>
      )}

      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </div>
  );
}

function KpiCard({ icon, iconColor, title, value, subtitle, href }: {
  icon: React.ReactNode; iconColor: string; title: string;
  value: string | number; subtitle?: string; href?: string;
}) {
  const inner = (
    <div className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#111827] to-[#0d1117] p-5 transition-all duration-300 hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconColor} transition-transform duration-300 group-hover:scale-105`}>
        {icon}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 mb-1">{title}</p>
      <p className="text-[22px] font-bold text-white tracking-tight leading-none">{value}</p>

      {subtitle && (
        <p className="mt-3 text-[11px] text-slate-500">{subtitle}</p>
      )}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

/* ================================================================
 * SECTION 1: HEADER
 * ==============================================================*/

function Header({ me, err, onReload, startDate, endDate, setStartDate, setEndDate }: {
  me: Me | null; err: string | null; onReload: () => void;
  startDate: string; endDate: string; setStartDate: (v: string) => void; setEndDate: (v: string) => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 18 ? "Selamat Siang" : "Selamat Malam";

  return (
    <div className="space-y-5">
      {/* Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 mb-0.5">{greeting} 👋</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {me?.full_name?.split(" ")[0] ?? "Admin"}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-[11px] text-slate-500">
            <CalendarDays className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
          <Button variant="ghost" onClick={onReload}
            className="h-8 px-3 text-[11px] bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-slate-400 rounded-lg">
            <RefreshCw className="h-3 w-3 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.015]">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 shrink-0">
          <Calendar className="w-3.5 h-3.5" />
          Filter Revenue
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="h-7 bg-[#0d1117] border border-white/[0.08] rounded-md px-2.5 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500/40 transition-colors [color-scheme:dark]" />
          <span className="text-slate-700 text-[10px]">sampai</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="h-7 bg-[#0d1117] border border-white/[0.08] rounded-md px-2.5 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500/40 transition-colors [color-scheme:dark]" />
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(""); setEndDate(""); }}
              className="cursor-pointer h-7 text-[10px] px-2.5 rounded-md bg-rose-500/10 border border-rose-500/15 text-rose-400 hover:bg-rose-500/20 transition-colors">
              Reset
            </button>
          )}
        </div>
      </div>

      {err && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.07] px-4 py-3 text-sm text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {err}
        </div>
      )}
    </div>
  );
}

/* ================================================================
 * SECTION 2: KPI ROW
 * ==============================================================*/

function KpiRow({ stats, loading, filteredOrders }: { stats: CMSStats; loading: boolean; filteredOrders: AdminOrder[] }) {
  const filteredRevenue = useMemo(() =>
    filteredOrders.filter((o) => o.status === "approved").reduce((s, o) => s + (o.total || 0), 0),
    [filteredOrders]
  );
  const filteredPending = useMemo(() => filteredOrders.filter((o) => o.status === "pending").length, [filteredOrders]);

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
      <KpiCard icon={<DollarSign className="h-5 w-5 text-emerald-400" />} iconColor="bg-emerald-500/10 ring-1 ring-emerald-500/20" title="Revenue" value={loading ? "..." : rupiah(filteredRevenue)} subtitle="Dari order approved" />
      <KpiCard icon={<ShoppingCart className="h-5 w-5 text-blue-400" />} iconColor="bg-blue-500/10 ring-1 ring-blue-500/20" title="Total Order" value={loading ? "..." : filteredOrders.length} subtitle={`${filteredPending} menunggu review`} />
      <KpiCard icon={<Users className="h-5 w-5 text-violet-400" />} iconColor="bg-violet-500/10 ring-1 ring-violet-500/20" title="Total User" value={loading ? "..." : stats.totalUsers} subtitle={`+${stats.newUsers30d} baru (30h)`} href="/cms/user-role" />
      <KpiCard icon={<Activity className="h-5 w-5 text-cyan-400" />} iconColor="bg-cyan-500/10 ring-1 ring-cyan-500/20" title="Peserta Aktif" value={loading ? "..." : stats.participantsActive} subtitle="Sudah bayar & approved" />
      <KpiCard icon={<GraduationCap className="h-5 w-5 text-amber-400" />} iconColor="bg-amber-500/10 ring-1 ring-amber-500/20" title="Total Kelas" value={loading ? "..." : stats.totalClasses} subtitle={`${stats.visibleClasses} published`} href="/cms/classes" />
    </div>
  );
}

/* ================================================================
 * SECTION 3: CHARTS
 * ==============================================================*/

function BarChartSection({ title, icon, series, formatValue, barColorFrom, barColorTo, hoverFrom, hoverTo }: {
  title: string; icon: React.ReactNode; series: { key: string; label: string; value: number }[];
  formatValue: (v: number) => string; barColorFrom: string; barColorTo: string; hoverFrom: string; hoverTo: string;
}) {
  const max = Math.max(1, ...series.map((d) => d.value));
  const total = series.reduce((a, b) => a + b.value, 0);

  return (
    <Card title={title} icon={icon}>
      <div className="mb-5 flex items-baseline gap-3">
        <span className="text-2xl font-bold text-white tracking-tight">{formatValue(total)}</span>
        <span className="text-[11px] text-slate-500">14 hari terakhir</span>
      </div>

      <div className="flex items-end gap-[3px] h-32">
        {series.map((d, i) => {
          const h = (d.value / max) * 100;
          return (
            <div key={d.key} className="group relative flex-1 h-full flex flex-col justify-end items-center">
              <div
                className={`w-full rounded-t transition-all duration-300 ${barColorFrom} ${barColorTo} group-hover:${hoverFrom} group-hover:${hoverTo}`}
                style={{
                  height: `${Math.max(3, h)}%`,
                  background: `linear-gradient(to top, var(--bar-from), var(--bar-to))`,
                  ["--bar-from" as string]: barColorFrom.includes("cyan") ? "rgb(22 78 99 / 0.5)" : "rgb(30 58 138 / 0.5)",
                  ["--bar-to" as string]: barColorFrom.includes("cyan") ? "rgb(6 182 212 / 0.5)" : "rgb(59 130 246 / 0.5)",
                }}
              />

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                <div className="bg-[#1a1f2e] text-white text-[10px] px-2.5 py-1.5 rounded-lg border border-white/10 whitespace-nowrap shadow-2xl">
                  <span className="text-slate-400">{d.label}</span>
                  <br />
                  <span className="font-bold text-[11px]">{formatValue(d.value)}</span>
                </div>
              </div>

              {/* Bottom label - show every other on small screens */}
              {i % 2 === 0 && (
                <span className="text-[8px] text-slate-600 mt-2 hidden lg:block">{d.label.split(" ")[0]}</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ================================================================
 * SECTION 4: PENDING ORDERS TABLE
 * ==============================================================*/

function PendingOrders({ pendingLatest, totalPending }: { pendingLatest: AdminOrder[]; totalPending: number }) {
  return (
    <Card
      title={`Menunggu Review (${totalPending})`}
      icon={<Clock className="w-4 h-4" />}
      action={
        <Link href="/cms/orders" className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      }
      noPadding
    >
      {pendingLatest.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-emerald-500/10 p-3.5 mb-3 ring-1 ring-emerald-500/20">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-300 mb-0.5">Semua aman!</p>
          <p className="text-xs text-slate-600">Tidak ada order yang menunggu review.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 border-b border-white/[0.04]">
                <th className="px-5 py-2.5 pl-6">Pembeli</th>
                <th className="px-5 py-2.5 text-right">Total</th>
                <th className="px-5 py-2.5 text-right pr-6">Waktu</th>
              </tr>
            </thead>
            <tbody>
              {pendingLatest.map((o, i) => (
                <tr key={o.id} className={`group hover:bg-white/[0.015] transition-colors ${i !== pendingLatest.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
                  <td className="px-5 py-3 pl-6">
                    <p className="text-[13px] font-medium text-slate-200 truncate max-w-[180px]">
                      {o.user_name || o.sender_name || "User"}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{o.user_email || `#${o.id.slice(0, 8)}`}</p>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-[13px] font-mono font-semibold text-amber-400">{rupiah(o.total || 0)}</span>
                  </td>
                  <td className="px-5 py-3 text-right pr-6">
                    <span className="text-[11px] text-slate-600">{parseDate(o.created_at) ? timeAgo(parseDate(o.created_at)!) : "-"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

/* ================================================================
 * SECTION 5: ORDER STATUS BREAKDOWN
 * ==============================================================*/

function OrderStatusBreakdown({ filteredOrders }: { filteredOrders: AdminOrder[] }) {
  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, expired: 0 };
    filteredOrders.forEach((o) => { if (o.status in c) c[o.status as keyof typeof c]++; });
    return c;
  }, [filteredOrders]);

  const total = filteredOrders.length || 1;

  const items = [
    { label: "Pending", count: counts.pending, color: "bg-amber-500", dotColor: "bg-amber-400", textColor: "text-amber-400" },
    { label: "Approved", count: counts.approved, color: "bg-emerald-500", dotColor: "bg-emerald-400", textColor: "text-emerald-400" },
    { label: "Rejected", count: counts.rejected, color: "bg-rose-500", dotColor: "bg-rose-400", textColor: "text-rose-400" },
    { label: "Expired", count: counts.expired, color: "bg-slate-600", dotColor: "bg-slate-400", textColor: "text-slate-400" },
  ];

  return (
    <Card title="Status Order" icon={<BarChart3 className="w-4 h-4" />}>
      {/* Stacked bar */}
      <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-slate-800/80 mb-5">
        {items.map((it) => (
          <div key={it.label} className={`${it.color} transition-all duration-700`}
            style={{ width: `${Math.max(it.count > 0 ? 2 : 0, (it.count / total) * 100)}%` }} />
        ))}
      </div>

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full ${it.dotColor}`} />
              <span className="text-[12px] text-slate-400">{it.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[13px] font-bold font-mono ${it.textColor}`}>{it.count}</span>
              <span className="text-[10px] text-slate-600 font-mono w-10 text-right">{Math.round((it.count / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ================================================================
 * SECTION 6: REVENUE BREAKDOWN
 * ==============================================================*/

function RevenueBreakdown({ filteredOrders }: { filteredOrders: AdminOrder[] }) {
  const { classRev, packageRev, totalRev } = useMemo(() => {
    let c = 0, p = 0;
    filteredOrders.forEach((o) => {
      if (o.status !== "approved") return;
      (o.items || []).forEach((item: any) => {
        const rev = item.price * item.qty;
        if (item.item_type === "package") p += rev; else c += rev;
      });
    });
    return { classRev: c, packageRev: p, totalRev: c + p };
  }, [filteredOrders]);

  const classPct = totalRev > 0 ? Math.round((classRev / totalRev) * 100) : 0;
  const packagePct = 100 - classPct;

  return (
    <Card title="Revenue Split" icon={<PieChart className="w-4 h-4" />}>
      {totalRev === 0 ? (
        <p className="text-[12px] text-slate-600 text-center py-6">Belum ada data.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-0.5">Total</p>
            <p className="text-xl font-bold text-white">{rupiah(totalRev)}</p>
          </div>

          <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-slate-800/80">
            <div style={{ width: `${classPct}%` }} className="bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-700" />
            <div style={{ width: `${packagePct}%` }} className="bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/10">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3 h-3 text-cyan-400" />
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Kelas</span>
              </div>
              <p className="text-lg font-bold text-white leading-none">{classPct}%</p>
              <p className="text-[10px] text-slate-500 mt-1">{rupiah(classRev)}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/[0.05] border border-violet-500/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Package className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Paket</span>
              </div>
              <p className="text-lg font-bold text-white leading-none">{packagePct}%</p>
              <p className="text-[10px] text-slate-500 mt-1">{rupiah(packageRev)}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ================================================================
 * SECTION 7: TOP CLASSES
 * ==============================================================*/

function TopClasses({ filteredOrders, classes }: { filteredOrders: AdminOrder[]; classes: ClassItem[] | null }) {
  const topClasses = useMemo(() => {
    if (!classes) return [];
    const salesMap: Record<string, { id: string; title: string; count: number; revenue: number }> = {};
    filteredOrders.forEach((o) => {
      if (o.status !== "approved") return;
      (o.items || []).forEach((item: any) => {
        const cid = item.class_id || item.item_id;
        if (!cid) return;
        if (!salesMap[cid]) {
          const cls = classes.find((c) => c.id === cid);
          salesMap[cid] = { id: cid, title: item.item_title || cls?.title || "Unknown", count: 0, revenue: 0 };
        }
        salesMap[cid].count += item.qty;
        salesMap[cid].revenue += item.price * item.qty;
      });
    });
    return Object.values(salesMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filteredOrders, classes]);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Card title="Kelas Terlaris" icon={<Trophy className="w-4 h-4" />} noPadding>
      {topClasses.length === 0 ? (
        <p className="p-5 text-[12px] text-slate-600 text-center">Belum ada data penjualan.</p>
      ) : (
        <div>
          {topClasses.map((c, i) => (
            <div key={c.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.015] transition-colors ${i !== topClasses.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
              <span className="text-base w-6 text-center">{medals[i] ?? <span className="text-[11px] font-mono text-slate-600">#{i + 1}</span>}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-slate-200 truncate">{c.title}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{c.count} terjual</p>
              </div>
              <span className="text-[13px] font-mono font-semibold text-emerald-400">{rupiah(c.revenue)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ================================================================
 * SECTION 8: BUSINESS METRICS
 * ==============================================================*/

function BusinessMetrics({ filteredOrders }: { filteredOrders: AdminOrder[] }) {
  const { approvalRate, aov } = useMemo(() => {
    if (!filteredOrders.length) return { approvalRate: 0, aov: 0 };
    const approved = filteredOrders.filter((o) => o.status === "approved");
    const rate = Math.round((approved.length / filteredOrders.length) * 100);
    const totalRev = approved.reduce((acc, o) => acc + o.total, 0);
    const avg = approved.length > 0 ? totalRev / approved.length : 0;
    return { approvalRate: rate, aov: avg };
  }, [filteredOrders]);

  const metrics = [
    { label: "Avg Order Value", value: rupiah(aov), icon: <DollarSign className="w-3.5 h-3.5 text-emerald-400" />, color: "bg-emerald-500/[0.06] border-emerald-500/10" },
    { label: "Approval Rate", value: `${approvalRate}%`, icon: <CheckCircle className="w-3.5 h-3.5 text-blue-400" />, color: "bg-blue-500/[0.06] border-blue-500/10" },
  ];

  return (
    <Card title="Business Metrics" icon={<TrendingUp className="w-4 h-4" />}>
      <div className="space-y-2.5">
        {metrics.map((m) => (
          <div key={m.label} className={`flex items-center justify-between p-3 rounded-xl border ${m.color}`}>
            <div className="flex items-center gap-2.5">
              {m.icon}
              <span className="text-[11px] text-slate-400">{m.label}</span>
            </div>
            <span className="text-[14px] font-bold text-white font-mono">{m.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ================================================================
 * SECTION 9: CONTENT STATS
 * ==============================================================*/

function ContentStats({ stats }: { stats: CMSStats }) {
  const items = [
    { label: "Kurikulum", value: stats.totalCurr, sub: `${stats.totalCurr} mata kuliah`, color: "bg-cyan-500" },
    { label: "Kelas", value: stats.totalClasses, sub: `${stats.visibleClasses} publik • ${stats.totalClasses - stats.visibleClasses} draft`, color: "bg-blue-500" },
    { label: "Mentor", value: stats.totalMentors, sub: `${stats.visibleMentors} publik`, color: "bg-violet-500" },
    { label: "Testimoni", value: stats.totalT, sub: `${stats.visibleT} publik • ${stats.hiddenT} draft`, color: "bg-amber-500" },
  ];
  const max = Math.max(...items.map((it) => it.value), 1);

  return (
    <Card title="Konten Platform" icon={<BookOpen className="w-4 h-4" />}>
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-slate-400">{it.label}</span>
              <span className="text-[13px] font-bold text-white font-mono">{it.value}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden">
              <div className={`h-full rounded-full ${it.color}/60 transition-all duration-700`}
                style={{ width: `${Math.max(4, (it.value / max) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-slate-600">{it.sub}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ================================================================
 * SECTION 10: USER DISTRIBUTION
 * ==============================================================*/

function UserDistribution({ stats }: { stats: CMSStats }) {
  const roles = [
    { label: "Peserta", count: stats.peserta, dot: "bg-cyan-400" },
    { label: "Mentor", count: stats.mentor, dot: "bg-violet-400" },
    { label: "Admin", count: stats.admin, dot: "bg-amber-400" },
    { label: "Superadmin", count: stats.superadmin, dot: "bg-rose-400" },
  ];
  const total = stats.totalUsers || 1;

  return (
    <Card title="Distribusi User" icon={<Users className="w-4 h-4" />}>
      {/* Stacked bar */}
      <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-slate-800/80 mb-5">
        {roles.map((r) => (
          <div key={r.label} className={`${r.dot} transition-all duration-700`}
            style={{ width: `${Math.max(r.count > 0 ? 2 : 0, (r.count / total) * 100)}%` }} />
        ))}
      </div>

      <div className="space-y-2.5">
        {roles.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full ${r.dot}`} />
              <span className="text-[12px] text-slate-400">{r.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-white font-mono">{r.count}</span>
              <span className="text-[10px] text-slate-600 font-mono w-9 text-right">{Math.round((r.count / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <UserPlus className="w-3 h-3" /> Baru 30 hari
        </span>
        <span className="text-[13px] font-mono font-bold text-emerald-400">+{stats.newUsers30d}</span>
      </div>
    </Card>
  );
}

/* ================================================================
 * SECTION 11: ACTIVITY FEED
 * ==============================================================*/

function ActivityFeed({ orders }: { orders: AdminOrder[] | null }) {
  const activities = useMemo(() => {
    if (!orders) return [];
    type Log = { id: string; title: string; subtitle: string; time: Date; icon: React.ReactNode; color: string };
    const list: Log[] = [];
    orders.slice(0, 15).forEach((o) => {
      const dc = parseDate(o.created_at);
      if (!dc) return;
      list.push({
        id: `new-${o.id}`,
        title: "Order Masuk",
        subtitle: `${o.user_name || o.sender_name || "User"} — ${rupiah(o.total)}`,
        time: dc,
        icon: <ShoppingCart className="h-3 w-3" />,
        color: "text-blue-400 bg-blue-500/10 ring-blue-500/20",
      });
      if (o.status === "approved") {
        list.push({
          id: `app-${o.id}`,
          title: "Pembayaran Diterima",
          subtitle: `Order #${o.id.slice(0, 6)} disetujui`,
          time: new Date(dc.getTime() + 1000 * 60 * 30),
          icon: <CheckCircle className="h-3 w-3" />,
          color: "text-emerald-400 bg-emerald-500/10 ring-emerald-500/20",
        });
      }
    });
    return list.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 8);
  }, [orders]);

  return (
    <Card title="Aktivitas Terbaru" icon={<Zap className="w-4 h-4" />} noPadding>
      {activities.length === 0 ? (
        <p className="p-5 text-[12px] text-slate-600 text-center">Belum ada aktivitas.</p>
      ) : (
        <div className="max-h-[380px] overflow-y-auto">
          {activities.map((act, i) => (
            <div key={act.id} className={`flex items-start gap-3 px-5 py-3 hover:bg-white/[0.015] transition-colors ${i !== activities.length - 1 ? "border-b border-white/[0.03]" : ""}`}>
              <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1 ${act.color}`}>
                {act.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-slate-300">{act.title}</p>
                <p className="text-[10px] text-slate-600 mt-0.5 truncate">{act.subtitle}</p>
              </div>
              <span className="text-[10px] text-slate-700 whitespace-nowrap shrink-0">{timeAgo(act.time)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ================================================================
 * SECTION 12: QUICK LINKS
 * ==============================================================*/

function QuickLinks() {
  const links = [
    { href: "/cms/orders", label: "Review Orders", icon: <ShoppingCart className="w-4 h-4" />, color: "text-amber-400 group-hover:text-amber-300" },
    { href: "/cms/classes", label: "Kelola Kelas", icon: <GraduationCap className="w-4 h-4" />, color: "text-cyan-400 group-hover:text-cyan-300" },
    { href: "/cms/enrollments", label: "Atur Enrollment", icon: <UserCheck className="w-4 h-4" />, color: "text-emerald-400 group-hover:text-emerald-300" },
    { href: "/cms/materials", label: "Upload Materi", icon: <FileVideo className="w-4 h-4" />, color: "text-blue-400 group-hover:text-blue-300" },
    { href: "/cms/testimonials", label: "Testimoni", icon: <MessageSquare className="w-4 h-4" />, color: "text-violet-400 group-hover:text-violet-300" },
    { href: "/cms/shortlinks", label: "Shortlinks", icon: <Link2 className="w-4 h-4" />, color: "text-pink-400 group-hover:text-pink-300" },
  ];

  return (
    <Card title="Akses Cepat" icon={<Zap className="w-4 h-4" />}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200">
            <span className={`transition-all duration-200 ${l.color}`}>{l.icon}</span>
            <span className="text-[11px] text-slate-500 group-hover:text-slate-300 transition-colors text-center leading-tight">{l.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

/* ================================================================
 * MAIN PAGE
 * ==============================================================*/

export default function CMSOverviewPage() {
  const { me, stats, orders, classes, loading, err, lastLoadedAt, reload } = useCMSOverview();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredOrders = useMemo(() => filterByDate(orders ?? [], startDate, endDate), [orders, startDate, endDate]);

  const pendingLatest = useMemo(() =>
    (orders ?? []).filter((o) => o.status === "pending")
      .sort((a, b) => (parseDate(b.created_at)?.getTime() || 0) - (parseDate(a.created_at)?.getTime() || 0))
      .slice(0, 5),
    [orders]
  );

  if (loading && !stats) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-7 h-7 text-cyan-500 animate-spin" />
        <p className="text-[12px] text-slate-600 animate-pulse">Memuat dashboard...</p>
      </div>
    );
  }

  if (!stats) return <div className="text-center p-10 text-rose-400">Gagal memuat data statistik.</div>;

  return (
    <div className="space-y-6 pb-12">
      {/* Header + Filter */}
      <Header me={me} err={err} onReload={reload}
        startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />

      {/* KPI Cards */}
      <KpiRow stats={stats} loading={loading} filteredOrders={filteredOrders} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BarChartSection title="Revenue Trend" icon={<TrendingUp className="w-4 h-4" />}
          series={stats.revSeries} formatValue={(v) => rupiah(v)}
          barColorFrom="from-cyan-900/40" barColorTo="to-cyan-500/40" hoverFrom="from-cyan-600" hoverTo="to-cyan-400" />
        <BarChartSection title="Order Volume" icon={<ShoppingCart className="w-4 h-4" />}
          series={stats.orderSeries} formatValue={(v) => `${v} orders`}
          barColorFrom="from-blue-900/40" barColorTo="to-blue-500/40" hoverFrom="from-blue-600" hoverTo="to-blue-400" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 space-y-5">
          <PendingOrders pendingLatest={pendingLatest} totalPending={stats.pendingOrders} />
          <TopClasses filteredOrders={filteredOrders} classes={classes} />
        </div>
        <div className="space-y-5">
          <OrderStatusBreakdown filteredOrders={filteredOrders} />
          <RevenueBreakdown filteredOrders={filteredOrders} />
          <BusinessMetrics filteredOrders={filteredOrders} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <ContentStats stats={stats} />
        <UserDistribution stats={stats} />
        <ActivityFeed orders={orders} />
      </div>

      {/* Quick Links */}
      <QuickLinks />
    </div>
  );
}