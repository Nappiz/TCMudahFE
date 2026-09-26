"use client";

import { ExternalLink, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { API_BASE } from "../../../../../lib/api";
import type { Order, OrderItem, OrderStatus } from "../../../../../lib/orders";

type Props = {
  order: Order;
  rupiah: (amount: number) => string;
  approving: boolean;
  onClose: () => void;
  onApprove: () => void;
};

const statusStyles: Record<
  OrderStatus,
  { label: string; dot: string; text: string }
> = {
  pending: {
    label: "Menunggu review",
    dot: "bg-amber-300",
    text: "text-amber-200",
  },
  approved: {
    label: "Disetujui",
    dot: "bg-emerald-300",
    text: "text-emerald-200",
  },
  rejected: { label: "Ditolak", dot: "bg-rose-300", text: "text-rose-200" },
  expired: {
    label: "Kedaluwarsa",
    dot: "bg-slate-400",
    text: "text-slate-300",
  },
};

export function OrderDetailModal({
  order,
  rupiah,
  approving,
  onClose,
  onApprove,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  const status = statusStyles[order.status];
  const packageClassCount = new Set(
    order.items.flatMap((item) =>
      item.item_type === "package"
        ? (item.offer_snapshot?.items ?? []).map((child) => child.class_id)
        : [item.item_id ?? item.class_id ?? ""],
    ),
  );
  packageClassCount.delete("");

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#05080d]/80 p-3 backdrop-blur-sm sm:p-5">
      <button
        type="button"
        aria-label="Tutup rincian order"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-white/[0.1] bg-[#0b111a] text-white shadow-[0_24px_90px_rgba(0,0,0,0.48)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

        <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
              Order detail · {order.id.slice(0, 8)}
            </p>
            <h2
              id="order-detail-title"
              className="mt-2 truncate text-xl font-semibold tracking-tight"
            >
              {order.user_name || order.user_email || "Peserta"}
            </h2>
            <p className="mt-1 truncate text-xs text-white/35">
              {order.user_email || "Email peserta tidak tersedia"}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Tutup rincian order"
            className="shrink-0 rounded-lg p-1.5 text-white/35 transition hover:bg-white/[0.06] hover:text-white"
            onClick={onClose}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-4">
            <SummaryCell label="Status">
              <span
                className={`inline-flex items-center gap-1.5 text-xs ${status.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </SummaryCell>
            <SummaryCell label="Total">
              <span className="text-sm font-medium text-white/90">
                {rupiah(order.total)}
              </span>
            </SummaryCell>
            <SummaryCell label="Dibuat">
              <span className="text-xs text-white/65">
                {formatDate(order.created_at)}
              </span>
            </SummaryCell>
            <SummaryCell label="Fulfillment">
              <span className="text-xs text-white/65">
                {order.fulfillment_mode === "automatic"
                  ? "Auto enrollment"
                  : "Manual"}
              </span>
            </SummaryCell>
          </div>

          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white/85">Yang dibeli</p>
                <p className="mt-1 text-xs text-white/35">
                  {packageClassCount.size} kelas dari {order.items.length} item
                </p>
              </div>
              {order.proof_url && (
                <a
                  href={`${API_BASE}/admin/orders/${encodeURIComponent(order.id)}/proof`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-cyan-300/80 transition hover:text-cyan-200"
                >
                  Buka bukti bayar
                  <ExternalLink aria-hidden="true" className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {order.items.map((item, index) => (
                <OrderItemCard
                  key={`${item.item_type}:${item.item_id ?? index}`}
                  item={item}
                />
              ))}
            </div>
          </div>

          {(order.sender_name || order.note) && (
            <div className="mt-5 grid gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-xs sm:grid-cols-2">
              {order.sender_name && (
                <p className="text-white/55">
                  Nama di slip{" "}
                  <span className="ml-1 text-white/80">
                    {order.sender_name}
                  </span>
                </p>
              )}
              {order.note && (
                <p className="text-white/55 sm:text-right">
                  Catatan{" "}
                  <span className="ml-1 text-white/80">{order.note}</span>
                </p>
              )}
            </div>
          )}

          {order.status === "pending" && (
            <div className="mt-5 rounded-xl border border-amber-300/10 bg-amber-300/[0.04] px-4 py-3 text-xs leading-5 text-amber-100/70">
              {order.fulfillment_mode === "automatic"
                ? `Approve akan mengaktifkan akses ke ${packageClassCount.size} kelas dari snapshot order ini.`
                : "Order lama memakai alur manual. Setelah approve, enrollment peserta perlu diatur dari menu Enrollments."}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-white/[0.07] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={approving}
            className="rounded-lg px-3 py-2 text-xs text-white/45 transition hover:bg-white/[0.05] hover:text-white/75 disabled:opacity-40"
          >
            Tutup
          </button>
          {order.status === "pending" && (
            <button
              type="button"
              onClick={onApprove}
              disabled={approving}
              className="rounded-lg bg-cyan-300 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-50"
            >
              {approving ? "Menyetujui…" : "Setujui order"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

function SummaryCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-16 bg-[#0b111a] px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">
        {label}
      </p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function OrderItemCard({ item }: { item: OrderItem }) {
  const children = item.offer_snapshot?.items ?? [];
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white/85">
            {item.item_title || "Item order"}
          </p>
          <p className="mt-1 text-[11px] text-white/35">
            {item.item_type === "package" ? "Paket kelas" : "Kelas"}
            {item.qty > 1 ? ` · ${item.qty} item` : ""}
          </p>
        </div>
        <span className="shrink-0 text-sm font-medium text-white/75">
          {typeof item.price === "number" ? formatRupiah(item.price) : "—"}
        </span>
      </div>

      {item.item_type === "package" && (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          {children.length > 0 ? (
            <ul className="space-y-2">
              {children.map((child) => (
                <li
                  key={child.class_id}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="truncate text-white/60">
                    {child.class_title || `Kelas ${child.class_id}`}
                  </span>
                  <span className="shrink-0 text-white/30">
                    {child.meeting_count} pertemuan
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-amber-200/70">
              Rincian kelas paket tidak tersimpan pada order lama.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.replace("T", " ").slice(0, 16);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
