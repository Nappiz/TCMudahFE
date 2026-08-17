"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Order, OrderStatus } from "../../../../../lib/orders";

type Props = {
  rows: Order[];
  rupiah: (n: number) => string;
  onSetStatus: (id: string, status: Exclude<OrderStatus, "pending">) => void;
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
};

export function OrdersTable({ rows, rupiah, onSetStatus, page, total, limit, onPageChange }: Props) {
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/60">
          <tr>
            <th className="px-4 py-3 text-left font-medium w-48">Waktu</th>
            <th className="px-4 py-3 text-left font-medium w-56">Pengirim</th>
            <th className="px-4 py-3 text-left font-medium w-36">Total</th>
            <th className="px-4 py-3 text-left font-medium w-64">Item</th>
            <th className="px-4 py-3 text-left font-medium w-28">Bukti</th>
            <th className="px-4 py-3 text-left font-medium w-56">Catatan</th>
            <th className="px-4 py-3 text-left font-medium w-32">Status</th>
            <th className="px-4 py-3 text-left font-medium w-[18rem]">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10">
              <td className="px-4 py-3 text-white/80">
                {row.created_at
                  ? row.created_at.replace("T", " ").slice(0, 16)
                  : "—"}
              </td>
              <td className="px-4 py-3 text-white/90">
                <span className="font-semibold">
                  {row.user_name || row.user_email || "—"}
                </span>
                {row.sender_name ? (
                  <span className="ml-2 text-xs text-white/50">
                    (nama di slip: {row.sender_name})
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-white/80">
                {rupiah(row.total)}
              </td>
              <td className="px-4 py-3">
                {row.items && row.items.length > 0 ? (
                  <ul className="list-none space-y-1 text-xs">
                    {row.items.map((it: any, idx: number) => (
                      <li key={idx}>
                        <span className="text-white/90">{it.item_title || "-"}</span>
                        <span className="text-white/50 ml-1">x{it.qty}</span>
                        {it.item_type === "package" && (
                          <span className="ml-1 inline-block rounded border border-cyan-500/30 bg-cyan-500/10 px-1 text-[9px] uppercase tracking-wider text-cyan-300">
                            Paket
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-white/40">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {row.proof_url ? (
                  <a
                    href={row.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline"
                  >
                    <Eye className="h-4 w-4" /> Lihat
                  </a>
                ) : (
                  <span className="text-white/40">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-white/70">
                {row.note ? (
                  row.note
                ) : (
                  <span className="text-white/40">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs border
                    ${
                      row.status === "approved"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/20"
                        : row.status === "rejected"
                        ? "bg-rose-500/15 text-rose-300 border-rose-400/20"
                        : row.status === "expired"
                        ? "bg-slate-500/15 text-slate-300 border-slate-400/20"
                        : "bg-amber-500/15 text-amber-300 border-amber-400/20"
                    }`}
                >
                  {row.status === "approved" ? "accepted" : row.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {row.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => onSetStatus(row.id, "approved")}
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onSetStatus(row.id, "rejected")}
                    >
                      ✕ Reject
                    </Button>
                  </div>
                ) : row.status === "approved" ? (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => onSetStatus(row.id, "expired")}
                    >
                      ⏳ Expire
                    </Button>
                  </div>
                ) : (
                  <span className="text-white/40">—</span>
                )}
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-6 text-center text-white/60"
              >
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination UI */}
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/50">
              Menampilkan <span className="font-medium text-white/80">{total > 0 ? startIndex : 0}</span> hingga <span className="font-medium text-white/80">{endIndex}</span> dari <span className="font-medium text-white/80">{total}</span> hasil
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-white/40 ring-1 ring-inset ring-white/10 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <span aria-hidden="true">&laquo; Prev</span>
              </button>
              
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-inset ring-white/10">
                Halaman {page} dari {totalPages}
              </span>

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-white/40 ring-1 ring-inset ring-white/10 hover:bg-white/5 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <span aria-hidden="true">Next &raquo;</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
