"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button"; 
import { rupiah } from "../../../lib/format";
import { fetchCheckoutInfo, postJSON, uploadFile } from "../../../lib/api";
import { CartLine, ClassItem, CheckoutInfo } from "@/types/catalog";
import CheckoutModal from "./CheckoutModal";
import SuccessModal from "./SuccessModal";

export default function CartDrawer({
  openButtonSelector,
  lines,
  classes,
  onInc,
  onDec,
  onClear,
  total,
}: {
  openButtonSelector: string;
  lines: CartLine[];
  classes: ClassItem[];
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onClear: () => void;
  total: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = document.querySelector(openButtonSelector);
    if (!el) return;
    const fn = () => setOpen(true);
    el.addEventListener("click", fn);
    return () => el.removeEventListener("click", fn);
  }, [openButtonSelector]);

  const map = useMemo(() => new Map(classes.map((c) => [c.id, c])), [classes]);
  const full = lines
    .map((l) => ({ line: l, item: map.get(l.id) }))
    .filter((x) => x.item) as { line: CartLine; item: ClassItem }[];

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [info, setInfo] = useState<CheckoutInfo | null>(null);
  const [senderName, setSenderName] = useState("");
  const [note, setNote] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);

  async function openCheckout() {
    try {
      const i = await fetchCheckoutInfo();
      setInfo(i);
      setCheckoutOpen(true);
    } catch (e: any) {
      alert(e?.message || "Gagal memuat info checkout");
    }
  }

  async function doCheckout() {
    if (!file) {
      setSubmitErr("Mohon unggah bukti transfer (gambar).");
      return;
    }
    if (full.length === 0) return;
    setSubmitting(true);
    setSubmitErr(null);
    try {
      const url = await uploadFile(file);
      const items = full.map(({ line }) => ({ class_id: line.id, qty: line.qty }));
      await postJSON("/orders", {
        items,
        sender_name: senderName || undefined,
        note: note || undefined,
        proof_url: url,
      });
      setCheckoutOpen(false);
      setSuccessOpen(true);
      onClear();
      setOpen(false); 
    } catch (e: any) {
      setSubmitErr(e?.message || "Gagal checkout");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed right-0 top-0 z-[71] h-full w-full max-w-md border-l border-white/10 bg-slate-900 shadow-2xl flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-cyan-400" />
                    <span className="text-lg font-bold text-white">Keranjang Saya</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="cursor-pointer p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <AnimatePresence initial={false} mode="popLayout">
                  {full.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-64 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                          <ShoppingBag className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-400">Keranjang masih kosong.</p>
                      <button onClick={() => setOpen(false)} className="cursor-pointer mt-4 text-cyan-400 text-sm hover:underline">
                          Cari kelas dulu
                      </button>
                    </motion.div>
                  ) : (
                    full.map(({ line, item }) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                      >
                        <div className="flex-1 min-w-0">
                           <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                           <p className="text-xs text-cyan-400 font-mono mt-1">{rupiah(item.price)}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button onClick={() => onDec(item.id)} className="cursor-pointer p-1 rounded-md bg-white/10 hover:bg-white/20 text-white">
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-mono text-white w-4 text-center">{line.qty}</span>
                            <button onClick={() => onInc(item.id)} className="cursor-pointer p-1 rounded-md bg-white/10 hover:bg-white/20 text-white">
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {full.length > 0 && (
                  <div className="p-5 border-t border-white/10 bg-slate-900">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-400 text-sm">Total Pembayaran</span>
                        <span className="text-xl font-bold text-white font-mono">{rupiah(total)}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                        <button 
                            onClick={onClear}
                            className="cursor-pointer col-span-1 flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={openCheckout}
                            className="cursor-pointer col-span-2 flex items-center justify-center gap-2 rounded-xl bg-white text-slate-950 hover:bg-cyan-50 text-sm font-bold h-12 transition-colors"
                        >
                            Checkout <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        info={info}
        total={total}
        senderName={senderName}
        setSenderName={setSenderName}
        note={note}
        setNote={setNote}
        setFile={setFile}
        file={file} 
        submitting={submitting}
        submitErr={submitErr}
        onSubmit={doCheckout}
      />
      <SuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        groupLink={info?.group_link || "#"}
      />
    </>
  );
}