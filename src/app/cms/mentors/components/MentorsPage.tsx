"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";

import ConfirmModal from "@/components/modal/ConfirmModal";
import Modal from "@/components/modal/Modal";
import { useModal } from "@/components/ui/useModal";
import { useMentors } from "@/hooks/useMentors";
import {
  MAX_MENTOR_ACHIEVEMENTS,
  type Mentor,
} from "../../../../../lib/mentors";

import { MentorHeader } from "./MentorHeader";
import { MentorTable } from "./MentorTable";

type MentorForm = {
  name: string;
  angkatan: string;
  achievements: string[];
  visible: boolean;
};

function emptyMentorForm(): MentorForm {
  return {
    name: "",
    angkatan: String(new Date().getFullYear()),
    achievements: [""],
    visible: true,
  };
}

function mentorToForm(mentor: Mentor): MentorForm {
  return {
    name: mentor.name,
    angkatan: String(mentor.angkatan || ""),
    achievements: mentor.achievements?.length ? [...mentor.achievements] : [""],
    visible: mentor.visible,
  };
}

function getErrorMessage(errorValue: unknown, fallback: string) {
  return errorValue instanceof Error ? errorValue.message : fallback;
}

export default function MentorsPage() {
  const {
    me,
    list,
    error,
    isReadonly,
    addDraftMentor,
    saveMentorRow,
    deleteMentorRow,
  } = useMentors();

  const successModal = useModal();
  const errorModal = useModal();
  const confirmModal = useModal();

  const [successMsg, setSuccessMsg] = useState("Berhasil");
  const [errorMsg, setErrorMsg] = useState("Terjadi kesalahan");
  const [pendingDelete, setPendingDelete] = useState<Mentor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [mentorForm, setMentorForm] = useState<MentorForm>(emptyMentorForm);
  const [savingMentor, setSavingMentor] = useState(false);

  if (!list || !me) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-3 w-28 rounded-full bg-white/[0.08]" />
        <div className="h-8 w-56 rounded-full bg-white/[0.08]" />
        <div className="h-4 w-96 max-w-full rounded-full bg-white/[0.06]" />
        <div className="h-64 rounded-2xl border border-white/[0.08] bg-white/[0.03]" />
      </div>
    );
  }

  const visibleCount = list.filter((mentor) => mentor.visible).length;

  const openAddModal = () => {
    const draft = addDraftMentor();
    if (!draft) return;
    setEditingMentor(draft);
    setMentorForm(mentorToForm(draft));
    setMentorModalOpen(true);
  };

  const openEditModal = (mentor: Mentor) => {
    setEditingMentor(mentor);
    setMentorForm(mentorToForm(mentor));
    setMentorModalOpen(true);
  };

  const closeMentorModal = () => {
    if (savingMentor) return;
    if (editingMentor?.id.startsWith("new-")) {
      void deleteMentorRow(editingMentor);
    }
    setMentorModalOpen(false);
    setEditingMentor(null);
    setMentorForm(emptyMentorForm());
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingMentor || savingMentor) return;

    setSavingMentor(true);
    try {
      const result = await saveMentorRow({
        id: editingMentor.id,
        name: mentorForm.name,
        angkatan: Number(mentorForm.angkatan),
        achievements: mentorForm.achievements,
        visible: mentorForm.visible,
      });

      setSuccessMsg(
        result === "created"
          ? "Mentor berhasil ditambahkan."
          : "Perubahan mentor berhasil disimpan.",
      );
      setMentorModalOpen(false);
      setEditingMentor(null);
      setMentorForm(emptyMentorForm());
      successModal.onOpen();
    } catch (errorValue: unknown) {
      setErrorMsg(getErrorMessage(errorValue, "Gagal menyimpan mentor."));
      errorModal.onOpen();
    } finally {
      setSavingMentor(false);
    }
  };

  const handleDeleteRow = async (mentor: Mentor) => {
    if (isReadonly) return;

    if (mentor.id.startsWith("new-")) {
      try {
        await deleteMentorRow(mentor);
        setSuccessMsg("Baris mentor baru dibatalkan.");
        successModal.onOpen();
      } catch (errorValue: unknown) {
        setErrorMsg(
          getErrorMessage(errorValue, "Gagal menghapus baris mentor."),
        );
        errorModal.onOpen();
      }
      return;
    }

    setPendingDelete(mentor);
    confirmModal.onOpen();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteMentorRow(pendingDelete);
      setSuccessMsg("Mentor berhasil dihapus.");
      successModal.onOpen();
    } catch (errorValue: unknown) {
      setErrorMsg(getErrorMessage(errorValue, "Gagal menghapus mentor."));
      errorModal.onOpen();
    } finally {
      setDeleting(false);
      confirmModal.onClose();
      setPendingDelete(null);
    }
  };

  const isAdding = editingMentor?.id.startsWith("new-") ?? false;

  return (
    <>
      <div className="space-y-6 pb-6">
        <MentorHeader
          isReadonly={isReadonly}
          onAdd={openAddModal}
          total={list.length}
          visibleCount={visibleCount}
        />

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <MentorTable
          list={list}
          isReadonly={isReadonly}
          actionsDisabled={deleting}
          onEditRow={openEditModal}
          onDeleteRow={(mentor) => void handleDeleteRow(mentor)}
        />
      </div>

      <Modal
        open={mentorModalOpen}
        onClose={closeMentorModal}
        dismissible={!savingMentor}
        title={isAdding ? "Tambah mentor" : "Edit mentor"}
        size="lg"
      >
        <form
          onSubmit={(event) => void handleSave(event)}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
            <div>
              <label
                htmlFor="mentor-name"
                className="text-xs font-medium text-white/55"
              >
                Nama mentor
              </label>
              <input
                id="mentor-name"
                value={mentorForm.name}
                onChange={(event) =>
                  setMentorForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Contoh: Budi Santoso"
                disabled={savingMentor}
                className="mt-2 w-full rounded-xl border border-white/[0.1] bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="mentor-angkatan"
                className="text-xs font-medium text-white/55"
              >
                Angkatan
              </label>
              <input
                id="mentor-angkatan"
                type="number"
                min="1900"
                max="2100"
                value={mentorForm.angkatan}
                onChange={(event) =>
                  setMentorForm((current) => ({
                    ...current,
                    angkatan: event.target.value,
                  }))
                }
                disabled={savingMentor}
                className="mt-2 w-full rounded-xl border border-white/[0.1] bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-white/55">Prestasi</p>
                <p className="mt-1 text-xs text-white/35">
                  Isi 1 sampai {MAX_MENTOR_ACHIEVEMENTS} prestasi yang ingin
                  tampil di profil mentor.
                </p>
              </div>
              <span className="text-xs text-white/35">
                {mentorForm.achievements.length}/{MAX_MENTOR_ACHIEVEMENTS}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {mentorForm.achievements.map((achievement, index) => (
                <div
                  key={`${editingMentor?.id ?? "mentor"}-achievement-${index}`}
                  className="flex items-center gap-2"
                >
                  <span className="w-7 shrink-0 text-[10px] font-semibold tracking-[0.12em] text-cyan-300/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <input
                    id={`mentor-achievement-${index}`}
                    value={achievement}
                    onChange={(event) =>
                      setMentorForm((current) => ({
                        ...current,
                        achievements: current.achievements.map(
                          (item, itemIndex) =>
                            itemIndex === index ? event.target.value : item,
                        ),
                      }))
                    }
                    placeholder={`Prestasi ${index + 1}`}
                    disabled={savingMentor}
                    className="min-w-0 flex-1 rounded-xl border border-white/[0.1] bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setMentorForm((current) => ({
                        ...current,
                        achievements: current.achievements.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      }))
                    }
                    disabled={
                      savingMentor || mentorForm.achievements.length <= 1
                    }
                    className="rounded-lg px-2 py-2 text-xs font-medium text-white/40 transition hover:bg-white/[0.05] hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            {mentorForm.achievements.length < MAX_MENTOR_ACHIEVEMENTS ? (
              <button
                type="button"
                onClick={() =>
                  setMentorForm((current) => ({
                    ...current,
                    achievements: [...current.achievements, ""],
                  }))
                }
                disabled={savingMentor}
                className="mt-3 rounded-lg border border-white/[0.1] px-3 py-2 text-xs font-medium text-white/55 transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.06] hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tambah prestasi
              </button>
            ) : null}
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-sm text-white/65">
            <input
              type="checkbox"
              checked={mentorForm.visible}
              onChange={(event) =>
                setMentorForm((current) => ({
                  ...current,
                  visible: event.target.checked,
                }))
              }
              disabled={savingMentor}
              className="mt-0.5 h-4 w-4 accent-cyan-300"
            />
            <span>
              <span className="block font-medium text-white/80">
                Tampilkan di halaman publik
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-white/35">
                Matikan jika profil mentor belum siap ditampilkan.
              </span>
            </span>
          </label>

          <div className="flex justify-end gap-2 border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={closeMentorModal}
              disabled={savingMentor}
              className="rounded-xl px-3 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingMentor}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingMentor ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {savingMentor
                ? "Menyimpan..."
                : isAdding
                  ? "Simpan mentor"
                  : "Simpan perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={successModal.open}
        onClose={successModal.onClose}
        title="Berhasil"
        variant="success"
        size="sm"
        actions={[
          {
            label: "Tutup",
            onClick: successModal.onClose,
            variant: "primary",
            autoFocus: true,
          },
        ]}
      >
        <p className="text-sm leading-relaxed text-white/70">{successMsg}</p>
      </Modal>

      <Modal
        open={errorModal.open}
        onClose={errorModal.onClose}
        title="Gagal"
        variant="error"
        size="sm"
        actions={[
          {
            label: "Tutup",
            onClick: errorModal.onClose,
            variant: "danger",
            autoFocus: true,
          },
        ]}
      >
        <p className="text-sm leading-relaxed text-white/70">{errorMsg}</p>
      </Modal>

      <ConfirmModal
        open={confirmModal.open}
        onClose={() => {
          if (!deleting) {
            confirmModal.onClose();
            setPendingDelete(null);
          }
        }}
        title="Hapus mentor?"
        message={
          <div>
            {pendingDelete ? (
              <>
                Data mentor{" "}
                <span className="font-semibold text-white">
                  {pendingDelete.name || "(tanpa nama)"}
                </span>{" "}
                akan dihapus. Aksi ini tidak bisa dibatalkan.
              </>
            ) : (
              "Aksi ini tidak bisa dibatalkan."
            )}
          </div>
        }
        confirmText={deleting ? "Menghapus..." : "Hapus"}
        variant="danger"
        onConfirm={() => void confirmDelete()}
        loading={deleting}
      />
    </>
  );
}
