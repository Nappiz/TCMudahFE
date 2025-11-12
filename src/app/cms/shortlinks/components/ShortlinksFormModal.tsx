"use client";

import Modal from "@/components/ui/Modal";
import type { Shortlink } from "../../../../../lib/shortlinks";
import type { FormState } from "./ShortlinksPage";

type Props = {
  open: boolean;
  saving: boolean;
  editing: Shortlink | null;
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function ShortlinksFormModal({
  open,
  saving,
  editing,
  form,
  onChange,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit Shortlink" : "Tambah Shortlink"}
      variant="info"
      actions={[
        {
          label: "Batal",
          onClick: onClose,
          variant: "ghost",
        },
        {
          label: saving ? "Menyimpan…" : "Simpan",
          onClick: onSubmit,
          variant: "primary",
          disabled: saving,
          autoFocus: true,
        },
      ]}
    >
      <div className="space-y-3 text-sm">
        <div>
          <label className="text-xs text-white/60">Slug</label>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-lg bg-slate-900/80 px-2 py-1 text-xs text-white/60">
              /m/
            </span>
            <input
              value={form.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="ct: kelas-angkatan-1"
            />
          </div>
          <p className="mt-1 text-[11px] text-white/50">
            Gunakan huruf, angka, <code>-</code>, dan <code>_</code> tanpa
            spasi.
          </p>
        </div>

        <div>
          <label className="text-xs text-white/60">Target URL</label>
          <input
            value={form.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
            placeholder="https://contoh.com/halaman"
          />
        </div>

        <div>
          <label className="text-xs text-white/60">Judul (opsional)</label>
          <input
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
            placeholder="Shortlink kampanye A"
          />
        </div>

        <div>
          <label className="text-xs text-white/60">Deskripsi (opsional)</label>
          <textarea
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
            placeholder="Catatan internal untuk membedakan shortlink ini…"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="shortlink-active"
            type="checkbox"
            className="h-4 w-4 accent-cyan-400"
            checked={form.active}
            onChange={(e) => onChange({ active: e.target.checked })}
          />
          <label htmlFor="shortlink-active" className="text-xs text-white/70">
            Shortlink aktif (dapat diakses)
          </label>
        </div>
      </div>
    </Modal>
  );
}
