"use client";

import { useState } from "react";

import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useModal } from "@/components/ui/useModal";

import { useMentors } from "@/hooks/useMentors";
import type { Mentor } from "../../../../../lib/mentors";

import { MentorHeader } from "./MentorHeader";
import { MentorTable } from "./MentorTable";

export default function MentorsPage() {
  const {
    me,
    list,
    setList,
    error,
    isReadonly,
    addDraftMentor,
    saveMentorRow,
    deleteMentorRow,
  } = useMentors();

  const successModal = useModal();
  const errorModal = useModal();
  const confirmModal = useModal();

  const [successMsg, setSuccessMsg] = useState<string>("Berhasil");
  const [errorMsg, setErrorMsg] = useState<string>("Terjadi kesalahan");
  const [pendingDelete, setPendingDelete] = useState<Mentor | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!list || !me) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
        Memuat data mentor…
      </div>
    );
  }

  const handleAdd = () => {
    addDraftMentor();
  };

  const handleSaveRow = async (m: Mentor) => {
    try {
      const result = await saveMentorRow(m);
      if (result === "created") {
        setSuccessMsg("Mentor berhasil ditambahkan.");
      } else {
        setSuccessMsg("Perubahan mentor berhasil disimpan.");
      }
      successModal.onOpen();
    } catch (e: any) {
      setErrorMsg(e?.message || String(e) || "Gagal menyimpan.");
      errorModal.onOpen();
    }
  };

  const handleDeleteRow = async (m: Mentor) => {
    if (isReadonly) return;

    if (m.id.startsWith("new-")) {
      try {
        await deleteMentorRow(m);
        setSuccessMsg("Baris baru dibatalkan.");
        successModal.onOpen();
      } catch (e: any) {
        setErrorMsg(e?.message || String(e) || "Gagal menghapus baris draft.");
        errorModal.onOpen();
      }
      return;
    }

    setPendingDelete(m);
    confirmModal.onOpen();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteMentorRow(pendingDelete);
      setSuccessMsg("Mentor berhasil dihapus.");
      successModal.onOpen();
    } catch (e: any) {
      setErrorMsg(e?.message || String(e) || "Gagal menghapus mentor.");
      errorModal.onOpen();
    } finally {
      setDeleting(false);
      confirmModal.onClose();
      setPendingDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <MentorHeader isReadonly={isReadonly} onAdd={handleAdd} />

        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <MentorTable
          list={list}
          isReadonly={isReadonly}
          onChangeList={(updater) => setList((prev) => updater(prev ?? []))}
          onSaveRow={handleSaveRow}
          onDeleteRow={handleDeleteRow}
        />
      </div>

      <Modal
        open={successModal.open}
        onClose={successModal.onClose}
        title="Berhasil"
        variant="success"
        actions={[
          {
            label: "Tutup",
            onClick: successModal.onClose,
            variant: "primary",
            autoFocus: true,
          },
        ]}
      >
        {successMsg}
      </Modal>

      <Modal
        open={errorModal.open}
        onClose={errorModal.onClose}
        title="Gagal"
        variant="error"
        actions={[
          {
            label: "Tutup",
            onClick: errorModal.onClose,
            variant: "danger",
            autoFocus: true,
          },
        ]}
      >
        {errorMsg}
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
        confirmText={deleting ? "Menghapus…" : "Hapus"}
        variant="danger"
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );
}
