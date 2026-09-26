"use client";

import Modal from "@/components/modal/Modal";
import type {
  Testimonial,
  TestimonialForm,
} from "../../../../../lib/testimonials";

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
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={editing ? "Edit Testimoni" : "Tambah Testimoni"}
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
        <div>
          <label htmlFor="testimonial-name" className="text-xs text-white/60">
            Nama
          </label>
          <input
            id="testimonial-name"
            value={form.name}
            onChange={(event) =>
              onChangeForm({ ...form, name: event.target.value })
            }
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-300/40"
            placeholder="Alya - IF'24"
          />
        </div>
        <div>
          <label htmlFor="testimonial-text" className="text-xs text-white/60">
            Kutipan
          </label>
          <textarea
            id="testimonial-text"
            value={form.text}
            onChange={(event) =>
              onChangeForm({ ...form, text: event.target.value })
            }
            rows={4}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-300/40"
            placeholder="Tulis testimoni singkat..."
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="visible"
            type="checkbox"
            checked={form.visible}
            onChange={(event) =>
              onChangeForm({ ...form, visible: event.target.checked })
            }
            className="h-4 w-4 accent-cyan-400"
          />
          <label htmlFor="visible" className="text-sm text-white/70">
            Tampilkan di landing
          </label>
        </div>
      </div>
    </Modal>
  );
}
