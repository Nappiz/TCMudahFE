"use client";

import { Button } from "@/components/ui/Button";
import { Link2, Plus, Search } from "lucide-react";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  total: number;
  error?: string | null;
  onCreate: () => void;
};

export function ShortlinksHeader({
  search,
  onSearchChange,
  loading,
  total,
  error,
  onCreate,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Link2 className="h-4 w-4" />
            <span>Shortlinks</span>
          </div>
          <h1 className="mt-1 text-xl font-bold text-white">
            Manajemen Shortlink
          </h1>
          <p className="text-sm text-white/70">
            Buat dan kelola shortlink dengan prefix{" "}
            <span className="font-mono text-white">/m/&lt;slug&gt;</span> untuk
            TC Mudah.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full min-w-[220px] sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari slug / URL / judul…"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
            />
          </div>
          <Button
            variant="secondary"
            onClick={onCreate}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Shortlink
          </Button>
        </div>
      </div>

      <div className="mt-3 text-xs text-white/60">
        {loading ? "Memuat data shortlink…" : `${total} shortlink ditampilkan`}
        {error && (
          <span className="ml-2 text-rose-300">
            • Terjadi kesalahan: {error}
          </span>
        )}
      </div>
    </div>
  );
}
