"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, BookOpen } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
type ClassItem = { id: string; title: string; description?: string };

async function api<T>(p: string) {
  const r = await fetch(`${API_BASE}${p}`, { credentials: "include" });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json() as Promise<T>;
}

export default function MaterialsIndexPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const cls = await api<ClassItem[]>("/admin/classes");
      setClasses(cls);
    })();
  }, []);

  const filtered = classes.filter((c) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return c.title.toLowerCase().includes(s) || (c.description ?? "").toLowerCase().includes(s);
  });

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-white font-semibold">Materials</div>
        <p className="text-white/70 text-sm">Pilih kelas untuk mengunggah dan mengelola materi (video / ppt).</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari kelas…"
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/60">Tidak ada kelas.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/cms/materials/${c.id}`}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              >
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 mb-2">
                  <BookOpen className="h-4 w-4" /> Kelas
                </div>
                <div className="text-white font-semibold">{c.title}</div>
                <div className="text-xs text-white/60 mt-1 line-clamp-2">{c.description}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
