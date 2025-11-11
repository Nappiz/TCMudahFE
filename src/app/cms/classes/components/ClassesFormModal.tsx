"use client";

import { X, Save, Users2, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ClassForm, ClassItem } from "../../../../../lib/classes";
import type { Mentor } from "../../../../../lib/mentors";
import type { CurriculumItem } from "../../../../../lib/curriculum";

type Props = {
  open: boolean;
  editing: ClassItem | null;
  form: ClassForm;
  mentors: Mentor[];
  curriculum: CurriculumItem[];
  saving: boolean;
  onChangeForm: (form: ClassForm) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function ClassesFormModal({
  open,
  editing,
  form,
  mentors,
  curriculum,
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
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-white font-semibold">
            {editing ? "Edit Kelas" : "Tambah Kelas"}
          </div>
          <button
            onClick={() => !saving && onClose()}
            className="rounded-lg border border-white/15 p-2 text-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3">
          <div>
            <label className="text-xs text-white/60">Judul</label>
            <input
              value={form.title}
              onChange={(e) =>
                onChangeForm({ ...form, title: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="Nama kelas…"
            />
          </div>
          <div>
            <label className="text-xs text-white/60">Deskripsi</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                onChangeForm({ ...form, description: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="Penjelasan singkat kelas…"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs text-white/60">Mentor</label>
              <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  {mentors.map((m) => {
                    const checked = form.mentor_ids.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs
                          ${
                            checked
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                              : "border-white/10 bg-white/5 text-white/70"
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-cyan-400"
                          checked={checked}
                          onChange={(e) => {
                            onChangeForm({
                              ...form,
                              mentor_ids: toggleId(
                                form.mentor_ids,
                                m.id,
                                e.target.checked,
                              ),
                            });
                          }}
                        />
                        <Users2 className="h-3.5 w-3.5" />
                        {m.name}
                      </label>
                    );
                  })}
                </div>
                <div className="mt-1 text-[11px] text-white/50">
                  Pilih minimal 1 mentor.
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-white/60">
                Kurikulum Terkait
              </label>
              <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
                <div className="flex flex-wrap gap-2">
                  {curriculum.map((c) => {
                    const checked = form.curriculum_ids.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs
                          ${
                            checked
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                              : "border-white/10 bg-white/5 text-white/70"
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-cyan-400"
                          checked={checked}
                          onChange={(e) => {
                            onChangeForm({
                              ...form,
                              curriculum_ids: toggleId(
                                form.curriculum_ids,
                                c.id,
                                e.target.checked,
                              ),
                            });
                          }}
                        />
                        <Tag className="h-3.5 w-3.5" />
                        {c.code}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-white/60">Harga (Rp)</label>
              <input
                type="number"
                value={form.price}
                min={0}
                onChange={(e) =>
                  onChangeForm({
                    ...form,
                    price: Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-cyan-400"
                  checked={form.visible}
                  onChange={(e) =>
                    onChangeForm({
                      ...form,
                      visible: e.target.checked,
                    })
                  }
                />
                Tampilkan di landing
              </label>
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

function toggleId(list: string[], id: string, checked: boolean) {
  const set = new Set(list);
  if (checked) set.add(id);
  else set.delete(id);
  return Array.from(set);
}
