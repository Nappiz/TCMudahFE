"use client";

import { ExternalLink, RefreshCw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ParticipantOrder } from "@/types/catalog";
import { API_BASE, api } from "../../../../../lib/api";

const STATUS_META: Record<
  ParticipantOrder["status"],
  { label: string; detail: string; className: string }
> = {
  pending: {
    label: "Menunggu verifikasi",
    detail: "Admin sedang memeriksa bukti transfermu.",
    className: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  },
  approved: {
    label: "Disetujui",
    detail: "Pembayaran sudah diverifikasi.",
    className: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  },
  rejected: {
    label: "Ditolak",
    detail: "Hubungi admin jika kamu perlu bantuan terkait pembayaran ini.",
    className: "border-rose-300/20 bg-rose-300/10 text-rose-100",
  },
  expired: {
    label: "Kedaluwarsa",
    detail: "Pesanan ini sudah tidak aktif.",
    className: "border-slate-300/15 bg-white/[0.05] text-slate-300",
  },
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function getItemTitle(item: ParticipantOrder["items"][number]) {
  if (item.item_title || item.title) return item.item_title || item.title;
  return item.item_type === "package" ? "Paket kelas" : "Kelas";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Gagal memuat riwayat pesanan.";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ParticipantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await api<ParticipantOrder[]>(
        "/orders/me?limit=100&offset=0",
      );
      setOrders(result);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className="space-y-7 pb-10">
      <header className="flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/70">
            Akun peserta
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Riwayat pesanan
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
            Pantau status pembayaran dan detail kelas yang kamu pesan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadOrders(true)}
          disabled={loading || refreshing}
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-xl border border-white/10 px-3.5 text-sm font-medium text-slate-300 transition hover:border-cyan-200/25 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Muat ulang
        </button>
      </header>

      {loading ? (
        <div aria-live="polite" aria-busy="true" className="space-y-4">
          {["one", "two"].map((key) => (
            <div
              key={key}
              className="h-48 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.025]"
            />
          ))}
        </div>
      ) : error ? (
        <section className="rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] p-6">
          <p className="font-medium text-rose-100">
            Riwayat pesanan belum bisa dimuat
          </p>
          <p className="mt-2 text-sm text-rose-100/65">{error}</p>
          <button
            type="button"
            onClick={() => void loadOrders()}
            className="mt-4 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Coba lagi
          </button>
        </section>
      ) : orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-white/[0.12] px-6 py-14 text-center">
          <ShoppingBag className="mx-auto h-9 w-9 text-cyan-200/60" />
          <h2 className="mt-4 text-lg font-semibold text-white">
            Belum ada pesanan
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
            Pesanan kelas yang kamu buat akan muncul di halaman ini.
          </p>
          <Link
            href="/daftar-kelas"
            className="mt-5 inline-flex rounded-xl bg-cyan-200 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
          >
            Lihat daftar kelas
          </Link>
        </section>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_META[order.status];
            const shortId = order.id.slice(0, 8).toUpperCase();

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.025]"
              >
                <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                      Pesanan #{shortId}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
                      Item pesanan
                    </h2>
                    <ul className="mt-3 space-y-3">
                      {(order.items ?? []).map((item, index) => (
                        <li
                          key={`${item.item_id ?? item.class_id ?? "item"}-${index}`}
                          className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-white/90">
                              {getItemTitle(item)}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {item.item_type === "package" ? "Paket" : "Kelas"}
                              {item.meeting_count
                                ? ` · ${item.meeting_count} pertemuan`
                                : ""}
                              {item.qty && item.qty > 1
                                ? ` · ${item.qty} item`
                                : ""}
                            </p>
                          </div>
                          {typeof item.price === "number" ? (
                            <span className="text-sm text-slate-300">
                              {formatAmount(item.price)}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs text-slate-500">{status.detail}</p>
                      {order.proof_url ? (
                        <a
                          href={`${API_BASE}/orders/me/${encodeURIComponent(order.id)}/proof`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-200 transition hover:text-cyan-100"
                        >
                          Lihat bukti transfer{" "}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs text-slate-500">Total pembayaran</p>
                      <p className="mt-1 text-lg font-semibold tracking-tight text-white">
                        {formatAmount(order.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
