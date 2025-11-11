"use client";

import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Testimonial, TestimonialForm } from "../../../../../lib/testimonials";

type Props = {
  open: boolean;
  editing: Testimonial | null;
  form: TestimonialForm;
  saving: boolean;
  onChangeForm: (form: TestimonialForm) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function TestimonialsFormModal({
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
            {editing ? "Edit Testimoni" : "Tambah Testimoni"}
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
            <label className="text-xs text-white/60">Nama</label>
            <input
              value={form.name}
              onChange={(e) =>
                onChangeForm({ ...form, name: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="Alya — IF'24"
            />
          </div>
          <div>
            <label className="text-xs text-white/60">Kutipan</label>
            <textarea
              value={form.text}
              onChange={(e) =>
                onChangeForm({ ...form, text: e.target.value })
              }
              rows={4}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="Tulis testimoni singkat…"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="visible"
              type="checkbox"
              checked={form.visible}
              onChange={(e) =>
                onChangeForm({ ...form, visible: e.target.checked })
              }
              className="h-4 w-4 accent-cyan-400"
            />
            <label
              htmlFor="visible"
              className="text-sm text-white/70"
            >
              Tampilkan di landing
            </label>
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
