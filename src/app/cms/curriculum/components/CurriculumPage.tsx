"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useModal } from "@/components/ui/useModal";
import { useCurriculum } from "@/hooks/useCurriculum";
import type { CurriculumItem, CurriculumForm } from "../../../../../lib/curriculum";

import { CurriculumHeader } from "./CurriculumHeader";
import { CurriculumListMobile } from "./CurriculumListMobile";
import { CurriculumTable } from "./CurriculumTable";
import { CurriculumFormModal } from "./CurriculumFormModal";

export default function CurriculumPage() {
  const {
    me,
    loading,
    err,
    search,
    setSearch,
    canWrite,
    filtered,
    createItem,
    updateItem,
    removeItem,
  } = useCurriculum();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CurriculumItem | null>(null);
  const [form, setForm] = useState<CurriculumForm>({
    code: "",
    name: "",
    sem: 1,
    blurb: "",
  });
  const [saving, setSaving] = useState(false);

  const successModal = useModal();
  const errorModal = useModal();
  const [successMsg, setSuccessMsg] = useState("Berhasil");
  const [errorMsg, setErrorMsg] = useState("Terjadi kesalahan");

  const [pendingDelete, setPendingDelete] = useState<CurriculumItem | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const confirmModal = useModal();

  function openNew() {
    setEditing(null);
    setForm({ code: "", name: "", sem: 1, blurb: "" });
    setModalOpen(true);
  }

  function openEdit(it: CurriculumItem) {
    setEditing(it);
    setForm({ code: it.code, name: it.name, sem: it.sem, blurb: it.blurb });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await updateItem(editing.id, form);
        setSuccessMsg("Perubahan kurikulum berhasil disimpan.");
      } else {
        await createItem(form);
        setSuccessMsg("Mata kuliah baru berhasil ditambahkan.");
      }
      setModalOpen(false);
      successModal.onOpen();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Gagal menyimpan.");
      errorModal.onOpen();
    } finally {
      setSaving(false);
    }
  }

  function askRemove(it: CurriculumItem) {
    setPendingDelete(it);
    confirmModal.onOpen();
  }

  async function confirmRemove() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await removeItem(pendingDelete.id);
      setSuccessMsg("Mata kuliah berhasil dihapus.");
      successModal.onOpen();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Gagal menghapus.");
      errorModal.onOpen();
    } finally {
      setDeleting(false);
      confirmModal.onClose();
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-5">
      <CurriculumHeader
        canWrite={canWrite}
        search={search}
        onSearchChange={setSearch}
        onAdd={openNew}
      />

      <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70">
        {loading ? "Memuat kurikulum…" : `${filtered.length} item`}
        {err && <span className="ml-2 text-red-300">{err}</span>}
      </div>

      <CurriculumListMobile
        items={filtered}
        canWrite={canWrite}
        onEdit={openEdit}
        onDelete={askRemove}
      />

      <CurriculumTable
        items={filtered}
        canWrite={canWrite}
        onEdit={openEdit}
        onDelete={askRemove}
      />

      <CurriculumFormModal
        open={modalOpen}
        editing={editing}
        form={form}
        saving={saving}
        onChangeForm={setForm}
        onClose={() => !saving && setModalOpen(false)}
        onSubmit={handleSave}
      />

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
        onClose={() => !deleting && confirmModal.onClose()}
        title="Hapus mata kuliah?"
        message={
          pendingDelete ? (
            <>
              Data{" "}
              <span className="font-semibold text-white">
                {pendingDelete.name}
              </span>{" "}
              ({pendingDelete.code}) akan dihapus. Aksi ini tidak bisa
              dibatalkan.
            </>
          ) : (
            "Aksi ini tidak bisa dibatalkan."
          )
        }
        confirmText={deleting ? "Menghapus…" : "Hapus"}
        variant="danger"
        onConfirm={confirmRemove}
        loading={deleting}
      />
    </div>
  );
}
