import Link from "next/link";
import { rupiah } from "../../../../../lib/format";
import type {
  DailyPoint,
  AdminOrder,
  OrderStatus,
} from "@/hooks/useCMSOverview";
import { parseDate } from "@/hooks/useCMSOverview";

/* =========================================================
 * Panel & Cards
 * =======================================================*/

export function Panel({
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

export function StatCard(props: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.08]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
            {props.icon} <span>{props.title}</span>
          </div>
          <span className="text-2xl font-bold text-white">{props.value}</span>
        </div>
        {props.hint ? (
          <div className="mt-2 text-xs text-white/60">{props.hint}</div>
        ) : null}
      </div>
    </div>
  );

  return props.href ? (
    <Link href={props.href} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

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
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="inline-flex items-center gap-2 text-xs text-white/70">
        {icon} <span>{label}</span>
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export function KPIBlock({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

/* =========================================================
 * Mini charts
 * =======================================================*/

export function MiniBars({
  title,
  series,
  formatValue,
}: {
  title: string;
  series: DailyPoint[];
  formatValue: (v: number) => string;
}) {
  const max = Math.max(1, ...series.map((d) => d.value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-medium text-white/80">{title}</div>
        <div className="text-[11px] text-white/50">
          {series[0]?.label} – {series[series.length - 1]?.label}
        </div>
      </div>
      <div className="flex items-end gap-1 rounded-xl border border-white/10 bg-white/5 p-2">
        {series.map((d) => {
          const h = (d.value / max) * 96;
          return (
            <div key={d.key} className="group relative flex-1">
              <div
                className="mx-auto w-2 rounded-md bg-white/20"
                style={{ height: Math.max(2, h) }}
              />
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

/* =========================================================
 * Tables & Quick panel
 * =======================================================*/

export function PendingTable({ orders }: { orders: AdminOrder[] }) {
  if (!orders.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
        Tidak ada order pending.
      </div>
    );
  }

  const statusColor = (s: OrderStatus) => {
    switch (s) {
      case "approved":
        return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
      case "rejected":
        return "border-rose-400/30 bg-rose-500/15 text-rose-200";
      case "expired":
        return "border-slate-400/30 bg-slate-500/15 text-slate-200";
      default:
        return "border-amber-400/30 bg-amber-500/15 text-amber-200";
    }
  };

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
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody className="text-sm text-white/80">
          {orders.map((o) => {
            const t = parseDate(o.created_at);
            const time = t ? t.toLocaleString() : "-";
            return (
              <tr key={o.id} className="border-t border-white/10">
                <td className="px-3 py-2">{time}</td>
                <td className="px-3 py-2 font-mono text-white">
                  {o.id.slice(0, 8)}…
                </td>
                <td className="px-3 py-2">
                  {o.user_id ? o.user_id.slice(0, 8) + "…" : "-"}
                </td>
                <td className="px-3 py-2">{rupiah(o.total || 0)}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-xs capitalize ${statusColor(
                      o.status
                    )}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <Link
                    href="/cms/orders"
                    className="text-xs text-cyan-300 hover:underline"
                  >
                    Kelola
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function QuickPanel({
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
      {items && (
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
      )}
      {custom}
    </div>
  );
}
