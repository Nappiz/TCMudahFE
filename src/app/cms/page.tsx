"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { rupiah } from "../../../lib/format";
import {
  Users,
  Shield,
  GraduationCap,
  BookOpenText,
  MessageSquare,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck,
  RefreshCw,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  LineChart,
} from "lucide-react";

/* =========================
 * Types
 * ========================= */
type Role = "superadmin" | "admin" | "mentor" | "peserta";
type Me = { id: string; email: string; full_name: string; role: Role };

type User = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at?: string;
};

type Curriculum = { id: string };
type Testimonial = { id: string; visible: boolean };
type Mentor = { id: string; visible: boolean };
type ClassRow = { id: string; visible: boolean };

type OrderStatus = "pending" | "approved" | "rejected" | "expired";
type AdminOrder = {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  created_at?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

/* =========================
 * Helpers
 * ========================= */
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j?.detail) msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

function parseDate(d?: string) {
  if (!d) return null;
  const t = new Date(d);
  return isNaN(t.getTime()) ? null : t;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function isWithinDays(dateStr?: string, days = 30) {
  const t = parseDate(dateStr);
  if (!t) return false;
  return t >= daysAgo(days);
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildDailyBuckets(days: number) {
  const arr: { key: string; label: string; date: Date; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10);
    arr.push({ key, label: formatShortDate(d), date: d, value: 0 });
  }
  return arr;
}

/* =========================
 * Page
 * ========================= */
export default function CMSHomePage() {
  const [me, setMe] = useState<Me | null>(null);

  const [users, setUsers] = useState<User[] | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum[] | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [classes, setClasses] = useState<ClassRow[] | null>(null);
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      // siapa saya
      const m = await api<Me>("/me");
      setMe(m);

      // paralel semua kebutuhan statistik
      const pUsers = api<User[]>("/admin/users");                 // mentor/admin/superadmin
      const pCurr  = api<Curriculum[]>("/curriculum");            // publik
      const pTest  = api<Testimonial[]>("/admin/testimonials");   // mentor/admin/superadmin
      const pMent  = api<Mentor[]>("/admin/mentors");             // mentor/admin/superadmin
      const pClass = api<ClassRow[]>("/admin/classes");           // mentor/admin/superadmin
      const pOrder = api<AdminOrder[]>("/admin/orders");          // admin/superadmin (akan gagal utk mentor)

      const [u, c, t, mn, cl, od] = await Promise.allSettled([pUsers, pCurr, pTest, pMent, pClass, pOrder]);

      setUsers(u.status === "fulfilled" ? u.value : []);
      setCurriculum(c.status === "fulfilled" ? c.value : []);
      setTestimonials(t.status === "fulfilled" ? t.value : []);
      setMentors(mn.status === "fulfilled" ? mn.value : []);
      setClasses(cl.status === "fulfilled" ? cl.value : []);
      setOrders(od.status === "fulfilled" ? od.value : []); // jika mentor, kosong (tidak punya akses)
    } catch (e: any) {
      setErr(e?.message ?? "Gagal memuat CMS.");
      setUsers([]); setCurriculum([]); setTestimonials([]); setMentors([]); setClasses([]); setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  /* =========================
   * Derived Stats
   * ========================= */
  const stats = useMemo(() => {
    // Users
    const totalUsers = users?.length ?? 0;
    const countByRole = {
      superadmin: users?.filter((x) => x.role === "superadmin").length ?? 0,
      admin: users?.filter((x) => x.role === "admin").length ?? 0,
      mentor: users?.filter((x) => x.role === "mentor").length ?? 0,
      peserta: users?.filter((x) => x.role === "peserta").length ?? 0,
    };
    // perkiraan user baru 30 hari (jika ada created_at)
    const newUsers30d =
      users?.filter((u) => isWithinDays(u.created_at, 30)).length ?? 0;

    // Curriculum
    const totalCurr = curriculum?.length ?? 0;

    // Testimonials
    const totalT = testimonials?.length ?? 0;
    const visibleT = testimonials?.filter((x) => x.visible).length ?? 0;
    const hiddenT = totalT - visibleT;

    // Mentors
    const totalMentors = mentors?.length ?? 0;
    const visibleMentors = mentors?.filter((x) => x.visible).length ?? 0;

    // Classes
    const totalClasses = classes?.length ?? 0;
    const visibleClasses = classes?.filter((c) => c.visible).length ?? 0;

    // Mentor load (avg kelas/mentor) — indikatif saja
    const classPerMentor = totalMentors ? (totalClasses / totalMentors) : 0;

    // Orders (jika tidak punya akses => 0 semua)
    const ord = orders ?? [];
    const totalOrders = ord.length;
    const pendingOrders = ord.filter((o) => o.status === "pending").length;
    const approvedOrders = ord.filter((o) => o.status === "approved").length;
    const rejectedOrders = ord.filter((o) => o.status === "rejected").length;
    const expiredOrders = ord.filter((o) => o.status === "expired").length;

    const revenueApproved = ord
      .filter((o) => o.status === "approved")
      .reduce((s, o) => s + (o.total || 0), 0);

    const participantsActive = (() => {
      const set = new Set<string>();
      ord.forEach((o) => {
        if (o.status === "approved" && o.user_id) set.add(o.user_id);
      });
      return set.size;
    })();

    // AOV & approval rate
    const aov = approvedOrders ? revenueApproved / approvedOrders : 0;
    const approvalRate = totalOrders ? Math.round((approvedOrders / totalOrders) * 100) : 0;

    // Revenue 30 hari
    const revenue30d = ord
      .filter((o) => o.status === "approved" && isWithinDays(o.created_at, 30))
      .reduce((s, o) => s + (o.total || 0), 0);

    // Tren 14 hari terakhir
    const days = 14;
    const orderSeries = buildDailyBuckets(days);
    const revSeries = buildDailyBuckets(days);

    ord.forEach((o) => {
      const t = parseDate(o.created_at);
      if (!t) return;
      const key = t.toISOString().slice(0, 10);
      const os = orderSeries.find((d) => d.key === key);
      if (os) os.value += 1;
      const rs = revSeries.find((d) => d.key === key);
      if (rs && o.status === "approved") rs.value += o.total || 0;
    });

    return {
      totalUsers,
      newUsers30d,
      ...countByRole,
      totalCurr,
      totalT,
      visibleT,
      hiddenT,
      totalMentors,
      visibleMentors,
      totalClasses,
      visibleClasses,
      classPerMentor,
      totalOrders,
      pendingOrders,
      approvedOrders,
      rejectedOrders,
      expiredOrders,
      revenueApproved,
      revenue30d,
      participantsActive,
      aov,
      approvalRate,
      orderSeries,
      revSeries,
    };
  }, [users, curriculum, testimonials, mentors, classes, orders]);

  /* =========================
   * UI
   * ========================= */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs text-white/60">Selamat datang kembali 👋</div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {me?.full_name ?? "Pengguna"} <span className="text-white/60">— CMS Overview</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={loadAll}
              className="inline-flex items-center gap-2"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
              Muat Ulang
            </Button>
            <Link href="/cms/user-role">
              <Button variant="secondary" className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Kelola
              </Button>
            </Link>
          </div>
        </div>
        {err && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
            {err}
          </div>
        )}
      </div>

      {/* KPI utama */}
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
          hint={`${stats.visibleMentors} tampil • rata-rata ${stats.classPerMentor.toFixed(1)} kelas/mentor`}
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

      {/* KPI konten & peserta */}
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

      {/* Orders & Revenue */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Ringkasan Orders" right={
          <Link href="/cms/orders">
            <Button variant="ghost" className="text-sm">Lihat Semua</Button>
          </Link>
        }>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatRow icon={<Receipt className="h-4 w-4" />} label="Total Orders" value={loading ? "…" : stats.totalOrders} />
            <StatRow icon={<CheckCircle2 className="h-4 w-4" />} label="Approved" value={loading ? "…" : stats.approvedOrders} />
            <StatRow icon={<Clock className="h-4 w-4" />} label="Pending" value={loading ? "…" : stats.pendingOrders} />
            <StatRow icon={<XCircle className="h-4 w-4" />} label="Rejected" value={loading ? "…" : stats.rejectedOrders} />
            <StatRow icon={<EyeOff className="h-4 w-4" />} label="Expired" value={loading ? "…" : stats.expiredOrders} />
            <StatRow icon={<LineChart className="h-4 w-4" />} label="Approval Rate" value={loading ? "…" : `${stats.approvalRate}%`} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <KPIBlock label="Pemasukan (Approved - All time)" value={loading ? "…" : rupiah(stats.revenueApproved)} />
            <KPIBlock label="Average Order Value (Approved)" value={loading ? "…" : rupiah(stats.aov)} />
          </div>
          <div className="mt-4">
            <KPIBlock label="Revenue 30 hari terakhir" value={loading ? "…" : rupiah(stats.revenue30d)} />
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

      {/* Pending terbaru */}
      <Panel title="Pending Orders Terbaru">
        <PendingTable orders={(orders ?? [])
          .filter((o) => o.status === "pending")
          .sort((a, b) => (parseDate(b.created_at)?.getTime() || 0) - (parseDate(a.created_at)?.getTime() || 0))
          .slice(0, 8)}
        />
      </Panel>

      {/* Navigasi cepat & status ringkas */}
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
          ]}
        />
        <QuickPanel
          title="Status Ringkas"
          custom={
            <ul className="space-y-2 text-sm text-white/70">
              <li>• Role aktif: <span className="text-white">{me?.role ?? "-"}</span></li>
              <li>
                • Testimoni: <span className="text-white">{stats.visibleT}</span> tampil,{" "}
                <span className="text-white">{stats.hiddenT}</span> disembunyikan
              </li>
              <li>
                • Mentor tampil: <span className="text-white">{stats.visibleMentors}</span> /{" "}
                <span className="text-white">{stats.totalMentors}</span>
              </li>
              <li>
                • Kelas tampil: <span className="text-white">{stats.visibleClasses}</span> /{" "}
                <span className="text-white">{stats.totalClasses}</span>
              </li>
              <li>
                • Orders: pending <span className="text-white">{stats.pendingOrders}</span>, approved{" "}
                <span className="text-white">{stats.approvedOrders}</span>, rejected{" "}
                <span className="text-white">{stats.rejectedOrders}</span>, expired{" "}
                <span className="text-white">{stats.expiredOrders}</span>
              </li>
              <li>
                • Pemasukan (approved): <span className="text-white">{rupiah(stats.revenueApproved)}</span>
              </li>
              <li>
                • AOV (approved): <span className="text-white">{rupiah(stats.aov)}</span>
              </li>
              <li>
                • Approval rate: <span className="text-white">{stats.approvalRate}%</span>
              </li>
              <li>
                • Peserta aktif: <span className="text-white">{stats.participantsActive}</span>
              </li>
            </ul>
          }
        />
      </div>
    </div>
  );
}

/* =========================
 * Small UI Components
 * ========================= */

function Panel({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-white">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function StatCard(props: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.06]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
            {props.icon} <span>{props.title}</span>
          </div>
          <span className="text-2xl font-bold text-white">{props.value}</span>
        </div>
        {props.hint ? <div className="mt-2 text-xs text-white/60">{props.hint}</div> : null}
      </div>
    </div>
  );

  return props.href ? (
    <Link href={props.href} className="block">{content}</Link>
  ) : (
    content
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="inline-flex items-center gap-2 text-xs text-white/70">
        {icon} <span>{label}</span>
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function KPIBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function MiniBars({
  title,
  series,
  formatValue,
}: {
  title: string;
  series: { key: string; label: string; value: number }[];
  formatValue: (v: number) => string;
}) {
  const max = Math.max(1, ...series.map((d) => d.value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-medium text-white/80">{title}</div>
        <div className="text-[11px] text-white/50">{series[0]?.label} – {series[series.length - 1]?.label}</div>
      </div>
      <div className="flex items-end gap-1 rounded-xl border border-white/10 bg-white/5 p-2">
        {series.map((d) => {
          const h = (d.value / max) * 96; // px
          return (
            <div key={d.key} className="group relative flex-1">
              <div className="mx-auto w-2 rounded-md bg-white/20" style={{ height: Math.max(2, h) }} />
              <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                {d.label}: {formatValue(d.value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PendingTable({ orders }: { orders: AdminOrder[] }) {
  if (!orders.length) {
    return <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">Tidak ada order pending.</div>;
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="min-w-full border-collapse bg-white/5">
        <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-white/60">
          <tr>
            <th className="px-3 py-2 text-left">Waktu</th>
            <th className="px-3 py-2 text-left">Order ID</th>
            <th className="px-3 py-2 text-left">User</th>
            <th className="px-3 py-2 text-left">Total</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody className="text-sm text-white/80">
          {orders.map((o) => {
            const t = parseDate(o.created_at);
            const time = t ? t.toLocaleString() : "-";
            return (
              <tr key={o.id} className="border-t border-white/10">
                <td className="px-3 py-2">{time}</td>
                <td className="px-3 py-2 font-mono text-white">{o.id.slice(0, 8)}…</td>
                <td className="px-3 py-2">{o.user_id ? o.user_id.slice(0, 8) + "…" : "-"}</td>
                <td className="px-3 py-2">{rupiah(o.total || 0)}</td>
                <td className="px-3 py-2">
                  <span className="rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-xs capitalize">
                    {o.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href="/cms/orders" className="text-xs text-cyan-300 hover:underline">Kelola</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QuickPanel({
  title,
  items,
  custom,
}: {
  title: string;
  items?: { label: string; href: string }[];
  custom?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 text-sm font-semibold text-white">{title}</div>
      {items ? (
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/90 hover:bg-white/15"
            >
              {it.label}
            </Link>
          ))}
        </div>
      ) : null}
      {custom}
    </div>
  );
}
