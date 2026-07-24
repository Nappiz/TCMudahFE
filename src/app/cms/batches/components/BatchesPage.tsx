"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, CheckCircle2, Circle, Trash2, ShieldAlert } from "lucide-react";
import { api, postJSON, patchJSON, deleteJSON } from "../../../../../lib/api";
import { useRouter } from "next/navigation";
import { useGlobalError } from "@/components/providers/ErrorProvider";

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
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);
  const [formName, setFormName] = useState("");
  const [formActive, setFormActive] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadBatches() {
    setLoading(true);
    try {
      const data = await api<Batch[]>("/batches");
      setBatches(data);
    } catch (e: any) {
      setError(e.message || "Gagal memuat data batch");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBatches();
  }, []);

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
    if (!window.confirm(`Hapus batch "${name}"?`)) return;
    try {
      await deleteJSON(`/admin/batches/${id}`);
      loadBatches();
    } catch (e: any) {
      showError(e.message || "Gagal menghapus batch");
    }
  }

  async function handleToggleActive(b: Batch) {
    if (b.is_active) return; // Already active
    if (!window.confirm(`Aktifkan batch "${b.name}"? Ini akan menonaktifkan batch lain.`)) return;
    try {
      await patchJSON(`/admin/batches/${b.id}`, { is_active: true });
      loadBatches();
    } catch (e: any) {
      showError(e.message || "Gagal mengaktifkan batch");
    }
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
    } catch (err: any) {
      showError(err.message || "Gagal menyimpan batch");
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
                onClick={() => handleToggleActive(b)}
                disabled={b.is_active}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${b.is_active ? 'border-transparent text-slate-500 cursor-default' : 'border-white/10 text-slate-300 hover:bg-white/5 hover:text-white'}`}
              >
                {b.is_active ? 'Sedang Aktif' : 'Jadikan Aktif'}
              </button>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(b)}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-md transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12161f] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-4">{editing ? "Edit Batch" : "Tambah Batch"}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nama Batch</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Misal: Batch 2 (Ganjil 2024)"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  required
                />
              </div>
              
              {!editing?.is_active && (
                <label className="flex items-center gap-3 p-3 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={e => setFormActive(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded border border-white/20 peer-checked:bg-cyan-500 peer-checked:border-cyan-500 transition-colors"></div>
                    <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-white">Jadikan Batch Aktif</div>
                    <div className="text-slate-400 text-xs mt-0.5">Batch lain akan otomatis non-aktif</div>
                  </div>
                </label>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 transition-colors"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
