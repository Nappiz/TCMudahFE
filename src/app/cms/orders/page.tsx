"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Order = {
  id: string;
  user_id: string;
  items: { class_id: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "approved" | "rejected" | "expired";
  proof_url?: string | null;
  sender_name?: string | null;
  note?: string | null;
  created_at?: string;
  user_name?: string | null;
  user_email?: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

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
  return res.json() as Promise<T>;
}

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function OrdersCMSPage() {
  const [rows, setRows] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const data = await api<Order[]>("/admin/orders");
        if (!cancel) setRows(data);
      } catch (e: any) {
        if (!cancel) setErr(e?.message ?? "Gagal memuat orders");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const pengirim = (r.user_name || r.user_email || "").toLowerCase();
      return pengirim.includes(s) || (r.status || "").toLowerCase().includes(s) || (r.note || "").toLowerCase().includes(s);
    });
  }, [rows, q]);

  async function setStatus(id: string, status: "approved" | "rejected" | "expired") {
    try {
      const updated = await api<Order>(`/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e: any) {
      alert(e?.message ?? "Gagal memperbarui status");
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">Memuat orders…</div>;
  }
  if (err) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-red-300">{err}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-white font-semibold">Validasi Pembayaran</div>
            <div className="text-sm text-white/70">Approve/Reject/Expire bukti transfer peserta.</div>
          </div>
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari status/nama pengirim/catatan…"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

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
              <th className="px-4 py-3 text-left font-medium w-[18rem]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-white/10">
                <td className="px-4 py-3 text-white/80">
                  {row.created_at ? row.created_at.replace("T", " ").slice(0, 16) : "—"}
                </td>
                <td className="px-4 py-3 text-white/90">
                  <span className="font-semibold">{row.user_name || row.user_email || "—"}</span>
                  {row.sender_name ? (
                    <span className="ml-2 text-xs text-white/50">(nama di slip: {row.sender_name})</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-white/80">{rupiah(row.total)}</td>
                <td className="px-4 py-3">
                  {row.proof_url ? (
                    <a
                      href={row.proof_url}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline"
                    >
                      <Eye className="h-4 w-4" /> Lihat
                    </a>
                  ) : (
                    <span className="text-white/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {row.note ? row.note : <span className="text-white/40">—</span>}
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
                  {/* Aksi dinamis:
                      - pending  -> Approve / Reject
                      - approved -> Expire
                      - rejected/expired -> (—) */}
                  {row.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setStatus(row.id, "approved")}>✓ Approve</Button>
                      <Button variant="ghost" onClick={() => setStatus(row.id, "rejected")}>✕ Reject</Button>
                    </div>
                  ) : row.status === "approved" ? (
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setStatus(row.id, "expired")}>⏳ Expire</Button>
                    </div>
                  ) : (
                    <span className="text-white/40">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-white/60">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
