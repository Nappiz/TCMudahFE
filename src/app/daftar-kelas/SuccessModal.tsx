"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, MessageCircle } from "lucide-react";

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
            className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <motion.div
            className="fixed left-1/2 top-1/2 z-[81] w-[90vw] max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl"
            
            initial={{ scale: 0.9, opacity: 0, x: "-50%", y: "-45%" }}
            animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 0.9, opacity: 0, x: "-50%", y: "-45%" }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-400 ring-1 ring-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
               <CheckCircle2 className="h-10 w-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-white">Pembayaran Diterima!</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Terima kasih sudah mendaftar. Admin kami sedang memverifikasi datamu. Silakan tunggu update selanjutnya.
            </p>

            <div className="mt-8 space-y-3">
                <a
                  href={groupLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white hover:bg-[#20bd5a] transition-colors shadow-lg shadow-green-900/20"
                >
                  <MessageCircle className="w-4 h-4" /> Gabung Grup WhatsApp
                </a>
                <Button variant="ghost" onClick={onClose} className="w-full">
                  Tutup
                </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}