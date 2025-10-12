"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function SuccessModal({
  open,
  onClose,
  groupLink,
}: {
  open: boolean;
  onClose: () => void;
  groupLink: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-[81] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5 text-center"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            <div className="text-white text-lg font-semibold">Terima kasih! 🎉</div>
            <div className="mt-2 text-white/70 text-sm">
              Bukti sudah kami terima. Admin akan memverifikasi pembayaranmu.
              Setelah disetujui, akses dashboard peserta akan terbuka.
            </div>
            <a
              href={"https://chat.whatsapp.com/GtwoxPC0N2nGP9Ay8Wa13g?mode=wwt"}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
            >
              Gabung ke Grup
            </a>
            <div className="mt-4">
              <Button variant="secondary" onClick={onClose}>
                Tutup
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
