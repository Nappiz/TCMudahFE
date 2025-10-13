"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import IconButton from "./IconButton";
import { rupiah } from "../../../lib/format";
import { api, fetchCheckoutInfo, postJSON, uploadFile } from "../../../lib/api";
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
    } catch (e: any) {
      setSubmitErr(e?.message || "Gagal checkout");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-black/60"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed right-0 top-0 z-[71] h-full w-[92vw] max-w-md rounded-l-2xl border-l border-white/10 bg-slate-950 p-5 shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-white font-semibold">Keranjang</div>
                <button
                  onClick={() => setOpen(false)}
                  className="cursor-pointer rounded-lg border border-white/15 px-3 py-1 text-sm text-white/80"
                >
                  Tutup
                </button>
              </div>

              <AnimatePresence initial={false} mode="popLayout">
                {full.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70"
                  >
                    Keranjang masih kosong.
                  </motion.div>
                ) : (
                  <motion.div key="list" className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: "60vh" }}>
                    <AnimatePresence initial={false}>
                      {full.map(({ line, item }) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 280, damping: 22 }}
                          className="rounded-xl border border-white/10 bg-white/5 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-white font-medium">{item.title}</div>
                              <div className="text-xs text-white/60">{rupiah(item.price)}</div>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
                              <IconButton onClick={() => onDec(item.id)}>
                                <Minus className="h-4 w-4" />
                              </IconButton>
                              <span className="min-w-[2ch] text-center text-white">{line.qty}</span>
                              <IconButton onClick={() => onInc(item.id)}>
                                <Plus className="h-4 w-4" />
                              </IconButton>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm">Total</span>
                  <span className="text-lg font-semibold">{rupiah(total)}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button variant="ghost" onClick={onClear} className="w-full">
                    Kosongkan
                  </Button>
                  <Button variant="secondary" disabled={full.length === 0} className="w-full" onClick={openCheckout}>
                    Checkout
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
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
