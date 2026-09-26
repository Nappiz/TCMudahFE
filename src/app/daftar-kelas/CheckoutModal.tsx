"use client";

import { motion } from "framer-motion";
import Modal from "@/components/modal/Modal";
import type { CheckoutInfo } from "@/types/catalog";
import { rupiah } from "../../../lib/format";

type CheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  info: CheckoutInfo | null;
  total: number;
  senderName: string;
  setSenderName: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  setFile: (file: File | null) => void;
  file?: File | null;
  submitting: boolean;
  submitErr: string | null;
  onSubmit: () => void;
};

const inputClassName =
  "h-11 w-full rounded-xl border border-white/[0.09] bg-[#071114]/75 px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/[0.14] focus:border-cyan-100/35 focus:ring-4 focus:ring-cyan-100/[0.06]";

export default function CheckoutModal({
  open,
  onClose,
  info,
  total,
  senderName,
  setSenderName,
  note,
  setNote,
  setFile,
  file,
  submitting,
  submitErr,
  onSubmit,
}: CheckoutModalProps) {
  if (!info) {
    return (
      <Modal open={false} onClose={onClose} title="Selesaikan Pembayaran" />
    );
  }

  return (
    <Modal
      open={open}
      onClose={() => !submitting && onClose()}
      dismissible={!submitting}
      title="Selesaikan Pembayaran"
      description="Transfer sesuai jumlah berikut, lalu lampirkan bukti pembayaran."
      size="md"
      mobilePosition="bottom"
      actions={[
        {
          label: "Kembali",
          variant: "ghost",
          onClick: onClose,
          disabled: submitting,
        },
        {
          label: "Konfirmasi pembayaran",
          loadingLabel: "Mengirim pembayaran...",
          variant: "primary",
          onClick: onSubmit,
          loading: submitting,
        },
      ]}
    >
      <div className="space-y-5">
        <section
          aria-label="Informasi rekening tujuan"
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a171a]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-4 py-3.5 sm:px-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Transfer ke rekening
            </span>
            <span className="text-sm font-semibold text-cyan-100/85">
              {info.bank_name}
            </span>
          </div>
          <dl className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:px-5 sm:py-5">
            <div>
              <dt className="text-[10px] font-medium uppercase tracking-[0.13em] text-slate-500">
                Nomor rekening
              </dt>
              <dd className="mt-1.5 break-all font-mono text-xl font-semibold tracking-[0.06em] text-white sm:text-2xl">
                {info.bank_account}
              </dd>
            </div>
            <div className="sm:text-right">
              <dt className="text-[10px] font-medium uppercase tracking-[0.13em] text-slate-500">
                Atas nama
              </dt>
              <dd className="mt-1.5 text-sm font-medium text-white/85">
                {info.bank_holder}
              </dd>
            </div>
          </dl>
        </section>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-cyan-100/[0.11] bg-cyan-100/[0.045] px-4 py-3.5">
          <span className="text-sm text-slate-300/75">Total pembayaran</span>
          <span className="text-lg font-semibold tracking-tight text-cyan-50">
            {rupiah(total)}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="sender-name"
              className="text-xs font-medium text-slate-300/75"
            >
              Nama pengirim
            </label>
            <input
              id="sender-name"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
              placeholder="Sesuai nama di rekening"
              autoComplete="name"
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="payment-note"
              className="text-xs font-medium text-slate-300/75"
            >
              Catatan <span className="text-slate-500">(opsional)</span>
            </label>
            <input
              id="payment-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Contoh: pembayaran Daspro"
              className={inputClassName}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <div>
            <p className="text-xs font-medium text-slate-200/80">
              Bukti transfer
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Gambar JPG atau PNG, maksimal 5 MB.
            </p>
          </div>

          {file ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200/[0.14] bg-emerald-200/[0.04] p-3.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white/90">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-emerald-100/60">
                  {(file.size / 1024).toFixed(0)} KB · siap diunggah
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="shrink-0 cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/40"
              >
                Ganti file
              </button>
            </motion.div>
          ) : (
            <div>
              <input
                key={file?.name ?? "empty"}
                id="proof-file"
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="peer sr-only"
              />
              <label
                htmlFor="proof-file"
                className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.14] bg-white/[0.018] px-4 py-5 text-center transition hover:border-cyan-100/25 hover:bg-cyan-100/[0.025] peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-100/45"
              >
                <span className="text-sm font-medium text-white/80">
                  Pilih gambar bukti transfer
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  Klik untuk memilih file dari perangkat
                </span>
              </label>
            </div>
          )}

          {submitErr ? (
            <div
              role="alert"
              className="rounded-xl border border-rose-200/[0.12] bg-rose-200/[0.04] px-3.5 py-3 text-xs leading-5 text-rose-100/80"
            >
              {submitErr}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
