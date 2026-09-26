"use client";

import { ExternalLink } from "lucide-react";
import { API_BASE } from "../../../../../lib/api";
import type { Order, OrderItem, OrderStatus } from "../../../../../lib/orders";

type Props = {
  rows: Order[];
  rupiah: (n: number) => string;
  onSetStatus: (id: string, status: Exclude<OrderStatus, "pending">) => void;
  onExpire: (order: Order) => void;
  expiringId: string | null;
  onView: (order: Order) => void;
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
};

const statusStyles: Record<
  OrderStatus,
  { label: string; dot: string; text: string }
> = {
  pending: {
    label: "Menunggu",
    dot: "bg-amber-300",
    text: "text-amber-200",
  },
  approved: {
    label: "Disetujui",
    dot: "bg-emerald-300",
    text: "text-emerald-200",
  },
  rejected: {
    label: "Ditolak",
    dot: "bg-rose-300",
    text: "text-rose-200",
  },
  expired: {
    label: "Kedaluwarsa",
    dot: "bg-slate-400",
    text: "text-slate-300",
  },
};

export function OrdersTable({
  rows,
  rupiah,
  onSetStatus,
  onExpire,
  expiringId,
  onView,
  page,
  total,
  limit,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  return (
    <section className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0c111a]/90 shadow-[0_16px_45px_rgba(0,0,0,0.14)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5 sm:px-5">
        <div>
          <p className="text-sm font-medium text-white">Orders</p>
          <p className="mt-0.5 text-xs text-white/35">
            {total === 0
              ? "Belum ada order yang cocok"
              : `${total} order ditemukan`}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-left">
          <thead className="border-b border-white/[0.06] bg-white/[0.018] text-[10px] uppercase tracking-[0.16em] text-white/30">
            <tr>
              <th className="w-32 px-5 py-3 font-medium">Waktu</th>
              <th className="w-[22%] px-4 py-3 font-medium">Peserta</th>
              <th className="w-[27%] px-4 py-3 font-medium">Pembelian</th>
              <th className="w-36 px-4 py-3 font-medium">Total</th>
              <th className="w-32 px-4 py-3 font-medium">Status</th>
              <th className="w-44 px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.055]">
            {rows.map((row) => (
              <OrderRow
                key={row.id}
                row={row}
                rupiah={rupiah}
                onSetStatus={onSetStatus}
                onExpire={onExpire}
                expiringId={expiringId}
                onView={onView}
              />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="mx-auto max-w-xs">
                    <div className="mx-auto h-2 w-14 rounded-full bg-white/[0.08]" />
                    <p className="mt-4 text-sm text-white/55">
                      Tidak ada order untuk filter ini.
                    </p>
                    <p className="mt-1 text-xs text-white/30">
                      Coba ubah kata kunci atau status yang dipilih.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-xs text-white/35">
          Menampilkan{" "}
          <span className="text-white/65">{total > 0 ? startIndex : 0}</span>–
          <span className="text-white/65">{endIndex}</span> dari{" "}
          <span className="text-white/65">{total}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-white/50 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            Sebelumnya
          </button>
          <span className="min-w-24 text-center text-xs text-white/45">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs text-white/50 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-white disabled:pointer-events-none disabled:opacity-30"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </section>
  );
}

function OrderRow({
  row,
  rupiah,
  onSetStatus,
  onExpire,
  expiringId,
  onView,
}: {
  row: Order;
  rupiah: (n: number) => string;
  onSetStatus: (id: string, status: Exclude<OrderStatus, "pending">) => void;
  onExpire: (order: Order) => void;
  expiringId: string | null;
  onView: (order: Order) => void;
}) {
  const status = statusStyles[row.status];
  const participantName = row.user_name || row.user_email || "Peserta";
  const shownItems = (row.items ?? []).slice(0, 2);
  const hiddenItems = Math.max((row.items?.length ?? 0) - shownItems.length, 0);

  return (
    <tr className="group transition-colors hover:bg-white/[0.025]">
      <td className="px-5 py-4 align-top">
        <p className="text-xs font-medium text-white/65">
          {formatDate(row.created_at)}
        </p>
        <p className="mt-1 text-[11px] text-white/30">
          {formatTime(row.created_at)}
        </p>
      </td>

      <td className="px-4 py-4 align-top">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white/85">
            {participantName}
          </p>
          {row.user_email && row.user_name && (
            <p className="mt-0.5 truncate text-xs text-white/35">
              {row.user_email}
            </p>
          )}
          {row.sender_name && (
            <p className="mt-1 truncate text-[11px] text-white/30">
              Slip: {row.sender_name}
            </p>
          )}
        </div>
      </td>

      <td className="px-4 py-4 align-top">
        {shownItems.length > 0 ? (
          <div className="space-y-1.5">
            {shownItems.map((item, index) => (
              <ItemLine
                key={`${item.item_type ?? "item"}:${item.item_id ?? index}`}
                item={item}
              />
            ))}
            {hiddenItems > 0 && (
              <p className="text-[11px] text-white/35">
                +{hiddenItems} item lain
              </p>
            )}
          </div>
        ) : (
          <span className="text-sm text-white/25">—</span>
        )}
        {(row.proof_url || row.note) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {row.proof_url && (
              <a
                href={`${API_BASE}/admin/orders/${encodeURIComponent(row.id)}/proof`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-cyan-300/80 transition hover:text-cyan-200"
              >
                Bukti bayar{" "}
                <ExternalLink aria-hidden="true" className="h-3 w-3" />
              </a>
            )}
            {row.note && (
              <span
                className="max-w-44 truncate text-[11px] text-white/30"
                title={row.note}
              >
                {row.note}
              </span>
            )}
          </div>
        )}
      </td>

      <td className="px-4 py-4 align-top">
        <p className="text-sm font-medium text-white/85">{rupiah(row.total)}</p>
        {row.fulfillment_mode === "automatic" && (
          <p className="mt-1 text-[10px] text-cyan-300/55">Auto enrollment</p>
        )}
      </td>

      <td className="px-4 py-4 align-top">
        <div
          className={`inline-flex items-center gap-1.5 text-xs ${status.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>
        {row.status === "pending" && row.fulfillment_mode !== "automatic" && (
          <p className="mt-1 text-[10px] text-white/30">Manual enrollment</p>
        )}
      </td>

      <td className="px-4 py-4 align-top text-right">
        <div className="flex flex-wrap justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onView(row)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              row.status === "pending"
                ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                : "border border-white/[0.1] text-white/60 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            {row.status === "pending" ? "Review" : "Detail"}
          </button>
          {row.status === "pending" && (
            <button
              type="button"
              onClick={() => onSetStatus(row.id, "rejected")}
              className="rounded-lg px-3 py-2 text-sm text-white/45 transition hover:bg-rose-400/[0.08] hover:text-rose-200"
            >
              Tolak
            </button>
          )}
          {row.status === "approved" && (
            <button
              type="button"
              onClick={() => onExpire(row)}
              disabled={expiringId === row.id}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/45 transition hover:bg-white/[0.05] hover:text-white/75 disabled:cursor-wait disabled:opacity-50"
            >
              {expiringId === row.id && (
                <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              )}
              {expiringId === row.id ? "Memproses" : "Expire"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function ItemLine({ item }: { item: OrderItem }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="truncate text-xs text-white/75">
        {item.item_title || "Item order"}
      </span>
      {item.item_type === "package" && (
        <span className="shrink-0 text-[9px] uppercase tracking-[0.12em] text-cyan-300/55">
          Paket
        </span>
      )}
      {!!item.qty && item.qty > 1 && (
        <span className="shrink-0 text-[10px] text-white/30">×{item.qty}</span>
      )}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace("T", " ").slice(0, 10);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    return value.replace("T", " ").slice(11, 16);
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
