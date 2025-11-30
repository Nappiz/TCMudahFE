"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { rupiah } from "../../../lib/format";
import { CheckoutInfo } from "@/types/catalog";
import { CreditCard, UploadCloud, X, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

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
  file?: File | null;
  submitting: boolean;
  submitErr: string | null;
  onSubmit: () => void;
}) {
  return (
    <AnimatePresence>
      {open && info && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm"
            onClick={() => !submitting && onClose()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-[81] w-[92vw] max-w-lg rounded-2xl border border-white/10 bg-slate-900 shadow-2xl p-6 max-h-[90vh] overflow-y-auto scrollbar-hide"
            initial={{ scale: 0.95, opacity: 0, x: "-50%", y: "-45%" }} 
            animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
            exit={{ scale: 0.95, opacity: 0, x: "-50%", y: "-45%" }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Selesaikan Pembayaran</h3>
                <button onClick={onClose} disabled={submitting} className="cursor-pointer text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 p-5 text-white shadow-lg shrink-0">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
                    <div className="flex justify-between items-start mb-6">
                        <CreditCard className="w-8 h-8 opacity-80" />
                        <span className="font-mono font-bold text-lg">{info.bank_name}</span>
                    </div>
                    <div className="mb-2">
                        <div className="text-xs opacity-70 uppercase tracking-wider">No. Rekening</div>
                        <div className="font-mono text-xl tracking-widest">{info.bank_account}</div>
                    </div>
                    <div>
                        <div className="text-xs opacity-70 uppercase tracking-wider">Atas Nama</div>
                        <div className="font-medium">{info.bank_holder}</div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-slate-400 text-sm">Total Tagihan</span>
                    <span className="text-cyan-400 font-bold text-lg font-mono">{rupiah(total)}</span>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">Nama Pengirim</label>
                            <input
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                placeholder="Nama di rekening"
                                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-400">Catatan (Opsional)</label>
                            <input
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="e.g. Pembayaran Dasprog"
                                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400">Bukti Transfer</label>
                        
                        {!file ? (
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                    className="peer absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center transition-all group-hover:bg-white/[0.05] group-hover:border-cyan-500/50 group-active:scale-[0.99]">
                                    <div className="mb-3 rounded-full bg-white/5 p-2 text-slate-400 group-hover:text-cyan-400 transition-colors">
                                        <UploadCloud className="h-6 w-6" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-300">
                                        Klik atau seret gambar ke sini
                                    </span>
                                    <span className="mt-1 text-xs text-slate-500">
                                        Format JPG/PNG (Max. 5MB)
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 pr-10"
                            >
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-950 border border-white/10">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt="Preview Bukti" 
                                        className="h-full w-full object-cover"
                                        onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)} // Prevent memory leak
                                    />
                                </div>
                                
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-white">{file.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-600"></span>
                                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Siap diupload
                                        </span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setFile(null)}
                                    className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Hapus file"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </motion.div>
                        )}

                        {submitErr && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: "auto" }}
                                className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-300 border border-red-500/20"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" /> {submitErr}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-white/5">
              <Button variant="ghost" onClick={onClose} disabled={submitting}>
                Batal
              </Button>
              <Button 
                variant="secondary" 
                onClick={onSubmit} 
                disabled={submitting}
                className="cursor-pointer bg-cyan-500 hover:bg-cyan-400 text-white border-none shadow-lg shadow-cyan-500/20"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2"/> Memproses</> : "Konfirmasi Pembayaran"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}