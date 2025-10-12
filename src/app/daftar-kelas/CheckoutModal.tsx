"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { rupiah } from "../../../lib/format";
import { CheckoutInfo } from "@/types/catalog";

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
  submitting,
  submitErr,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  info: CheckoutInfo | null;
  total: number;
  senderName: string;
  setSenderName: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  setFile: (f: File | null) => void;
  submitting: boolean;
  submitErr: string | null;
  onSubmit: () => void;
}) {
  return (
    <AnimatePresence>
      {open && info && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60"
            onClick={() => !submitting && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-[81] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            <div className="mb-3 text-white font-semibold">Konfirmasi Pembayaran</div>
            <div className="grid gap-3 text-sm">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/70">Transfer ke</div>
                <div className="mt-1 text-white">
                  <div>Bank: <b>{info.bank_name}</b></div>
                  <div>No. Rekening: <b className="tracking-wider">{info.bank_account}</b></div>
                  <div>Atas Nama: <b>{info.bank_holder}</b></div>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-white/70">Nominal</div>
                <div className="mt-1 text-white text-lg font-semibold">{rupiah(total)}</div>
              </div>

              <div>
                <label className="text-xs text-white/60">Nomor Rekening Anda</label>
                <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Pemilik Rekening Anda</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Upload bukti transfer (jpg/png)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="cursor-pointer mt-1 w-full text-white/80"
                />
                {submitErr && <div className="mt-2 text-xs text-rose-300 cursor-pointer">{submitErr}</div>}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose} disabled={submitting}>
                Batal
              </Button>
              <Button variant="secondary" onClick={onSubmit} disabled={submitting}>
                {submitting ? "Mengirim…" : "Selesai"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
