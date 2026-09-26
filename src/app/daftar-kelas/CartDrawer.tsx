"use client";

import imageCompression from "browser-image-compression";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
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
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-[#020809]/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              aria-label="Keranjang belanja"
              className="fixed right-0 top-0 z-[71] flex h-dvh w-full max-w-md flex-col border-l border-white/[0.08] bg-[#091417] shadow-[-24px_0_80px_rgba(0,0,0,0.35)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <header className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/55">
                    Pilihan belajar
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
                    Keranjang
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    {full.length} item dipilih
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup keranjang"
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-slate-400 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/40"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5 sm:px-6">
                <AnimatePresence initial={false} mode="popLayout">
                  {full.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] px-6 text-center"
                    >
                      <p className="text-base font-semibold text-white/85">
                        Keranjang masih kosong
                      </p>
                      <p className="mt-2 max-w-[250px] text-sm leading-6 text-slate-400">
                        Pilih kelas atau bundle yang ingin kamu pelajari.
                      </p>
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="mt-5 cursor-pointer text-sm font-medium text-cyan-100/80 transition hover:text-white focus-visible:outline-none focus-visible:underline"
                      >
                        Lihat pilihan kelas
                      </button>
                    </motion.div>
                  ) : (
                    full.map(({ line, item, offer }) => (
                      <motion.article
                        key={line.key}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="rounded-2xl border border-white/[0.075] bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.04]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/55">
                              {line.itemType === "package"
                                ? "Bundle belajar"
                                : "Kelas satuan"}
                            </p>
                            <h3 className="mt-2 truncate text-sm font-semibold text-white">
                              {item.title}
                            </h3>
                            {"class_ids" in item ? (
                              <p className="mt-1.5 text-xs text-slate-400">
                                {item.class_ids.length} kelas dalam bundle
                              </p>
                            ) : (
                              <p className="mt-1.5 text-xs text-slate-400">
                                {offer?.meeting_count} pertemuan
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemove(line.key)}
                            aria-label={`Hapus ${item.title}`}
                            className="shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-rose-200/[0.06] hover:text-rose-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-100/35"
                          >
                            Hapus
                          </button>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                          <span className="text-xs text-slate-500">Harga</span>
                          <span className="text-sm font-semibold tabular-nums text-white/85">
                            {rupiah(offer?.price ?? item.price)}
                          </span>
                        </div>
                      </motion.article>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {full.length > 0 ? (
                <footer className="border-t border-white/[0.07] bg-[#0a171a] px-5 py-5 sm:px-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Total pembayaran</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {full.length} item
                      </p>
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-white">
                      {rupiah(total)}
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                    <button
                      type="button"
                      onClick={onClear}
                      className="h-12 cursor-pointer rounded-xl border border-white/[0.09] bg-white/[0.025] px-4 text-sm font-medium text-slate-400 transition hover:border-rose-100/20 hover:bg-rose-100/[0.04] hover:text-rose-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-100/35"
                    >
                      Kosongkan
                    </button>
                    <button
                      type="button"
                      onClick={openCheckout}
                      className="h-12 cursor-pointer rounded-xl bg-cyan-100 px-4 text-sm font-semibold text-[#071314] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a171a]"
                    >
                      Lanjut pembayaran
                    </button>
                  </div>
                </footer>
              ) : null}
            </motion.aside>
          </>
        ) : null}
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
