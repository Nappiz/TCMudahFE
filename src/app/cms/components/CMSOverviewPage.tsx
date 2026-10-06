"use client";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import type {
  CMSStats,
  DashboardPeriod,
  DashboardTopClass,
} from "@/hooks/useCMSOverview";
import { parseDate, useCMSOverview } from "@/hooks/useCMSOverview";
import { useNotifications } from "@/hooks/useNotifications";
import type { AdminOrder, OrderStatus } from "@/types/catalog";
import { rupiah } from "../../../../lib/format";

const focusStyle =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#11151d]";
const number = (value: number) => value.toLocaleString("id-ID");
const compactNumber = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const orderStatuses: Record<OrderStatus, { label: string; color: string }> = {
  approved: { label: "Disetujui", color: "bg-cyan-400" },
  pending: { label: "Menunggu", color: "bg-amber-400" },
  rejected: { label: "Ditolak", color: "bg-rose-400" },
  expired: { label: "Kedaluwarsa", color: "bg-slate-500" },
};

function orderTime(value?: string) {
  const date = parseDate(value);
  return date
    ? date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    : "—";
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-white/[0.08] bg-[#11151d]">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SectionLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded text-xs font-medium text-slate-400 transition-colors hover:text-cyan-300 ${focusStyle}`}
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="px-6 py-12 text-center text-sm text-slate-400">{children}</p>
  );
}

function Metrics({
  stats,
  period,
  filtered,
  loading,
}: {
  stats: CMSStats;
  period: DashboardPeriod;
  filtered: boolean;
  loading: boolean;
}) {
  const metrics = [
    {
      label: "Pendapatan",
      value: rupiah(period.revenueApproved),
      mobileValue: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(period.revenueApproved),
      hint: filtered ? "Disetujui · periode pilihan" : "Dari pesanan disetujui",
      icon: <ArrowUpRight className="h-4 w-4" />,
    },
    {
      label: "Total pesanan",
      value: number(period.totalOrders),
      hint: filtered ? "Periode pilihan" : "Semua waktu",
      icon: <ShoppingBag className="h-4 w-4" />,
    },
    {
      label: "Peserta aktif",
      value: number(stats.participantsActive),
      hint: "Disetujui · semua waktu",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Total kelas",
      value: number(stats.totalClasses),
      hint: `${number(stats.visibleClasses)} dipublikasikan · semua waktu`,
      icon: <GraduationCap className="h-4 w-4" />,
    },
  ];

  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-white/[0.08] bg-[#11151d] xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className={`min-w-0 px-4 py-5 sm:px-6 sm:py-6 ${index > 1 ? "border-t border-white/[0.08] xl:border-t-0" : ""} ${index % 2 === 1 ? "border-l border-white/[0.08]" : ""} ${index === 2 ? "xl:border-l" : ""}`}
        >
          <dt className="flex items-center justify-between gap-3 text-xs font-medium text-slate-400">
            {metric.label}
            <span className="text-slate-500" aria-hidden="true">
              {metric.icon}
            </span>
          </dt>
          <dd className="mt-3 break-words text-[22px] font-semibold leading-tight tracking-tight text-slate-50 tabular-nums sm:text-[28px]">
            {loading ? (
              <span className="text-slate-500">…</span>
            ) : metric.mobileValue ? (
              <>
                <span
                  className="sm:hidden"
                  title={metric.value}
                  aria-hidden="true"
                >
                  {metric.mobileValue}
                </span>
                <span className="hidden sm:inline">{metric.value}</span>
                <span className="sr-only sm:hidden">{metric.value}</span>
              </>
            ) : (
              metric.value
            )}
          </dd>
          <dd className="mt-2 text-xs leading-relaxed text-slate-400">
            {metric.hint}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TrendChart({ stats }: { stats: CMSStats }) {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const series = metric === "revenue" ? stats.revSeries : stats.orderSeries;
  const formatValue = (value: number) =>
    metric === "revenue" ? rupiah(value) : `${number(value)} pesanan`;
  const max = Math.max(1, ...series.map((point) => point.value));
  const total = series.reduce((sum, point) => sum + point.value, 0);

  return (
    <Panel
      title="Tren transaksi"
      description="14 hari terakhir · tidak mengikuti filter periode"
      action={
        <fieldset
          className="flex gap-1 rounded-lg bg-white/[0.04] p-1"
          aria-label="Metrik grafik"
        >
          {(["revenue", "orders"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={metric === item}
              onClick={() => setMetric(item)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${focusStyle} ${metric === item ? "bg-[#252b36] text-white" : "text-slate-400 hover:text-white"}`}
            >
              {item === "revenue" ? "Pendapatan" : "Pesanan"}
            </button>
          ))}
        </fieldset>
      }
    >
      <div className="px-5 pb-6 pt-5 sm:px-6">
        <p className="text-2xl font-semibold tracking-tight text-slate-100 tabular-nums">
          {formatValue(total)}
        </p>
        {total === 0 || series.length === 0 ? (
          <div className="flex h-52 items-center justify-center text-sm text-slate-400">
            Belum ada {metric === "revenue" ? "pendapatan" : "pesanan"} dalam 14
            hari terakhir.
          </div>
        ) : (
          <div className="mt-6 flex gap-3">
            <div className="flex h-40 shrink-0 flex-col justify-between text-[10px] text-slate-500 sm:h-44">
              <span>{compactNumber(max)}</span>
              <span>{compactNumber(max / 2)}</span>
              <span>0</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="relative h-40 sm:h-44">
                <div
                  className="pointer-events-none absolute inset-0 flex flex-col justify-between"
                  aria-hidden="true"
                >
                  <div className="border-t border-dashed border-white/[0.08]" />
                  <div className="border-t border-dashed border-white/[0.08]" />
                  <div className="border-t border-white/[0.08]" />
                </div>
                <div className="relative flex h-full items-end gap-1.5 sm:gap-2.5">
                  {series.map((point) => (
                    <div
                      key={point.key}
                      className="group relative flex h-full min-w-0 flex-1 items-end"
                    >
                      <button
                        type="button"
                        aria-label={`${point.label}: ${formatValue(point.value)}`}
                        className={`w-full rounded-t-sm bg-cyan-400/70 transition-colors hover:bg-cyan-300 focus-visible:bg-cyan-300 ${focusStyle}`}
                        style={{
                          height: `${(point.value / max) * 100}%`,
                          minHeight: point.value > 0 ? 3 : 0,
                        }}
                      >
                        <span className="sr-only">
                          {formatValue(point.value)}
                        </span>
                      </button>
                      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#252b36] px-2.5 py-2 text-xs text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                        {point.label} · {formatValue(point.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-slate-500">
                <span>{series[0]?.label}</span>
                <span>{series[Math.floor(series.length / 2)]?.label}</span>
                <span>{series[series.length - 1]?.label}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

function PendingOrders({
  orders,
  total,
}: {
  orders: AdminOrder[];
  total: number;
}) {
  return (
    <Panel
      title="Perlu ditinjau"
      description="Antrean pesanan · semua waktu"
      action={<Clock3 className="h-4 w-4 text-amber-400" aria-hidden="true" />}
    >
      <div className="px-5 pb-4 pt-4 sm:px-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-slate-100 tabular-nums">
            {number(total)}
          </span>
          <span className="text-sm text-slate-400">pesanan menunggu</span>
        </div>
        {total === 0 ? (
          <div className="flex min-h-36 flex-col items-center justify-center gap-2 py-6 text-center">
            <CheckCircle2
              className="h-6 w-6 text-cyan-400"
              aria-hidden="true"
            />
            <p className="text-sm text-slate-300">
              Semua pesanan sudah ditinjau.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <p className="py-8 text-sm text-slate-400">
            Buka halaman pesanan untuk meninjau antrean.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-white/[0.06]">
            {orders.slice(0, 3).map((order) => (
              <Link
                key={order.id}
                href="/cms/orders"
                className={`flex items-center justify-between gap-3 rounded py-3 ${focusStyle}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">
                    {order.user_name || order.sender_name || "Pengguna"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {order.user_email || `#${order.id.slice(0, 8)}`}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-slate-300 tabular-nums">
                  {rupiah(order.total || 0)}
                </p>
              </Link>
            ))}
          </div>
        )}
        <Link
          href="/cms/orders"
          className={`mt-3 flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/10 px-4 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-cyan-300 ${focusStyle}`}
        >
          {total > 0 ? "Tinjau pesanan" : "Lihat semua pesanan"}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </Panel>
  );
}

function TopClasses({ classes }: { classes: DashboardTopClass[] }) {
  return (
    <Panel
      title="Kelas terlaris"
      description="Berdasarkan pesanan disetujui · periode transaksi"
      action={<SectionLink href="/cms/classes">Kelola kelas</SectionLink>}
    >
      {classes.length === 0 ? (
        <EmptyState>Belum ada penjualan kelas pada periode ini.</EmptyState>
      ) : (
        <ol className="mt-4 divide-y divide-white/[0.06] px-5 pb-3 sm:px-6">
          {classes.slice(0, 4).map((item, index) => (
            <li key={item.id} className="flex items-center gap-3 py-3.5">
              <span className="w-5 shrink-0 text-xs text-slate-500 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium text-slate-200"
                  title={item.title}
                >
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {number(item.count)} terjual
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-300 tabular-nums">
                {rupiah(item.revenue)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

function RecentActivity({ orders }: { orders: AdminOrder[] }) {
  return (
    <Panel
      title="Pesanan terbaru"
      description="Aktivitas terakhir · semua waktu"
      action={<SectionLink href="/cms/orders">Lihat semua</SectionLink>}
    >
      {orders.length === 0 ? (
        <EmptyState>Belum ada aktivitas pesanan.</EmptyState>
      ) : (
        <ul className="mt-4 divide-y divide-white/[0.06] px-5 pb-3 sm:px-6">
          {orders.slice(0, 4).map((order) => (
            <li key={order.id} className="flex items-center gap-3 py-3.5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${orderStatuses[order.status].color}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-200">
                  {order.user_name || order.sender_name || "Pengguna"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {orderStatuses[order.status].label} ·{" "}
                  {rupiah(order.total || 0)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {orderTime(order.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Breakdown({
  rows,
  total,
}: {
  rows: { label: string; value: number; color: string; formatted?: string }[];
  total: number;
}) {
  return (
    <dl className="space-y-5 px-5 py-6 sm:px-6">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-slate-400">{row.label}</dt>
            <dd className="text-slate-200 tabular-nums">
              {row.formatted ?? number(row.value)}
            </dd>
          </div>
          <div
            className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]"
            aria-hidden="true"
          >
            <div
              className={`h-full rounded-full ${row.color}`}
              style={{
                width: `${total > 0 ? Math.min(100, (row.value / total) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      ))}
    </dl>
  );
}

function Analytics({ period }: { period: DashboardPeriod }) {
  const statuses = [
    { ...orderStatuses.approved, value: period.approvedOrders },
    { ...orderStatuses.pending, value: period.pendingOrders },
    { ...orderStatuses.rejected, value: period.rejectedOrders },
    { ...orderStatuses.expired, value: period.expiredOrders },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel
        title="Status pesanan"
        description={`${number(period.totalOrders)} pesanan pada periode transaksi`}
      >
        <Breakdown rows={statuses} total={period.totalOrders} />
      </Panel>
      <Panel
        title="Sumber pendapatan"
        description="Hanya pembayaran yang telah disetujui"
      >
        <div className="px-5 pt-5 text-2xl font-semibold text-slate-100 tabular-nums sm:px-6">
          {rupiah(period.revenueApproved)}
        </div>
        <Breakdown
          total={period.classRevenue + period.packageRevenue}
          rows={[
            {
              label: "Kelas satuan",
              value: period.classRevenue,
              formatted: rupiah(period.classRevenue),
              color: "bg-cyan-400",
            },
            {
              label: "Paket kelas",
              value: period.packageRevenue,
              formatted: rupiah(period.packageRevenue),
              color: "bg-slate-500",
            },
          ]}
        />
      </Panel>
      <Panel
        title="Kinerja transaksi"
        description="Metrik pada periode transaksi"
      >
        <dl className="divide-y divide-white/[0.06] px-5 py-2 sm:px-6">
          <div className="py-5">
            <dt className="text-xs text-slate-400">
              Rata-rata nilai pesanan disetujui
            </dt>
            <dd className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">
              {rupiah(period.aov)}
            </dd>
          </div>
          <div className="py-5">
            <dt className="text-xs text-slate-400">Tingkat persetujuan</dt>
            <dd className="mt-2 text-2xl font-semibold text-slate-100 tabular-nums">
              {period.approvalRate}%
            </dd>
            <dd className="mt-2 text-xs text-slate-400">
              {number(period.approvedOrders)} dari {number(period.totalOrders)}{" "}
              pesanan
            </dd>
          </div>
        </dl>
      </Panel>
    </div>
  );
}

function Platform({ stats }: { stats: CMSStats }) {
  const content = [
    {
      label: "Kelas",
      value: stats.totalClasses,
      hint: `${number(stats.visibleClasses)} dipublikasikan`,
      href: "/cms/classes",
    },
    {
      label: "Kurikulum",
      value: stats.totalCurr,
      hint: "Materi kurikulum tersedia",
      href: "/cms/curriculum",
    },
    {
      label: "Mentor",
      value: stats.totalMentors,
      hint: `${number(stats.visibleMentors)} ditampilkan`,
      href: "/cms/mentors",
    },
    {
      label: "Testimoni",
      value: stats.totalT,
      hint: `${number(stats.visibleT)} ditampilkan · ${number(stats.hiddenT)} disembunyikan`,
      href: "/cms/testimonials",
    },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel
        title="Pengguna"
        description={`+${number(stats.newUsers30d)} pengguna baru dalam 30 hari`}
        action={
          <SectionLink href="/cms/user-role">Kelola pengguna</SectionLink>
        }
      >
        <div className="px-5 pt-5 sm:px-6">
          <p className="text-3xl font-semibold text-slate-100 tabular-nums">
            {number(stats.totalUsers)}{" "}
            <span className="text-sm font-normal text-slate-400">
              total pengguna
            </span>
          </p>
        </div>
        <Breakdown
          total={stats.totalUsers}
          rows={[
            { label: "Peserta", value: stats.peserta, color: "bg-cyan-400" },
            { label: "Mentor", value: stats.mentor, color: "bg-slate-400" },
            { label: "Admin", value: stats.admin, color: "bg-slate-500" },
            {
              label: "Superadmin",
              value: stats.superadmin,
              color: "bg-slate-600",
            },
          ]}
        />
      </Panel>
      <Panel
        title="Konten & pembelajaran"
        description="Inventaris platform · semua waktu"
      >
        <div className="mt-3 divide-y divide-white/[0.06] px-5 sm:px-6">
          {content.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 rounded py-4 ${focusStyle}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-300">
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
              </div>
              <span className="text-lg font-semibold text-slate-200 tabular-nums">
                {number(item.value)}
              </span>
              <ArrowUpRight
                className="h-4 w-4 text-slate-500 group-hover:text-cyan-300"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
        <p className="border-t border-white/[0.06] px-5 py-4 text-xs text-slate-400 sm:px-6">
          Rata-rata{" "}
          {stats.classPerMentor.toLocaleString("id-ID", {
            maximumFractionDigits: 1,
          })}{" "}
          kelas per mentor
        </p>
      </Panel>
      <nav
        className="flex flex-wrap items-center gap-x-6 gap-y-4 px-1 lg:col-span-2"
        aria-label="Pengelolaan platform lainnya"
      >
        <SectionLink href="/cms/materials">Materi video</SectionLink>
        <SectionLink href="/cms/enrollments">Enrollments</SectionLink>
        <SectionLink href="/cms/feedback">Feedback</SectionLink>
        <SectionLink href="/cms/shortlinks">Shortlinks</SectionLink>
      </nav>
    </div>
  );
}

export default function CMSOverviewPage() {
  const [view, setView] = useState<"summary" | "analytics" | "platform">(
    "summary",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const {
    me,
    stats,
    period,
    pendingLatest,
    recentOrders,
    loading,
    err,
    reload,
  } = useCMSOverview(startDate, endDate);
  const { data: notifications } = useNotifications();
  const filtered = Boolean(startDate || endDate);
  const dateLabel = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const periodLabel = filtered
    ? `${startDate ? dateLabel(startDate) : "Awal"} – ${endDate ? dateLabel(endDate) : "Sekarang"}`
    : "Semua waktu";

  if (!stats || !period) {
    return (
      <div
        className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center"
        aria-live="polite"
      >
        {loading ? (
          <>
            <Loader2
              className="h-6 w-6 animate-spin text-cyan-400"
              aria-hidden="true"
            />
            <p className="text-sm text-slate-400">Memuat overview…</p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-slate-100">
              Overview belum bisa dimuat
            </h1>
            <p className="max-w-md text-sm text-slate-400">
              {err || "Silakan coba muat ulang data."}
            </p>
            <button
              type="button"
              onClick={() => void reload()}
              className={`rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5 ${focusStyle}`}
            >
              Coba lagi
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 sm:space-y-7">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-[28px]">
            Overview
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Halo, {me?.full_name?.split(" ")[0] || "Admin"}. Berikut ringkasan
            aktivitas TC Mudah.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {view !== "platform" && (
            <details className="group relative">
              <summary
                className={`flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-white/10 bg-[#11151d] px-3 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 [&::-webkit-details-marker]:hidden ${focusStyle}`}
              >
                <CalendarDays
                  className="h-4 w-4 text-slate-500"
                  aria-hidden="true"
                />
                {periodLabel}
                <ChevronDown
                  className="h-3.5 w-3.5 text-slate-500 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="absolute left-0 top-full z-30 mt-2 w-[min(320px,calc(100vw-32px))] rounded-xl border border-white/10 bg-[#171c26] p-4 shadow-xl sm:left-auto sm:right-0">
                <p className="text-sm font-medium text-slate-200">
                  Periode transaksi
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  Filter pendapatan, pesanan, dan kelas terlaris.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <label className="min-w-0 text-xs text-slate-400">
                    Dari tanggal
                    <input
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(event) => setStartDate(event.target.value)}
                      className={`mt-2 h-10 w-full min-w-0 rounded-md border border-white/10 bg-[#11151d] px-2 text-xs text-slate-200 [color-scheme:dark] ${focusStyle}`}
                    />
                  </label>
                  <label className="min-w-0 text-xs text-slate-400">
                    Sampai tanggal
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(event) => setEndDate(event.target.value)}
                      className={`mt-2 h-10 w-full min-w-0 rounded-md border border-white/10 bg-[#11151d] px-2 text-xs text-slate-200 [color-scheme:dark] ${focusStyle}`}
                    />
                  </label>
                </div>
                {filtered && (
                  <button
                    type="button"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className={`mt-4 rounded text-xs font-medium text-cyan-300 ${focusStyle}`}
                  >
                    Reset ke semua waktu
                  </button>
                )}
              </div>
            </details>
          )}
          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading}
            aria-label="Muat ulang overview"
            className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 ${focusStyle}`}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08]">
        <nav className="flex gap-5 sm:gap-7" aria-label="Tampilan overview">
          {(
            [
              { key: "summary", label: "Ringkasan" },
              { key: "analytics", label: "Analitik" },
              { key: "platform", label: "Platform" },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={view === item.key}
              onClick={() => setView(item.key)}
              className={`-mb-px border-b-2 pb-3 pt-1 text-sm font-medium transition-colors ${focusStyle} ${view === item.key ? "border-cyan-400 text-cyan-300" : "border-transparent text-slate-400 hover:text-slate-200"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {(notifications.new_users > 0 || notifications.new_feedbacks > 0) && (
          <div className="flex flex-wrap gap-4 pb-3 text-xs text-slate-400">
            {notifications.new_users > 0 && (
              <SectionLink href="/cms/user-role">
                {number(notifications.new_users)} pengguna baru
              </SectionLink>
            )}
            {notifications.new_feedbacks > 0 && (
              <SectionLink href="/cms/feedback">
                {number(notifications.new_feedbacks)} feedback baru
              </SectionLink>
            )}
          </div>
        )}
      </div>

      {err && (
        <p
          role="alert"
          className="rounded-lg border border-rose-400/20 bg-rose-400/5 px-4 py-3 text-sm text-rose-300"
        >
          Data belum berhasil diperbarui. {err}
        </p>
      )}

      <div aria-busy={loading} className="space-y-5">
        {view !== "platform" && (
          <Metrics
            stats={stats}
            period={period}
            filtered={filtered}
            loading={loading}
          />
        )}
        {view === "summary" && (
          <>
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
              <TrendChart stats={stats} />
              <div className="order-first xl:order-last">
                <PendingOrders
                  orders={pendingLatest}
                  total={stats.pendingOrders}
                />
              </div>
            </div>
            <div className="grid items-start gap-5 lg:grid-cols-2">
              <TopClasses classes={period.topClasses} />
              <RecentActivity orders={recentOrders} />
            </div>
          </>
        )}
        {view === "analytics" && <Analytics period={period} />}
        {view === "platform" && <Platform stats={stats} />}
      </div>
    </div>
  );
}
