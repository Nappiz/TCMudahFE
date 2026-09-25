"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Package,
  Sparkles,
  UserCircle2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  ClassItem,
  Curriculum,
  Mentor,
  PackageItem,
} from "@/types/catalog";
import { rupiah } from "../../../lib/format";

export default function ClassCard({
  item,
  mentor,
  idxCur,
  selected,
  selectedOfferId,
  onSelectClass,
  onSelectPackage,
  onRemove,
  onAddToCartAnim,
}: {
  item: ClassItem | PackageItem;
  mentor?: Mentor;
  idxCur: Map<string, Curriculum>;
  selected: boolean;
  selectedOfferId?: string;
  onSelectClass: (classId: string, offerId: string) => void;
  onSelectPackage: (packageId: string) => void;
  onRemove: (item: ClassItem | PackageItem) => void;
  onAddToCartAnim?: (e: React.MouseEvent) => void;
}) {
  const isPackage = "class_ids" in item;
  const klass = isPackage ? null : item;
  const visibleOffers = useMemo(
    () =>
      (klass?.offers ?? [])
        .filter((offer) => offer.visible)
        .sort(
          (a, b) =>
            a.sort_order - b.sort_order || a.meeting_count - b.meeting_count,
        ),
    [klass],
  );
  const defaultOffer =
    visibleOffers.find((offer) => offer.id === selectedOfferId) ??
    visibleOffers.find((offer) => offer.is_recommended) ??
    visibleOffers[0];
  const [chooserOpen, setChooserOpen] = useState(false);
  const [choiceId, setChoiceId] = useState(defaultOffer?.id ?? "");

  useEffect(() => {
    if (defaultOffer) setChoiceId(defaultOffer.id);
  }, [defaultOffer]);

  const minPrice = visibleOffers.length
    ? Math.min(...visibleOffers.map((offer) => offer.price))
    : item.price;

  function addPackage(e: React.MouseEvent) {
    if (selected) {
      onRemove(item);
      return;
    }
    onSelectPackage(item.id);
    onAddToCartAnim?.(e);
  }

  function confirmClass(e: React.MouseEvent) {
    if (!klass || !choiceId) return;
    onSelectClass(klass.id, choiceId);
    setChooserOpen(false);
    onAddToCartAnim?.(e);
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 ${
          selected
            ? "border-cyan-500/30 bg-slate-900/80 shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)]"
            : "border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60"
        }`}
      >
        {selected && (
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-500 to-blue-500" />
        )}
        <div className="flex h-full flex-col p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold leading-tight text-white transition-colors group-hover:text-cyan-200">
                {item.title}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                <UserCircle2 className="h-4 w-4 text-slate-500" />
                <span>{mentor?.name || "Tim TC Mudah"}</span>
              </div>
            </div>
            <span className="shrink-0 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-right font-mono text-sm font-semibold text-cyan-400">
              {!isPackage && visibleOffers.length > 1 && (
                <span className="block font-sans text-[9px] font-medium uppercase tracking-wider text-slate-500">
                  Mulai
                </span>
              )}
              {rupiah(isPackage ? item.price : minPrice)}
            </span>
          </div>

          <p className="mb-6 min-h-[40px] line-clamp-2 text-sm text-slate-400">
            {item.description}
          </p>

          <div className="mb-6 mt-auto flex flex-wrap gap-2">
            {isPackage ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                <Package className="h-3 w-3" /> {item.class_ids.length} kelas
                bundle
              </span>
            ) : (
              <>
                {visibleOffers.length > 0 && (
                  <span className="inline-flex items-center rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-300">
                    {visibleOffers
                      .map((offer) => offer.meeting_count)
                      .join(" atau ")}{" "}
                    pertemuan
                  </span>
                )}
                {item.curriculum_ids.slice(0, 3).map((id) => {
                  const curriculum = idxCur.get(id);
                  if (!curriculum) return null;
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.02] px-2 py-1 text-[10px] text-slate-300"
                    >
                      <BookOpen className="h-3 w-3 opacity-50" />{" "}
                      {curriculum.code}
                    </span>
                  );
                })}
              </>
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={isPackage ? addPackage : () => setChooserOpen(true)}
              disabled={!isPackage && visibleOffers.length === 0}
              className={`flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selected && isPackage
                  ? "border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  : "bg-white text-slate-950 shadow-lg shadow-white/5 hover:bg-cyan-50"
              }`}
            >
              {selected && isPackage ? (
                "Hapus dari Keranjang"
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-cyan-600" />
                  {selected
                    ? "Ubah Pilihan"
                    : isPackage
                      ? "Ambil Bundle"
                      : "Pilih Pertemuan"}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {chooserOpen && klass && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
            <motion.button
              type="button"
              aria-label="Tutup pilihan"
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
              onClick={() => setChooserOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.98 }}
              className="relative z-10 w-full max-w-lg rounded-t-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:rounded-3xl"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Pilih paket pertemuan
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    {klass.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setChooserOpen(false)}
                  className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {visibleOffers.map((offer) => {
                  const active = choiceId === offer.id;
                  const saving = offer.list_price - offer.price;
                  return (
                    <button
                      type="button"
                      key={offer.id}
                      onClick={() => setChoiceId(offer.id)}
                      className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-colors ${active ? "border-cyan-400/50 bg-cyan-400/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-white">
                              {offer.meeting_count} Pertemuan
                            </span>
                            {offer.is_recommended && (
                              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                                Paling Hemat
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            {rupiah(
                              Math.round(offer.price / offer.meeting_count),
                            )}
                            /pertemuan
                            {saving > 0 && ` • Hemat ${rupiah(saving)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            {saving > 0 && (
                              <div className="text-xs text-slate-500 line-through">
                                {rupiah(offer.list_price)}
                              </div>
                            )}
                            <div className="font-mono font-bold text-cyan-300">
                              {rupiah(offer.price)}
                            </div>
                          </div>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border ${active ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-slate-600"}`}
                          >
                            {active && <Check className="h-3.5 w-3.5" />}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={confirmClass}
                disabled={!choiceId}
                className="mt-6 h-12 w-full cursor-pointer rounded-xl bg-cyan-500 font-bold text-white transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {selected ? "Simpan Perubahan" : "Tambahkan ke Keranjang"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
