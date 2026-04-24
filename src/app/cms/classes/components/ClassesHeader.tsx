"use client";

import { Search, Plus, Package, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Mode = "class" | "package";

type Props = {
  canWrite: boolean;
  search: string;
  activeTab: Mode;
  onTabChange: (tab: Mode) => void;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
};

export function ClassesHeader({
  canWrite,
  search,
  activeTab,
  onTabChange,
  onSearchChange,
  onAdd,
}: Props) {
  const readonly = !canWrite;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Manajemen Katalog</h1>
            <p className="text-sm text-white/70">
              Kelola kelas dasar dan paket penjualan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64 max-w-[60vw]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari judul..."
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
              />
            </div>
            {!readonly && (
              <Button
                variant="secondary"
                onClick={onAdd}
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white"
              >
                <Plus className="h-4 w-4" />
                Tambah {activeTab === "class" ? "Kelas" : "Paket"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 border-b border-white/10 pb-[-1px]">
          <button
            onClick={() => onTabChange("class")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "class"
              ? "border-cyan-400 text-cyan-400"
              : "border-transparent text-white/50 hover:text-white/80"
              }`}
          >
            <BookOpen className="w-4 h-4" /> Kelas Dasar
          </button>
          <button
            onClick={() => onTabChange("package")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === "package"
              ? "border-cyan-400 text-cyan-400"
              : "border-transparent text-white/50 hover:text-white/80"
              }`}
          >
            <Package className="w-4 h-4" /> Paket Bundle
          </button>
        </div>
      </div>
    </div>
  );
}