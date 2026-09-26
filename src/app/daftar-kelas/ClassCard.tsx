"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/modal/Modal";
import type {
  ClassItem,
  Curriculum,
  Mentor,
  PackageItem,
} from "@/types/catalog";
import { rupiah } from "../../../lib/format";

const detailTagClassName =
  "inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 text-[10px] font-medium text-slate-300";

export default function ClassCard({
  item,
  mentor,
  idxCur,
  selected,
  selectedOfferId,
  onSelectClass,
  onSelectPackage,
  onRemove,
}: {
  item: ClassItem | PackageItem;
  mentor?: Mentor;
  idxCur: Map<string, Curriculum>;
  selected: boolean;
  selectedOfferId?: string;
  onSelectClass: (classId: string, offerId: string) => void;
  onSelectPackage: (packageId: string) => void;
  onRemove: (item: ClassItem | PackageItem) => void;
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
  const curriculumCodes = !isPackage
    ? item.curriculum_ids
        .map((id) => idxCur.get(id)?.code)
        .filter((code): code is string => !!code)
        .slice(0, 3)
    : [];

  function addPackage() {
    if (selected) {
      onRemove(item);
      return;
    }
    onSelectPackage(item.id);
  }

  function confirmClass() {
    if (!klass || !choiceId) return;
    onSelectClass(klass.id, choiceId);
    setChooserOpen(false);
  }

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={
          "group relative flex h-full flex-col overflow-hidden rounded-[26px] border bg-[#0c171b]/90 transition duration-300 " +
          (selected
            ? "border-cyan-200/30 shadow-[0_16px_50px_rgba(34,211,238,0.08)]"
            : "border-white/[0.075] hover:-translate-y-1 hover:border-white/[0.14] hover:bg-[#0e1b20] hover:shadow-[0_24px_50px_rgba(0,0,0,0.22)]")
        }
      >
        <div
          aria-hidden="true"
          className={
            "absolute inset-x-0 top-0 h-px " +
            (selected
              ? "bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent"
              : "bg-gradient-to-r from-transparent via-white/15 to-transparent")
          }
        />

        <div className="flex h-full flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/65">
              {isPackage ? "Bundle belajar" : "Kelas satuan"}
            </span>
            {selected ? (
              <span className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.07] px-2.5 py-1 text-[10px] font-medium text-cyan-100/80">
                Di keranjang
              </span>
            ) : null}
          </div>

          <div className="mt-5">
            <h3 className="text-[19px] font-semibold leading-snug tracking-tight text-white transition-colors group-hover:text-cyan-50">
              {item.title}
            </h3>
            <p className="mt-2 truncate text-xs text-slate-400">
              Mentor <span className="px-1 text-slate-600">·</span>
              {mentor?.name || "Tim TC Mudah"}
            </p>
          </div>

          <p className="mt-4 min-h-[4.25rem] line-clamp-3 text-sm leading-6 text-slate-400">
            {item.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {isPackage ? (
              <span className={detailTagClassName}>
                {item.class_ids.length} kelas dalam bundle
              </span>
            ) : (
              <>
                {visibleOffers.length > 0 ? (
                  <span className={detailTagClassName}>
                    {visibleOffers
                      .map((offer) => offer.meeting_count)
                      .join(" · ")}{" "}
                    pertemuan
                  </span>
                ) : null}
                {curriculumCodes.map((code) => (
                  <span key={code} className={detailTagClassName}>
                    {code}
                  </span>
                ))}
              </>
            )}
          </div>

          <div className="mt-auto pt-6">
            <div className="flex items-end justify-between gap-3 border-t border-white/[0.07] pt-5">
              <span className="pb-0.5 text-xs text-slate-500">
                {isPackage ? "Harga bundle" : "Mulai dari"}
              </span>
              <span className="text-lg font-semibold tracking-tight text-white">
                {rupiah(isPackage ? item.price : minPrice)}
              </span>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.985 }}
              onClick={isPackage ? addPackage : () => setChooserOpen(true)}
              disabled={!isPackage && visibleOffers.length === 0}
              className={
                "mt-4 flex h-11 w-full cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c171b] disabled:cursor-not-allowed disabled:opacity-45 " +
                (selected && isPackage
                  ? "border border-rose-200/15 bg-rose-200/[0.06] text-rose-100/80 hover:bg-rose-200/[0.1]"
                  : "bg-cyan-100 text-[#071314] shadow-[0_8px_24px_rgba(103,232,249,0.08)] hover:bg-white")
              }
            >
              {selected && isPackage
                ? "Hapus dari keranjang"
                : selected
                  ? "Ubah pilihan pertemuan"
                  : isPackage
                    ? "Pilih bundle"
                    : "Lihat paket pertemuan"}
            </motion.button>
          </div>
        </div>
      </motion.article>

      {klass ? (
        <Modal
          open={chooserOpen}
          onClose={() => setChooserOpen(false)}
          title={klass.title}
          description="Pilih paket pertemuan yang sesuai dengan ritme belajarmu."
          size="md"
          mobilePosition="bottom"
          actions={[
            {
              label: selected ? "Simpan perubahan" : "Tambahkan ke keranjang",
              onClick: confirmClass,
              disabled: !choiceId,
              variant: "primary",
              autoFocus: true,
            },
          ]}
        >
          <div className="space-y-3">
            {visibleOffers.map((offer) => {
              const active = choiceId === offer.id;
              const saving = offer.list_price - offer.price;

              return (
                <button
                  type="button"
                  key={offer.id}
                  onClick={() => setChoiceId(offer.id)}
                  aria-pressed={active}
                  className={
                    "w-full cursor-pointer rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50 " +
                    (active
                      ? "border-cyan-200/35 bg-cyan-200/[0.07]"
                      : "border-white/[0.08] bg-white/[0.025] hover:border-white/[0.15] hover:bg-white/[0.045]")
                  }
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white">
                          {offer.meeting_count} pertemuan
                        </span>
                        {offer.is_recommended ? (
                          <span className="rounded-full bg-cyan-200/[0.08] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cyan-100/75">
                            Rekomendasi
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-xs text-slate-400">
                        {rupiah(Math.round(offer.price / offer.meeting_count))}
                        <span className="text-slate-500"> / pertemuan</span>
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        {saving > 0 ? (
                          <div className="text-[11px] text-slate-500 line-through">
                            {rupiah(offer.list_price)}
                          </div>
                        ) : null}
                        <div className="font-semibold text-cyan-100">
                          {rupiah(offer.price)}
                        </div>
                        {saving > 0 ? (
                          <div className="mt-0.5 text-[10px] text-emerald-200/65">
                            Hemat {rupiah(saving)}
                          </div>
                        ) : null}
                      </div>
                      <span
                        aria-hidden="true"
                        className={
                          "flex h-5 w-5 items-center justify-center rounded-full border " +
                          (active
                            ? "border-cyan-100 bg-cyan-100"
                            : "border-white/20")
                        }
                      >
                        {active ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0c171b]" />
                        ) : null}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Modal>
      ) : null}
    </>
  );
}
