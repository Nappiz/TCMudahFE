"use client";

import Modal from "@/components/modal/Modal";
import { API_BASE } from "../../../../../lib/api";
import type { Order, OrderItem, OrderStatus } from "../../../../../lib/orders";

type Props = {
  order: Order | null;
  rupiah: (amount: number) => string;
  approving: boolean;
  onClose: () => void;
  onApprove: () => void | Promise<void>;
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
  if (!order) return <Modal open={false} onClose={onClose} />;

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
    <Modal
      open
      onClose={() => !approving && onClose()}
      dismissible={!approving}
      title={order.user_name || order.user_email || "Peserta"}
      description={`${order.user_email || "Email peserta tidak tersedia"} · Order ${order.id.slice(0, 8)}`}
      size="lg"
      actions={[
        {
          label: "Tutup",
          onClick: onClose,
          variant: "ghost",
          disabled: approving,
        },
        ...(order.status === "pending"
          ? [
              {
                label: "Setujui order",
                loadingLabel: "Menyetujui...",
                onClick: onApprove,
                variant: "primary" as const,
                loading: approving,
              },
            ]
          : []),
      ]}
    >
      <div className="space-y-5">
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
                <span className="ml-1 text-white/80">{order.sender_name}</span>
              </p>
            )}
            {order.note && (
              <p className="text-white/55 sm:text-right">
                Catatan <span className="ml-1 text-white/80">{order.note}</span>
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
    </Modal>
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
