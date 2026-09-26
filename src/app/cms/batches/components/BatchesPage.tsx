"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, CheckCircle2, Trash2, ShieldAlert } from "lucide-react";
import { api, postJSON, patchJSON, deleteJSON } from "../../../../../lib/api";
import { useGlobalError } from "@/components/providers/ErrorProvider";
import Modal from "@/components/modal/Modal";
import { ModalActionButton } from "@/components/modal/ModalActionButton";
import { useConfirmModal } from "@/hooks/useConfirmModal";

type Batch = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showError } = useGlobalError();
  const { confirm, modal: confirmModal } = useConfirmModal();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [formName, setFormName] = useState("");
  const [formActive, setFormActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<Batch[]>("/batches");
      setBatches(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Gagal memuat data batch"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  function handleAdd() {
    setEditing(null);
    setFormName("");
    setFormActive(false);
    setModalOpen(true);
  }

  function handleEdit(b: Batch) {
    setEditing(b);
    setFormName(b.name);
    setFormActive(b.is_active);
    setModalOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    await confirm({
      title: "Hapus batch?",
      message: `Hapus batch "${name}"?`,
      confirmText: "Hapus",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteJSON(`/admin/batches/${id}`);
          void loadBatches();
        } catch (error: unknown) {
          showError(getErrorMessage(error, "Gagal menghapus batch"));
        }
      },
    });
  }

  async function handleToggleActive(b: Batch) {
    if (b.is_active) return; // Already active
    await confirm({
      title: "Aktifkan batch?",
      message: `Aktifkan batch "${b.name}"? Ini akan menonaktifkan batch lain.`,
      confirmText: "Aktifkan",
      onConfirm: async () => {
        try {
          await patchJSON(`/admin/batches/${b.id}`, { is_active: true });
          void loadBatches();
        } catch (error: unknown) {
          showError(getErrorMessage(error, "Gagal mengaktifkan batch"));
        }
      },
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      showError("Nama batch harus diisi.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await patchJSON(`/admin/batches/${editing.id}`, { name: formName, is_active: formActive });
      } else {
        await postJSON(`/admin/batches`, { name: formName, is_active: formActive });
      }
      setModalOpen(false);
      loadBatches();
    } catch (error: unknown) {
      showError(getErrorMessage(error, "Gagal menyimpan batch"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4 text-white/50 animate-pulse">Memuat batch...</div>;
  if (error) return <div className="p-4 text-red-400 bg-red-500/10 rounded-xl">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Batch</h1>
          <p className="text-sm text-slate-400 mt-1">Atur gelombang/batch aktif untuk kelas dan paket.</p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Batch Baru
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((b) => (
          <div key={b.id} className={`relative p-5 rounded-2xl border transition-all ${b.is_active ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
            {b.is_active && (
              <div className="absolute top-0 right-0 p-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" />
                  Aktif
                </span>
              </div>
            )}
            
            <h3 className="text-lg font-semibold text-white pr-16">{b.name}</h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">{new Date(b.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => handleToggleActive(b)}
                disabled={b.is_active}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${b.is_active ? 'border-transparent text-slate-500 cursor-default' : 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'}`}
              >
                {b.is_active ? 'Sedang Aktif' : 'Jadikan Aktif'}
              </button>
              
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEdit(b)}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-md transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id, b.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {batches.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl">
             <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
             <h3 className="text-slate-300 font-medium">Belum ada batch</h3>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        dismissible={!saving}
        title={editing ? "Edit Batch" : "Tambah Batch"}
        size="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="batch-name" className="block text-sm font-medium text-slate-300 mb-1.5">Nama Batch</label>
                <input
                  id="batch-name"
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Misal: Batch 2 (Ganjil 2024)"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  required
                />
              </div>
              
              {!editing?.is_active && (
                <label className="flex items-center gap-3 rounded-xl border border-white/10 p-3 transition-colors hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={e => setFormActive(e.target.checked)}
                    className="h-5 w-5 accent-cyan-400"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-white">Jadikan Batch Aktif</div>
                    <div className="text-slate-400 text-xs mt-0.5">Batch lain akan otomatis non-aktif</div>
                  </div>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] pt-4">
                <ModalActionButton
                  variant="ghost"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Batal
                </ModalActionButton>
                <ModalActionButton
                  type="submit"
                  variant="primary"
                  loading={saving}
                  loadingLabel="Menyimpan..."
                >
                  Simpan
                </ModalActionButton>
              </div>
        </form>
      </Modal>
      {confirmModal}
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
