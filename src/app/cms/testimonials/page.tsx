"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Search, PencilLine, Trash2, Save, X, Eye, EyeOff } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useModal } from "@/components/ui/useModal";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type Me = { id: string; email: string; full_name: string; role: Role };

type Item = {
  id: string;
  name: string;
  text: string;
  visible: boolean;
  created_at?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j?.detail) msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export default function TestimonialsCMSPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<{ name: string; text: string; visible: boolean }>({
    name: "",
    text: "",
    visible: true,
  });
  const [saving, setSaving] = useState(false);

  // MODALS
  const successModal = useModal();
  const errorModal = useModal();
  const confirmModal = useModal();
  const [successMsg, setSuccessMsg] = useState("Berhasil");
  const [errorMsg, setErrorMsg] = useState("Terjadi kesalahan");
  const [pendingDelete, setPendingDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canWrite = useMemo(() => me && (me.role === "admin" || me.role === "superadmin"), [me]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const m = await api<Me>("/me");
        if (cancel) return;
        setMe(m);
        const data = await api<Item[]>("/admin/testimonials");
        if (cancel) return;
        setItems(data);
      } catch (e: any) {
        setErr(e?.message ?? "Gagal memuat.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => x.name.toLowerCase().includes(s) || x.text.toLowerCase().includes(s));
  }, [items, q]);

  function openNew() {
    setEditing(null);
    setForm({ name: "", text: "", visible: true });
    setModalOpen(true);
  }
  function openEdit(it: Item) {
    setEditing(it);
    setForm({ name: it.name, text: it.text, visible: it.visible });
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) {
        const updated = await api<Item>(`/admin/testimonials/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        setSuccessMsg("Perubahan testimoni berhasil disimpan.");
      } else {
        const created = await api<Item>("/admin/testimonials", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setItems((prev) => [created, ...prev]);
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

  function askRemove(it: Item) {
    setPendingDelete(it);
    confirmModal.onOpen();
  }

  async function confirmRemove() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api(`/admin/testimonials/${pendingDelete.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== pendingDelete.id));
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

  async function toggleVisible(it: Item) {
    try {
      const updated = await api<Item>(`/admin/testimonials/${it.id}`, {
        method: "PATCH",
        body: JSON.stringify({ visible: !it.visible }),
      });
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setSuccessMsg(updated.visible ? "Testimoni ditampilkan." : "Testimoni disembunyikan.");
      successModal.onOpen();
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Gagal memperbarui visibilitas.");
      errorModal.onOpen();
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Testimonials</h1>
            <p className="text-sm text-white/70">Kelola testimoni untuk ditampilkan di landing page. Mentor hanya dapat melihat.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64 max-w-[60vw]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama / kutipan…"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
              />
            </div>
            {canWrite ? (
              <Button variant="secondary" onClick={openNew} className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70">
        {loading ? "Memuat testimoni…" : `${filtered.length} item`}
        {err && <span className="ml-2 text-red-300">{err}</span>}
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 sm:hidden">
        {filtered.map((it) => (
          <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white font-semibold">{it.name}</div>
                <div className="mt-1 text-sm text-white/80">{it.text}</div>
                <div className="mt-2 text-xs text-white/60 flex items-center gap-2">
                  {it.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  {it.visible ? "Ditampilkan" : "Disembunyikan"}
                </div>
              </div>
              {canWrite ? (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => toggleVisible(it)} title="Toggle tampil">
                    {it.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(it)}>
                    <PencilLine className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => askRemove(it)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:block">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-60">Nama</th>
              <th className="px-4 py-3 text-left font-medium">Kutipan</th>
              <th className="px-4 py-3 text-left font-medium w-40">Status</th>
              {canWrite ? <th className="px-4 py-3 text-left font-medium w-40">Aksi</th> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="border-t border-white/10 hover:bg-white/[0.04]">
                <td className="px-4 py-3 text-white">{it.name}</td>
                <td className="px-4 py-3 text-white/80">{it.text}</td>
                <td className="px-4 py-3 text-white/70">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs">
                    {it.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {it.visible ? "Ditampilkan" : "Disembunyikan"}
                  </div>
                </td>
                {canWrite ? (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleVisible(it)}>
                        {it.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        {it.visible ? "Sembunyikan" : "Tampilkan"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(it)}>
                        <PencilLine className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => askRemove(it)}>
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setModalOpen(false)} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-white font-semibold">{editing ? "Edit Testimoni" : "Tambah Testimoni"}</div>
              <button onClick={() => !saving && setModalOpen(false)} className="rounded-lg border border-white/15 p-2 text-white/80">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3">
              <div>
                <label className="text-xs text-white/60">Nama</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                  placeholder="Alya — IF'24"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Kutipan</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                  placeholder="Tulis testimoni singkat…"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="visible"
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
                  className="h-4 w-4 accent-cyan-400"
                />
                <label htmlFor="visible" className="text-sm text-white/70">Tampilkan di landing</label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button variant="secondary" onClick={save} disabled={saving} className="inline-flex items-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODALS ====== */}
      <Modal
        open={successModal.open}
        onClose={successModal.onClose}
        title="Berhasil"
        variant="success"
        actions={[{ label: "Tutup", onClick: successModal.onClose, variant: "primary", autoFocus: true }]}
      >
        {successMsg}
      </Modal>

      <Modal
        open={errorModal.open}
        onClose={errorModal.onClose}
        title="Gagal"
        variant="error"
        actions={[{ label: "Tutup", onClick: errorModal.onClose, variant: "danger", autoFocus: true }]}
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
              Testimoni dari <span className="font-semibold text-white">{pendingDelete.name}</span> akan dihapus. Aksi
              ini tidak bisa dibatalkan.
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
