"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiAdminFeedbackList, apiAdminFeedbackDelete, api } from "../../../../lib/api";
import type { ClassItem } from "@/types/catalog";
import { Button } from "@/components/ui/Button";
import { Trash2, Star } from "lucide-react";

type Row = { id: string; class_id: string; text: string; rating?: number | null; created_at?: string; class_title?: string };

export default function CMSFeedbackPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [role, setRole] = useState<"mentor" | "admin" | "superadmin" | "peserta" | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await api<{ role: string }>("/me");
        setRole(me.role as any);
        const cls = await api<ClassItem[]>("/admin/classes"); 
        setClasses(cls);
      } catch (e: any) {
        setErr(e?.message || "Gagal memuat kelas.");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const list = await apiAdminFeedbackList(selected || undefined);
        setRows(list);
      } catch (e: any) {
        setErr(e?.message || "Gagal memuat feedback.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selected]);

  async function onDelete(id: string) {
    if (!(role === "admin" || role === "superadmin")) return;
    if (!confirm("Hapus feedback ini?")) return;
    try {
      await apiAdminFeedbackDelete(id);
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (e: any) {
      alert(e?.message || "Gagal menghapus.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-white/60">Ringkasan Feedback</div>
            <h1 className="text-xl font-bold text-white">Feedback Peserta (Anonim)</h1>
          </div>
          <Link href="/cms" className="text-sm text-white/70 hover:text-white underline">
            ← Kembali ke CMS
          </Link>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-xs text-white/70">Filter Kelas</label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white focus:outline-none"
            >
              <option value="">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        {err && <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{err}</div>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        {loading ? (
          <div className="text-sm text-white/60">Memuat…</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-white/60">Belum ada feedback.</div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="rounded-xl border border-white/10 bg-black/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-white/60">
                      {r.class_title ? r.class_title : r.class_id}
                      <span className="ml-2 text-white/40">• {new Date(r.created_at || "").toLocaleString()}</span>
                    </div>
                    {r.rating ? (
                      <div className="mt-1 inline-flex items-center gap-1 text-yellow-300">
                        {[...Array(r.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5" />)}
                      </div>
                    ) : null}
                    <div className="mt-1 text-sm text-white/90 whitespace-pre-wrap">{r.text}</div>
                  </div>
                  {(role === "admin" || role === "superadmin") && (
                    <Button variant="ghost" onClick={() => onDelete(r.id)} title="Hapus" className="text-rose-300 hover:text-rose-200">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
