"use client";

import imageCompression from "browser-image-compression";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useGlobalError } from "@/components/providers/ErrorProvider";
import type {
  CartLine,
  CheckoutInfo,
  ClassItem,
  ClassOffer,
  PackageItem,
} from "@/types/catalog";
import { fetchCheckoutInfo, postJSON, uploadFile } from "../../../lib/api";
import { rupiah } from "../../../lib/format";
import CheckoutModal from "./CheckoutModal";
import SuccessModal from "./SuccessModal";

export default function CartDrawer({
  openButtonSelector,
  lines,
  classes,
  packages = [],
  onRemove,
  onClear,
  total,
}: {
  openButtonSelector: string;
  lines: CartLine[];
  classes: ClassItem[];
  packages?: PackageItem[];
  onRemove: (key: string) => void;
  onClear: () => void;
  total: number;
}) {
  const { showError } = useGlobalError();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = document.querySelector(openButtonSelector);
    if (!el) return;
    const fn = () => setOpen(true);
    el.addEventListener("click", fn);
    return () => el.removeEventListener("click", fn);
  }, [openButtonSelector]);

  const maps = useMemo(() => {
    return {
      classes: new Map(classes.map((item) => [item.id, item])),
      packages: new Map(packages.map((item) => [item.id, item])),
    };
  }, [classes, packages]);

  type ResolvedLine =
    | {
        line: Extract<CartLine, { itemType: "package" }>;
        item: PackageItem;
        offer?: undefined;
      }
    | {
        line: Extract<CartLine, { itemType: "class" }>;
        item: ClassItem;
        offer: ClassOffer;
      };

  const full = lines.reduce<ResolvedLine[]>((resolved, line) => {
    if (line.itemType === "package") {
      const item = maps.packages.get(line.itemId);
      if (item) resolved.push({ line, item });
      return resolved;
    }
    const item = maps.classes.get(line.itemId);
    const offer = item?.offers.find(
      (candidate) => candidate.id === line.offerId,
    );
    if (item && offer) resolved.push({ line, item, offer });
    return resolved;
  }, []);

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
    } catch (error: unknown) {
      showError(
        error instanceof Error ? error.message : "Gagal memuat info checkout",
      );
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
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const proofPath = await uploadFile(compressedFile);

      const items = full.map(({ line }) => ({
        item_id: line.itemId,
        item_type: line.itemType,
        offer_id: line.itemType === "class" ? line.offerId : undefined,
        qty: 1,
      }));

      await postJSON("/orders", {
        items,
        sender_name: senderName || undefined,
        note: note || undefined,
        proof_path: proofPath,
      });
      setCheckoutOpen(false);
      setSuccessOpen(true);
      onClear();
      setOpen(false);
    } catch (error: unknown) {
      setSubmitErr(error instanceof Error ? error.message : "Gagal checkout");
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
                  <span className="text-lg font-bold text-white">
                    Keranjang Saya
                  </span>
                </div>
                <button
                  type="button"
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
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-64 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <ShoppingBag className="w-8 h-8 text-slate-600" />
                      </div>
                      <p className="text-slate-400">Keranjang masih kosong.</p>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="cursor-pointer mt-4 text-cyan-400 text-sm hover:underline"
                      >
                        Cari kelas dulu
                      </button>
                    </motion.div>
                  ) : (
                    full.map(({ line, item, offer }) => (
                      <motion.div
                        key={line.key}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {item.title}
                          </h4>
                          <p className="text-xs text-cyan-400 font-mono mt-1">
                            {rupiah(offer?.price ?? item.price)}
                          </p>
                          {offer && (
                            <p className="mt-1 text-xs text-slate-500">
                              {offer.meeting_count} pertemuan
                            </p>
                          )}
                        </div>

                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => onRemove(line.key)}
                            aria-label={`Hapus ${item.title}`}
                            className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
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
                    <span className="text-slate-400 text-sm">
                      Total Pembayaran
                    </span>
                    <span className="text-xl font-bold text-white font-mono">
                      {rupiah(total)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={onClear}
                      className="cursor-pointer col-span-1 flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
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
