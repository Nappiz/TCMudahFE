"use client";

import Modal from "@/components/modal/Modal";
import type {
  CurriculumForm,
  CurriculumItem,
} from "../../../../../lib/curriculum";

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
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={editing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
      size="md"
      actions={[
        {
          label: "Batal",
          onClick: onClose,
          variant: "ghost",
          disabled: saving,
        },
        {
          label: "Simpan",
          loading: saving,
          loadingLabel: "Menyimpan...",
          onClick: onSubmit,
          variant: "primary",
        },
      ]}
    >
      <div className="grid gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label htmlFor="curriculum-code" className="text-xs text-white/60">
              Kode
            </label>
            <input
              id="curriculum-code"
              value={form.code}
              onChange={(event) =>
                onChangeForm({ ...form, code: event.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-300/40"
              placeholder="IF1101"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="curriculum-name" className="text-xs text-white/60">
              Nama
            </label>
            <input
              id="curriculum-name"
              value={form.name}
              onChange={(event) =>
                onChangeForm({ ...form, name: event.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-300/40"
              placeholder="Dasar Pemrograman"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label
              htmlFor="curriculum-semester"
              className="text-xs text-white/60"
            >
              Semester
            </label>
            <select
              id="curriculum-semester"
              value={form.sem}
              onChange={(event) =>
                onChangeForm({
                  ...form,
                  sem: Number(event.target.value) as 1 | 2,
                })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-300/40"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="curriculum-blurb" className="text-xs text-white/60">
              Deskripsi
            </label>
            <input
              id="curriculum-blurb"
              value={form.blurb}
              onChange={(event) =>
                onChangeForm({ ...form, blurb: event.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-300/40"
              placeholder="Ringkasan singkat materi"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
