"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Trash2, PencilLine, Save, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useModal } from "@/components/ui/useModal";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type Me = { id: string; email: string; full_name: string; role: Role };

type Item = {
  id: string;
  code: string;
  name: string;
  sem: 1 | 2;
  blurb: string;
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

export default function CurriculumPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<{ code: string; name: string; sem: 1 | 2; blurb: string }>({
    code: "",
    name: "",
    sem: 1,
    blurb: "",
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
        const data = await api<Item[]>("/curriculum");
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
    return items.filter(
      (x) =>
        x.code.toLowerCase().includes(s) ||
        x.name.toLowerCase().includes(s) ||
        String(x.sem).includes(s) ||
        x.blurb.toLowerCase().includes(s)
    );
  }, [items, q]);

  function openNew() {
    setEditing(null);
    setForm({ code: "", name: "", sem: 1, blurb: "" });
    setModalOpen(true);
  }
  function openEdit(it: Item) {
    setEditing(it);
    setForm({ code: it.code, name: it.name, sem: it.sem, blurb: it.blurb });
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) {
        const updated = await api<Item>(`/curriculum/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        setSuccessMsg("Perubahan kurikulum berhasil disimpan.");
      } else {
        const created = await api<Item>("/curriculum", { method: "POST", body: JSON.stringify(form) });
        setItems((prev) => [created, ...prev]);
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

  function askRemove(it: Item) {
    setPendingDelete(it);
    confirmModal.onOpen();
  }

  async function confirmRemove() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api(`/curriculum/${pendingDelete.id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((x) => x.id !== pendingDelete.id));
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
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Kurikulum</h1>
            <p className="text-sm text-white/70">
              Kelola daftar mata kuliah semester 1–2.{" "}
              <span className="text-white/60">Mentor hanya dapat melihat.</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64 max-w-[60vw]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kode / nama"
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

      <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70">
        {loading ? "Memuat kurikulum…" : `${filtered.length} item`}
        {err && <span className="ml-2 text-red-300">{err}</span>}
      </div>

      <div className="grid gap-3 sm:hidden">
        {filtered.map((it) => (
          <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-white/60">
                  Smt {it.sem} • {it.code}
                </div>
                <div className="text-white font-semibold">{it.name}</div>
                <div className="text-sm text-white/70 mt-1">{it.blurb}</div>
              </div>
              {canWrite ? (
                <div className="flex gap-1">
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

      {/* desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:block">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Kode</th>
              <th className="px-4 py-3 text-left font-medium">Nama</th>
              <th className="px-4 py-3 text-left font-medium">Smt</th>
              <th className="px-4 py-3 text-left font-medium">Deskripsi</th>
              {canWrite ? <th className="px-4 py-3 text-left font-medium w-32">Aksi</th> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="border-t border-white/10 hover:bg-white/[0.04]">
                <td className="px-4 py-3 text-white">{it.code}</td>
                <td className="px-4 py-3 text-white/90">{it.name}</td>
                <td className="px-4 py-3 text-white/80">{it.sem}</td>
                <td className="px-4 py-3 text-white/70">{it.blurb}</td>
                {canWrite ? (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
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

      {modalOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setModalOpen(false)} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-white font-semibold">{editing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}</div>
              <button onClick={() => !saving && setModalOpen(false)} className="rounded-lg border border-white/15 p-2 text-white/80">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs text-white/60">Kode</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                    placeholder="IF1101"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-white/60">Nama</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                    placeholder="Dasar Pemrograman"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-white/60">Semester</label>
                  <select
                    value={form.sem}
                    onChange={(e) => setForm((f) => ({ ...f, sem: Number(e.target.value) as 1 | 2 }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-white/60">Deskripsi</label>
                  <input
                    value={form.blurb}
                    onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                    placeholder="Ringkasan singkat materi"
                  />
                </div>
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
        title="Hapus mata kuliah?"
        message={
          pendingDelete ? (
            <>
              Data <span className="font-semibold text-white">{pendingDelete.name}</span> ({pendingDelete.code}) akan
              dihapus. Aksi ini tidak bisa dibatalkan.
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
