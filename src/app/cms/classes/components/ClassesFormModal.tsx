"use client";

import Modal from "@/components/modal/Modal";
import { ModalActionButton } from "@/components/modal/ModalActionButton";
import type { ClassItem, ClassOffer } from "../../../../../lib/classes";
import type { CurriculumItem } from "../../../../../lib/curriculum";
import type { Mentor } from "../../../../../lib/mentors";
import type { PackageItem } from "../../../../../lib/packages";

type Mode = "class" | "package";

export type UnifiedForm = {
  title: string;
  description: string;
  price: number;
  base_price_per_meeting: number;
  offers: ClassOffer[];
  visible: boolean;
  mentor_ids: string[];
  curriculum_ids: string[];
  class_ids: string[];
  items: { class_id: string; class_offer_id: string }[];
};

type Props = {
  open: boolean;
  mode: Mode;
  editing: ClassItem | PackageItem | null;
  form: UnifiedForm;
  mentors: Mentor[];
  curriculum: CurriculumItem[];
  availableClasses: ClassItem[];
  saving: boolean;
  onChangeForm: (form: UnifiedForm) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function ClassesFormModal({
  open,
  mode,
  editing,
  form,
  mentors,
  curriculum,
  availableClasses,
  saving,
  onChangeForm,
  onClose,
  onSubmit,
}: Props) {
  const isPackage = mode === "package";

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!saving}
      title={`${editing ? "Edit" : "Tambah"} ${isPackage ? "Paket" : "Kelas"}`}
      size="lg"
    >
        <div className="grid gap-4">
          <div>
            <label
              htmlFor="class-title"
              className="text-xs font-medium text-white/60 uppercase tracking-wider"
            >
              Judul
            </label>
            <input
              id="class-title"
              value={form.title}
              onChange={(e) => onChangeForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-500/50 transition-colors"
              placeholder={`Nama ${isPackage ? "paket" : "kelas"}...`}
            />
          </div>
          <div>
            <label
              htmlFor="class-description"
              className="text-xs font-medium text-white/60 uppercase tracking-wider"
            >
              Deskripsi
            </label>
            <textarea
              id="class-description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                onChangeForm({ ...form, description: e.target.value })
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-500/50 transition-colors"
              placeholder="Penjelasan singkat..."
            />
          </div>

          {!isPackage ? (
            /* ================= FORM UNTUK KELAS ================= */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <div className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Mentor
                </div>
                <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 max-h-48 overflow-y-auto">
                  <div className="flex flex-col gap-2">
                    {mentors.map((m) => {
                      const checked = form.mentor_ids.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs cursor-pointer transition-colors
                            ${
                              checked
                                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                                : "border-white/5 bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-cyan-400 rounded"
                            checked={checked}
                            onChange={(e) => {
                              onChangeForm({
                                ...form,
                                mentor_ids: toggleId(
                                  form.mentor_ids,
                                  m.id,
                                  e.target.checked,
                                ),
                              });
                            }}
                          />
                          <span className="truncate">{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Kurikulum Terkait
                </div>
                <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 max-h-48 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {curriculum.map((c) => {
                      const checked = form.curriculum_ids.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs cursor-pointer transition-colors
                            ${
                              checked
                                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                                : "border-white/5 bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-cyan-400 rounded"
                            checked={checked}
                            onChange={(e) => {
                              onChangeForm({
                                ...form,
                                curriculum_ids: toggleId(
                                  form.curriculum_ids,
                                  c.id,
                                  e.target.checked,
                                ),
                              });
                            }}
                          />
                          {c.code}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ================= FORM UNTUK PAKET ================= */
            <div>
              <div className="text-xs font-medium text-amber-400/80 uppercase tracking-wider">
                Pilih Kelas untuk Paket Ini
              </div>
              <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 p-3 max-h-48 overflow-y-auto">
                {availableClasses.length === 0 ? (
                  <p className="text-sm text-white/40 italic">
                    Belum ada kelas yang tersedia.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableClasses.map((c) => {
                      const checked = form.class_ids.includes(c.id);
                      const selectedOfferId = form.items.find(
                        (item) => item.class_id === c.id,
                      )?.class_offer_id;
                      return (
                        <label
                          key={c.id}
                          className={`flex items-start gap-2 rounded-lg border p-2 text-sm cursor-pointer transition-colors
                            ${
                              checked
                                ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                                : "border-white/5 bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-amber-400 mt-0.5 rounded shrink-0"
                            checked={checked}
                            onChange={(e) => {
                              const nextClassIds = toggleId(
                                form.class_ids,
                                c.id,
                                e.target.checked,
                              );
                              const defaultOffer =
                                c.offers?.find(
                                  (offer) => offer.is_recommended,
                                ) ?? c.offers?.[0];
                              const defaultOfferId = defaultOffer?.id;
                              onChangeForm({
                                ...form,
                                class_ids: nextClassIds,
                                items:
                                  e.target.checked && defaultOfferId
                                    ? [
                                        ...form.items.filter(
                                          (item) => item.class_id !== c.id,
                                        ),
                                        {
                                          class_id: c.id,
                                          class_offer_id: defaultOfferId,
                                        },
                                      ]
                                    : form.items.filter(
                                        (item) => item.class_id !== c.id,
                                      ),
                              });
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-medium truncate flex items-center gap-1.5">
                              {c.title}
                            </div>
                            {checked && c.offers?.length > 0 && (
                              <select
                                value={selectedOfferId ?? ""}
                                onClick={(event) => event.stopPropagation()}
                                onChange={(event) => {
                                  event.preventDefault();
                                  onChangeForm({
                                    ...form,
                                    items: [
                                      ...form.items.filter(
                                        (item) => item.class_id !== c.id,
                                      ),
                                      {
                                        class_id: c.id,
                                        class_offer_id: event.target.value,
                                      },
                                    ],
                                  });
                                }}
                                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
                              >
                                {c.offers
                                  .filter((offer) => offer.visible)
                                  .map((offer) => (
                                    <option key={offer.id} value={offer.id}>
                                      {offer.meeting_count} pertemuan — Rp
                                      {offer.price.toLocaleString("id-ID")}
                                    </option>
                                  ))}
                              </select>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4 border-t border-white/10 pt-4">
            {!isPackage ? (
              <>
                <div>
                  <label
                    htmlFor="base-price"
                    className="text-xs font-medium uppercase tracking-wider text-white/60"
                  >
                    Harga Dasar per Pertemuan (Rp)
                  </label>
                  <input
                    id="base-price"
                    type="number"
                    value={form.base_price_per_meeting}
                    min={0}
                    onChange={(e) => {
                      const basePrice = Number(e.target.value);
                      onChangeForm({
                        ...form,
                        base_price_per_meeting: basePrice,
                        offers: form.offers.map((offer) => {
                          const oldDiscount = Math.max(
                            0,
                            offer.list_price - offer.price,
                          );
                          const listPrice = basePrice * offer.meeting_count;
                          return {
                            ...offer,
                            list_price: listPrice,
                            price: Math.max(0, listPrice - oldDiscount),
                          };
                        }),
                      });
                    }}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-white/60">
                      Pilihan Pertemuan
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const meetingCount =
                          Math.max(
                            1,
                            ...form.offers.map((offer) => offer.meeting_count),
                          ) + 1;
                        const listPrice =
                          form.base_price_per_meeting * meetingCount;
                        onChangeForm({
                          ...form,
                          offers: [
                            ...form.offers,
                            {
                              meeting_count: meetingCount,
                              list_price: listPrice,
                              price: listPrice,
                              is_recommended: form.offers.length === 0,
                              visible: true,
                              sort_order: form.offers.length,
                            },
                          ],
                        });
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20"
                    >
                      Tambah Pilihan
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.offers.map((offer, index) => (
                      <div
                        key={offer.id ?? `new-${index}`}
                        className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[0.025] p-3 sm:grid-cols-[0.8fr_1fr_1fr_auto]"
                      >
                        <label className="text-[10px] uppercase text-white/40">
                          Pertemuan
                          <input
                            type="number"
                            min={1}
                            value={offer.meeting_count}
                            onChange={(e) =>
                              updateOffer(form, onChangeForm, index, {
                                meeting_count: Number(e.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-sm text-white"
                          />
                        </label>
                        <label className="text-[10px] uppercase text-white/40">
                          Harga Normal
                          <input
                            type="number"
                            min={0}
                            value={offer.list_price}
                            onChange={(e) =>
                              updateOffer(form, onChangeForm, index, {
                                list_price: Number(e.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-sm text-white"
                          />
                        </label>
                        <label className="text-[10px] uppercase text-white/40">
                          Harga Jual
                          <input
                            type="number"
                            min={0}
                            value={offer.price}
                            onChange={(e) =>
                              updateOffer(form, onChangeForm, index, {
                                price: Number(e.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1.5 text-sm text-white"
                          />
                        </label>
                        <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:justify-center">
                          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-amber-300">
                            <input
                              type="radio"
                              name="recommended-offer"
                              checked={offer.is_recommended}
                              onChange={() =>
                                onChangeForm({
                                  ...form,
                                  offers: form.offers.map(
                                    (candidate, candidateIndex) => ({
                                      ...candidate,
                                      is_recommended: candidateIndex === index,
                                    }),
                                  ),
                                })
                              }
                              className="accent-amber-400"
                            />{" "}
                            Unggulan
                          </label>
                          <button
                            type="button"
                            disabled={form.offers.length === 1}
                            onClick={() => {
                              const next = form.offers.filter(
                                (_, candidateIndex) => candidateIndex !== index,
                              );
                              if (offer.is_recommended && next[0])
                                next[0] = { ...next[0], is_recommended: true };
                              onChangeForm({ ...form, offers: next });
                            }}
                            className="cursor-pointer rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label
                  htmlFor="bundle-price"
                  className="text-xs font-medium uppercase tracking-wider text-white/60"
                >
                  Harga Bundle (Rp)
                </label>
                <input
                  id="bundle-price"
                  type="number"
                  value={form.price}
                  min={0}
                  onChange={(e) =>
                    onChangeForm({ ...form, price: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-cyan-500/50"
                />
              </div>
            )}
            <div className="flex items-center">
              <label className="inline-flex items-center gap-3 text-sm text-white/80 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-cyan-400 rounded"
                  checked={form.visible}
                  onChange={(e) =>
                    onChangeForm({
                      ...form,
                      visible: e.target.checked,
                    })
                  }
                />
                Tampilkan
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-white/[0.07] pt-4">
          <ModalActionButton
            variant="ghost"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </ModalActionButton>
          <ModalActionButton
            variant="primary"
            onClick={onSubmit}
            loading={saving}
            loadingLabel="Menyimpan..."
          >
            Simpan
          </ModalActionButton>
        </div>
    </Modal>
  );
}

function toggleId(list: string[], id: string, checked: boolean) {
  const set = new Set(list);
  if (checked) set.add(id);
  else set.delete(id);
  return Array.from(set);
}

function updateOffer(
  form: UnifiedForm,
  onChangeForm: (form: UnifiedForm) => void,
  index: number,
  patch: Partial<ClassOffer>,
) {
  const offers = form.offers.map((offer, candidateIndex) => {
    if (candidateIndex !== index) return offer;
    const updated = { ...offer, ...patch };
    if (patch.meeting_count !== undefined && form.base_price_per_meeting > 0) {
      const discount = Math.max(0, offer.list_price - offer.price);
      updated.list_price = form.base_price_per_meeting * patch.meeting_count;
      updated.price = Math.max(0, updated.list_price - discount);
    }
    return updated;
  });
  onChangeForm({ ...form, offers });
}
