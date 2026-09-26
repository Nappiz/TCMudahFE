"use client";

import { useMemo, useState } from "react";
import ConfirmModal from "@/components/modal/ConfirmModal";
import Modal from "@/components/modal/Modal";
import { useModal } from "@/components/ui/useModal";
import { useShortlinks } from "@/hooks/useShortlinks";
import type { Shortlink, ShortlinkInput } from "../../../../../lib/shortlinks";
import { ShortlinksFormModal } from "./ShortlinksFormModal";
import { ShortlinksHeader } from "./ShortlinksHeader";
import { ShortlinksTable } from "./ShortlinksTable";

export type FormState = {
  slug: string;
  url: string;
  title: string;
  description: string;
  active: boolean;
};

export default function ShortlinksPage() {
  const {
    rows,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    total,
    limit,
    createShortlink,
    updateShortlink,
    deleteShortlink,
  } = useShortlinks();
  const [editing, setEditing] = useState<Shortlink | null>(null);
  const [form, setForm] = useState<FormState>({
    slug: "",
    url: "",
    title: "",
    description: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  const formModal = useModal();
  const confirmModal = useModal();
  const successModal = useModal();
  const errorModal = useModal();

  const [successMsg, setSuccessMsg] = useState("Berhasil");
  const [errorMsg, setErrorMsg] = useState("Terjadi kesalahan");
  const [pendingDelete, setPendingDelete] = useState<Shortlink | null>(null);
  const [deleting, setDeleting] = useState(false);

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin || "";
  }, []);

  function resetForm() {
    setForm({
      slug: "",
      url: "",
      title: "",
      description: "",
      active: true,
    });
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    formModal.onOpen();
  }

  function openEdit(row: Shortlink) {
    setEditing(row);
    setForm({
      slug: row.slug,
      url: row.url,
      title: row.title || "",
      description: row.description || "",
      active: row.active,
    });
    formModal.onOpen();
  }

  function validateForm(): string | null {
    if (!form.slug.trim()) return "Slug wajib diisi.";
    if (!/^[a-zA-Z0-9-_]+$/.test(form.slug.trim())) {
      return "Slug hanya boleh berisi huruf, angka, - dan _ (tanpa spasi).";
    }
    if (!form.url.trim()) return "URL target wajib diisi.";
    if (!/^https?:\/\//i.test(form.url.trim())) {
      return "URL target harus diawali http:// atau https://.";
    }
    return null;
  }

  async function handleSave() {
    const errMsg = validateForm();
    if (errMsg) {
      setErrorMsg(errMsg);
      errorModal.onOpen();
      return;
    }

    setSaving(true);

    const payload: ShortlinkInput = {
      slug: form.slug.trim(),
      url: form.url.trim(),
      title: form.title.trim() || undefined,
      description: form.description.trim() || undefined,
      active: form.active,
    };

    try {
      if (editing) {
        await updateShortlink(editing.id, payload);
        setSuccessMsg("Shortlink berhasil diperbarui.");
      } else {
        await createShortlink(payload);
        setSuccessMsg("Shortlink baru berhasil dibuat.");
      }
      formModal.onClose();
      setEditing(null);
      successModal.onOpen();
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error ? error.message : "Gagal menyimpan shortlink.",
      );
      errorModal.onOpen();
    } finally {
      setSaving(false);
    }
  }

  function askDelete(row: Shortlink) {
    setPendingDelete(row);
    confirmModal.onOpen();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteShortlink(pendingDelete.id);
      setSuccessMsg("Shortlink berhasil dihapus.");
      successModal.onOpen();
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error ? error.message : "Gagal menghapus shortlink.",
      );
      errorModal.onOpen();
    } finally {
      setDeleting(false);
      confirmModal.onClose();
      setPendingDelete(null);
    }
  }

  return (
    <div className="space-y-5">
      <ShortlinksHeader
        search={search}
        onSearchChange={setSearch}
        loading={loading}
        total={total}
        error={error}
        onCreate={openCreate}
      />

      <ShortlinksTable
        rows={rows}
        loading={loading}
        origin={origin}
        onEdit={openEdit}
        onDelete={askDelete}
      />

      {total > limit && (
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>
            Halaman {page} dari {Math.ceil(total / limit)}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <button
              type="button"
              disabled={page * limit >= total || loading}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

      <ShortlinksFormModal
        open={formModal.open}
        saving={saving}
        editing={editing}
        form={form}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onClose={() => {
          if (!saving) {
            formModal.onClose();
            setEditing(null);
          }
        }}
        onSubmit={handleSave}
      />

      {/* Modal Sukses */}
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

      {/* Modal Error */}
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

      {/* Confirm Delete */}
      <ConfirmModal
        open={confirmModal.open}
        onClose={() => {
          if (!deleting) {
            confirmModal.onClose();
            setPendingDelete(null);
          }
        }}
        title="Hapus shortlink?"
        message={
          pendingDelete ? (
            <>
              Shortlink{" "}
              <span className="font-mono text-white">
                /m/{pendingDelete.slug}
              </span>{" "}
              akan dihapus. Aksi ini tidak bisa dibatalkan.
            </>
          ) : (
            "Aksi ini tidak bisa dibatalkan."
          )
        }
        confirmText={deleting ? "Menghapus…" : "Hapus"}
        variant="danger"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
}
