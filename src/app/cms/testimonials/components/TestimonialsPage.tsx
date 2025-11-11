"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useModal } from "@/components/ui/useModal";

import { useTestimonials } from "@/hooks/useTestimonials";
import type { Testimonial, TestimonialForm } from "../../../../../lib/testimonials";

import { TestimonialsHeader } from "./TestimonialsHeader";
import { TestimonialsListMobile } from "./TestimonialsListMobile";
import { TestimonialsTable } from "./TestimonialsTable";
import { TestimonialsFormModal } from "./TestimonialsFormModal";

export default function TestimonialsPage() {
  const {
    me,
    items,
    loading,
    err,
    search,
    setSearch,
    canWrite,
    filtered,
    createItem,
    updateItem,
    removeItem,
    toggleVisible,
  } = useTestimonials();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialForm>({
    name: "",
    text: "",
    visible: true,
  });
  const [saving, setSaving] = useState(false);

  const successModal = useModal();
  const errorModal = useModal();
  const confirmModal = useModal();

  const [successMsg, setSuccessMsg] = useState("Berhasil");
  const [errorMsg, setErrorMsg] = useState("Terjadi kesalahan");
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openNew() {
    setEditing(null);
    setForm({ name: "", text: "", visible: true });
    setModalOpen(true);
  }

  function openEdit(it: Testimonial) {
    setEditing(it);
    setForm({ name: it.name, text: it.text, visible: it.visible });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await updateItem(editing.id, form);
        setSuccessMsg("Perubahan testimoni berhasil disimpan.");
      } else {
        await createItem(form);
        setSuccessMsg("Testimoni baru berhasil ditambahkan.");
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

  function askRemove(it: Testimonial) {
    setPendingDelete(it);
    confirmModal.onOpen();
  }

  async function confirmRemove() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await removeItem(pendingDelete.id);
      setSuccessMsg("Testimoni berhasil dihapus.");
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

  async function handleToggleVisible(it: Testimonial) {
    try {
      const updated = await toggleVisible(it);
      setSuccessMsg(
        updated.visible ? "Testimoni ditampilkan." : "Testimoni disembunyikan.",
      );
      successModal.onOpen();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Gagal memperbarui visibilitas.");
      errorModal.onOpen();
    }
  }

  return (
    <div className="space-y-5">
      <TestimonialsHeader
        canWrite={canWrite}
        search={search}
        onSearchChange={setSearch}
        onAdd={openNew}
      />

      {/* Status */}
      <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70">
        {loading ? "Memuat testimoni…" : `${filtered.length} item`}
        {err && <span className="ml-2 text-red-300">{err}</span>}
      </div>

      <TestimonialsListMobile
        items={filtered}
        canWrite={canWrite}
        onToggleVisible={handleToggleVisible}
        onEdit={openEdit}
        onDelete={askRemove}
      />

      <TestimonialsTable
        items={filtered}
        canWrite={canWrite}
        onToggleVisible={handleToggleVisible}
        onEdit={openEdit}
        onDelete={askRemove}
      />

      <TestimonialsFormModal
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
        title="Hapus testimoni?"
        message={
          pendingDelete ? (
            <>
              Testimoni dari{" "}
              <span className="font-semibold text-white">
                {pendingDelete.name}
              </span>{" "}
              akan dihapus. Aksi ini tidak bisa dibatalkan.
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
