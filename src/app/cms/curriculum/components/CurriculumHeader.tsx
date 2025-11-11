import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  canWrite: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onAdd: () => void;
};

export function CurriculumHeader({
  canWrite,
  search,
  onSearchChange,
  onAdd,
}: Props) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Kurikulum</h1>
          <p className="text-sm text-white/70">
            Kelola daftar mata kuliah semester 1–2.{" "}
            <span className="text-white/60">Mentor hanya dapat melihat.</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-64 max-w-[60vw]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari kode / nama"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
            />
          </div>
          {canWrite ? (
            <Button
              variant="secondary"
              onClick={onAdd}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
