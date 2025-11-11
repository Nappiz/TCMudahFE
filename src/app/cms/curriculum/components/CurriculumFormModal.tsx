"use client";

import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CurriculumForm, CurriculumItem } from "../../../../../lib/curriculum";

type Props = {
  open: boolean;
  editing: CurriculumItem | null;
  form: CurriculumForm;
  saving: boolean;
  onChangeForm: (form: CurriculumForm) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function CurriculumFormModal({
  open,
  editing,
  form,
  saving,
  onChangeForm,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => !saving && onClose()}
      />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-white font-semibold">
            {editing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
          </div>
          <button
            onClick={() => !saving && onClose()}
            className="rounded-lg border border-white/15 p-2 text-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs text-white/60">Kode</label>
              <input
                value={form.code}
                onChange={(e) =>
                  onChangeForm({ ...form, code: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                placeholder="IF1101"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-white/60">Nama</label>
              <input
                value={form.name}
                onChange={(e) =>
                  onChangeForm({ ...form, name: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                placeholder="Dasar Pemrograman"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-white/60">Semester</label>
              <select
                value={form.sem}
                onChange={(e) =>
                  onChangeForm({
                    ...form,
                    sem: Number(e.target.value) as 1 | 2,
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-white/60">Deskripsi</label>
              <input
                value={form.blurb}
                onChange={(e) =>
                  onChangeForm({ ...form, blurb: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                placeholder="Ringkasan singkat materi"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button
            variant="secondary"
            onClick={onSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
