import Link from "next/link";
import { rupiah } from "../../../../../lib/format";
import type { DailyPoint } from "@/hooks/useCMSOverview";
import type { AdminOrder, OrderStatus } from "@/types/catalog";
import { parseDate } from "@/hooks/useCMSOverview";
import { ArrowUpRight, TrendingUp, Calendar, Clock, Activity } from "lucide-react";

export function StatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 group px-5 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-cyan-500/20 transition-colors ring-1 ring-white/5">
          {icon}
        </div>
        <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white font-mono">{value}</span>
    </div>
  );
}

/* =========================================================
 * Primitives
 * =======================================================*/

export function GlassCard({
  title,
  right,
  children,
  className = "",
  noPadding = false,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0F1218]/60 shadow-xl backdrop-blur-md ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
      
      {(title || right) && (
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          {title && <h3 className="text-sm font-semibold tracking-wide text-slate-200">{title}</h3>}
          {right}
        </div>
      )}
      <div className={`relative z-10 flex-1 ${noPadding ? "" : "p-5"}`}>{children}</div>
    </div>
  );
}

export function StatCard(props: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  hint?: string;
  href?: string;
  trend?: string;
  trendUp?: boolean;
}) {
  const content = (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#0F1218]/80 p-5 transition-all hover:bg-[#1A1D24] hover:border-white/10">
      <div className="absolute top-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
        <ArrowUpRight className="h-4 w-4 text-slate-500" />
      </div>
      
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-400 ring-1 ring-white/5 transition-colors group-hover:bg-cyan-500/10 group-hover:text-cyan-400 group-hover:ring-cyan-500/20">
        {props.icon}
      </div>
      
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{props.title}</div>
        <div className="mt-1 text-2xl font-bold text-white tracking-tight">{props.value}</div>
      </div>

      {(props.hint || props.trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {props.trend && (
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${props.trendUp !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <TrendingUp className={`h-3 w-3 ${props.trendUp === false ? 'rotate-180' : ''}`} /> {props.trend}
            </span>
          )}
          {props.hint && <span className="text-slate-500 truncate">{props.hint}</span>}
        </div>
      )}
    </div>
  );

  return props.href ? <Link href={props.href} className="block h-full">{content}</Link> : content;
}

/* =========================================================
 * Activity & Lists
 * =======================================================*/

export function ActivityItem({
  icon,
  title,
  subtitle,
  time,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
  time: string;
}) {
  return (
    <div className="group flex items-start gap-3 border-b border-white/5 px-5 py-3 last:border-0 hover:bg-white/[0.02]">
      <div className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-colors group-hover:bg-cyan-500/10 group-hover:text-cyan-400 group-hover:ring-cyan-500/20">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <div className="text-[10px] text-slate-600 whitespace-nowrap">{time}</div>
    </div>
  );
}

export function TopClassItem({
  rank,
  title,
  sales,
  revenue,
}: {
  rank: number;
  title: string;
  sales: number;
  revenue: number;
}) {
  const rankColor = rank === 1 ? "text-yellow-400" : rank === 2 ? "text-slate-300" : rank === 3 ? "text-amber-600" : "text-slate-600";
  
  return (
    <div className="flex items-center gap-4 border-b border-white/5 px-5 py-3 last:border-0 hover:bg-white/[0.02]">
      <div className={`font-mono text-sm font-bold w-4 text-center ${rankColor}`}>#{rank}</div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-200">{title}</div>
        <div className="text-xs text-slate-500">{sales} terjual</div>
      </div>
      <div className="text-right text-sm font-mono font-medium text-white">{rupiah(revenue)}</div>
    </div>
  );
}

/* =========================================================
 * Visualization
 * =======================================================*/

export function MiniBars({ title, series, formatValue }: { title: string; series: DailyPoint[]; formatValue: (v: number) => string }) {
  const max = Math.max(1, ...series.map((d) => d.value));
  const total = series.reduce((a, b) => a + b.value, 0);
  
  return (
    <div className="p-5">
      <div className="mb-6 flex items-end justify-between">
        <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</div>
            <div className="text-3xl font-bold text-white mt-1">{formatValue(total)}</div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.02] px-2 py-1 text-[10px] text-slate-400">
           <Calendar className="w-3 h-3" /> 14 Days
        </div>
      </div>
      
      <div className="flex items-end gap-1 h-28">
        {series.map((d) => {
          const h = (d.value / max) * 100;
          return (
            <div key={d.key} className="group relative flex-1 h-full flex items-end">
              <div
                className="w-full rounded-t-sm bg-gradient-to-t from-cyan-900/40 to-cyan-500/40 transition-all duration-300 group-hover:from-cyan-600 group-hover:to-cyan-400"
                style={{ height: `${Math.max(4, h)}%` }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                 <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap shadow-xl">
                    <span className="opacity-50">{d.label}:</span> <span className="font-bold">{formatValue(d.value)}</span>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
 * Table
 * =======================================================*/

export function PendingTable({ orders }: { orders: AdminOrder[] }) {
  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-white/5 p-3 mb-3"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
        <div className="text-sm text-slate-400">Semua aman! Tidak ada order pending.</div>
      </div>
    );
  }

  const statusColor = (s: OrderStatus) => {
    switch (s) {
      case "approved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rejected": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "expired": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/5 text-xs font-medium uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3 pl-6">User</th>
            <th className="px-5 py-3 text-right">Total</th>
            <th className="px-5 py-3 text-center">Status</th>
            <th className="px-5 py-3 text-right pr-6">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {orders.map((o) => (
            <tr key={o.id} className="group hover:bg-white/[0.02] transition-colors">
              <td className="px-5 py-3 pl-6">
                <div className="font-medium text-white truncate max-w-[120px]">{o.user_id ? "User " + o.user_id.slice(0, 4) : "Guest"}</div>
                <div className="text-[10px] text-slate-500">{parseDate(o.created_at)?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </td>
              <td className="px-5 py-3 text-right font-mono text-slate-300">
                {rupiah(o.total || 0)}
              </td>
              <td className="px-5 py-3 text-center">
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusColor(o.status)}`}>
                  {o.status}
                </span>
              </td>
              <td className="px-5 py-3 text-right pr-6">
                <Link href="/cms/orders" className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
                  Review
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { CheckCircle2 } from "lucide-react";