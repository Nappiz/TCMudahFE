"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API_BASE = "/api";
type ClassItem = { id: string; title: string; description?: string };

async function api<T>(path: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
  });
  if (!response.ok)
    throw new Error((await response.text()) || response.statusText);
  return response.json() as Promise<T>;
}

export default function MaterialsIndexPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void api<ClassItem[]>("/admin/classes")
      .then((items) => {
        if (!cancelled) setClasses(items);
      })
      .catch((errorValue: unknown) => {
        if (!cancelled) {
          setError(
            errorValue instanceof Error
              ? errorValue.message
              : "Gagal memuat daftar kelas.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return classes;
    return classes.filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        (item.description ?? "").toLowerCase().includes(normalizedQuery),
    );
  }, [classes, query]);

  return (
    <div className="space-y-6 pb-6">
      <header className="border-b border-white/[0.08] pb-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300/70">
              CMS / Materi
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Materi kelas
            </h1>
            <p className="mt-1 max-w-xl text-sm text-white/55">
              Pilih kelas untuk mengatur video, presentasi, dan materi belajar.
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-2xl font-semibold text-white">
              {classes.length}
            </p>
            <p className="text-xs text-white/45">kelas tersedia</p>
          </div>
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035]">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Daftar kelas</h2>
            <p className="mt-1 text-xs text-white/45">
              {filtered.length} dari {classes.length} kelas
            </p>
          </div>
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Cari kelas</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kelas..."
              className="w-full rounded-xl border border-white/[0.1] bg-slate-950/45 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40 focus:bg-slate-950/70"
            />
          </label>
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.06]">
            {["one", "two", "three", "four"].map((key) => (
              <div key={key} className="animate-pulse space-y-2 px-5 py-5">
                <div className="h-3 w-20 rounded-full bg-white/[0.08]" />
                <div className="h-5 w-2/3 rounded-full bg-white/[0.08]" />
                <div className="h-3 w-5/6 rounded-full bg-white/[0.06]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-5 text-sm text-rose-200">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-white">
              Kelas tidak ditemukan
            </p>
            <p className="mt-1 text-sm text-white/45">
              Coba gunakan kata kunci lain.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/cms/materials/${item.id}`}
                className="group flex items-center justify-between gap-5 px-5 py-5 transition hover:bg-white/[0.035]"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/60">
                    Kelas
                  </p>
                  <h3 className="mt-1 truncate text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-white/45">
                    {item.description || "Belum ada deskripsi kelas."}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.025] px-3 py-2 text-xs font-semibold text-white/60 transition group-hover:border-cyan-300/30 group-hover:bg-cyan-300/[0.08] group-hover:text-cyan-100">
                  <span>Kelola materi</span>
                  <span
                    aria-hidden
                    className="text-base leading-none text-cyan-300/70 transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
