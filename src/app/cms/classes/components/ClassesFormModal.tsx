"use client";

import { X, Save, Users2, Tag, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ClassItem } from "../../../../../lib/classes";
import type { Mentor } from "../../../../../lib/mentors";
import type { CurriculumItem } from "../../../../../lib/curriculum";

type Mode = "class" | "package";

export type UnifiedForm = {
  title: string;
  description: string;
  price: number;
  visible: boolean;
  mentor_ids: string[];
  curriculum_ids: string[];
  class_ids: string[];
};

type Props = {
  open: boolean;
  mode: Mode;
  editing: any | null;
  form: UnifiedForm;
  mentors: Mentor[];
  curriculum: CurriculumItem[];
  availableClasses: ClassItem[];
  saving: boolean;
  onChangeForm: (form: UnifiedForm) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function ClassesFormModal({
  open,
  mode,
  editing,
  form,
  mentors,
  curriculum,
  availableClasses,
  saving,
  onChangeForm,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  const isPackage = mode === "package";

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !saving && onClose()}
      />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="text-white font-bold text-lg">
            {editing
              ? `Edit ${isPackage ? "Paket" : "Kelas"}`
              : `Tambah ${isPackage ? "Paket" : "Kelas"}`}
          </div>
          <button
            onClick={() => !saving && onClose()}
            className="rounded-lg border border-white/15 p-2 text-white/80 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Judul</label>
            <input
              value={form.title}
              onChange={(e) =>
                onChangeForm({ ...form, title: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-500/50 transition-colors"
              placeholder={`Nama ${isPackage ? "paket" : "kelas"}...`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Deskripsi</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                onChangeForm({ ...form, description: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-500/50 transition-colors"
              placeholder="Penjelasan singkat..."
            />
          </div>

          {!isPackage ? (
            /* ================= FORM UNTUK KELAS ================= */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Mentor</label>
                <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 max-h-48 overflow-y-auto">
                  <div className="flex flex-col gap-2">
                    {mentors.map((m) => {
                      const checked = form.mentor_ids.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs cursor-pointer transition-colors
                            ${checked
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                              : "border-white/5 bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-cyan-400 rounded"
                            checked={checked}
                            onChange={(e) => {
                              onChangeForm({
                                ...form,
                                mentor_ids: toggleId(
                                  form.mentor_ids,
                                  m.id,
                                  e.target.checked
                                ),
                              });
                            }}
                          />
                          <Users2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Kurikulum Terkait
                </label>
                <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 max-h-48 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {curriculum.map((c) => {
                      const checked = form.curriculum_ids.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs cursor-pointer transition-colors
                            ${checked
                              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                              : "border-white/5 bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-cyan-400 rounded"
                            checked={checked}
                            onChange={(e) => {
                              onChangeForm({
                                ...form,
                                curriculum_ids: toggleId(
                                  form.curriculum_ids,
                                  c.id,
                                  e.target.checked
                                ),
                              });
                            }}
                          />
                          <Tag className="h-3 w-3 shrink-0" />
                          {c.code}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= FORM UNTUK PAKET ================= */
            <div>
              <label className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">
                Pilih Kelas untuk Paket Ini
              </label>
              <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 p-3 max-h-48 overflow-y-auto">
                {availableClasses.length === 0 ? (
                  <p className="text-sm text-white/40 italic">Belum ada kelas yang tersedia.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableClasses.map((c) => {
                      const checked = form.class_ids.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`flex items-start gap-2 rounded-lg border p-2 text-sm cursor-pointer transition-colors
                            ${checked
                              ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                              : "border-white/5 bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-amber-400 mt-0.5 rounded shrink-0"
                            checked={checked}
                            onChange={(e) => {
                              onChangeForm({
                                ...form,
                                class_ids: toggleId(
                                  form.class_ids,
                                  c.id,
                                  e.target.checked
                                ),
                              });
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-medium truncate flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> {c.title}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
            <div>
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Harga (Rp)</label>
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
                className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-500/50"
              />
            </div>
            <div className="sm:col-span-2 flex items-center pt-5">
              <label className="inline-flex items-center gap-3 text-sm text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-cyan-400 rounded"
                  checked={form.visible}
                  onChange={(e) =>
                    onChangeForm({
                      ...form,
                      visible: e.target.checked,
                    })
                  }
                />
                Tampilkan
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button
            variant="secondary"
            onClick={onSubmit}
            disabled={saving}
            className={`inline-flex items-center gap-2 ${isPackage ? "bg-amber-600 hover:bg-amber-500" : "bg-cyan-600 hover:bg-cyan-500"} text-white border-none`}
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