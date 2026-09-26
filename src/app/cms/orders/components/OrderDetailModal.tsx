"use client";

import { ExternalLink, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { API_BASE } from "../../../../../lib/api";
import type { Order } from "../../../../../lib/orders";

type Props = {
  order: Order;
  rupiah: (amount: number) => string;
  approving: boolean;
  onClose: () => void;
  onApprove: () => void;
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

  const automatic = order.fulfillment_mode === "automatic";
  const classIds = new Set(
    order.items.flatMap((item) =>
      item.item_type === "package"
        ? (item.offer_snapshot?.items ?? []).map((child) => child.class_id)
        : [item.item_id ?? item.class_id ?? ""],
    ),
  );
  classIds.delete("");

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Tutup rincian order"
        tabIndex={-1}
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        tabIndex={-1}
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-slate-900 p-5 text-white shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-cyan-300">
              Rincian order
            </p>
            <h2 id="order-detail-title" className="mt-1 text-xl font-semibold">
              {order.user_name || order.user_email || "Peserta"}
            </h2>
            <p className="mt-1 text-xs text-white/50">
              {order.user_email || order.id}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Tutup rincian order"
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl bg-white/5 p-4 text-sm sm:grid-cols-2">
          <p>
            <span className="text-white/50">Status:</span> {order.status}
          </p>
          <p>
            <span className="text-white/50">Pengirim:</span>{" "}
            {order.sender_name || "—"}
          </p>
          <p>
            <span className="text-white/50">Tanggal:</span>{" "}
            {order.created_at?.replace("T", " ").slice(0, 16) || "—"}
          </p>
          <p>
            <span className="text-white/50">Total:</span> {rupiah(order.total)}
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <h3 className="text-sm font-semibold text-white/80">Yang dipesan</h3>
          {order.items.map((item, index) => (
            <div
              key={`${item.item_type}:${item.item_id ?? item.class_id}:${index}`}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {item.item_title || "Item lama"}
                  </p>
                  <p className="mt-1 text-xs text-white/50">
                    {item.item_type === "package" ? "Paket" : "Kelas"}
                    {item.meeting_count
                      ? ` · ${item.meeting_count} pertemuan`
                      : ""}
                    {item.qty > 1 ? ` · ${item.qty} item` : ""}
                  </p>
                </div>
                <span className="text-sm text-cyan-200">
                  {rupiah(item.price)}
                </span>
              </div>
              {item.item_type === "package" && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  {item.offer_snapshot?.items?.length ? (
                    <ul className="space-y-2 text-sm">
                      {item.offer_snapshot.items.map((child) => (
                        <li
                          key={child.class_id}
                          className="flex justify-between gap-3"
                        >
                          <span className="text-white/80">
                            {child.class_title || `Kelas ${child.class_id}`}
                          </span>
                          <span className="shrink-0 text-white/50">
                            {child.meeting_count} pertemuan
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-amber-200">
                      Rincian kelas paket tidak tersimpan pada order lama.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {order.note && (
          <p className="mt-4 text-sm text-white/70">
            <span className="text-white/50">Catatan:</span> {order.note}
          </p>
        )}

        {order.status === "pending" && (
          <p
            className={`mt-5 rounded-xl border p-3 text-sm ${
              automatic
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-amber-400/20 bg-amber-400/10 text-amber-200"
            }`}
          >
            {automatic
              ? `Approve akan mengaktifkan akses ke ${classIds.size} kelas dari order ini.`
              : "Order lama memakai alur manual. Setelah approve, admin perlu mengatur enrollment peserta secara manual."}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          {order.proof_url ? (
            <a
              href={`${API_BASE}/admin/orders/${encodeURIComponent(order.id)}/proof`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:underline"
            >
              Lihat bukti bayar <ExternalLink size={14} />
            </a>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={approving}>
              Tutup
            </Button>
            {order.status === "pending" && (
              <Button onClick={onApprove} disabled={approving}>
                {approving ? "Menyetujui…" : "Approve order"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
