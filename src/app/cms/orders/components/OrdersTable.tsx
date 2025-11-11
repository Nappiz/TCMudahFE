"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Order, OrderStatus } from "../../../../../lib/orders";

type Props = {
  rows: Order[];
  rupiah: (n: number) => string;
  onSetStatus: (id: string, status: Exclude<OrderStatus, "pending">) => void;
};

export function OrdersTable({ rows, rupiah, onSetStatus }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5 text-white/60">
          <tr>
            <th className="px-4 py-3 text-left font-medium w-48">Waktu</th>
            <th className="px-4 py-3 text-left font-medium w-56">Pengirim</th>
            <th className="px-4 py-3 text-left font-medium w-36">Total</th>
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
                colSpan={7}
                className="px-4 py-6 text-center text-white/60"
              >
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
