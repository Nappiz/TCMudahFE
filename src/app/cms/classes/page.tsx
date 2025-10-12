"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Plus, Search, PencilLine, Trash2, Save, X,
  Eye, EyeOff, Users2, BookOpen, Tag
} from "lucide-react";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type Me = { id: string; email: string; full_name: string; role: Role };

type Mentor = { id: string; name: string; angkatan: number; visible: boolean };
type Curriculum = { id: string; code: string; name: string; sem: 1 | 2 };
type ClassItem = {
  id: string;
  title: string;
  description: string;
  mentor_ids: string[];           // <= MULTI MENTOR
  curriculum_ids: string[];
  price: number;
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
  return res.json() as Promise<T>;
}

export default function ClassesCMSPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    mentor_ids: string[];          // <= MULTI MENTOR
    curriculum_ids: string[];
    price: number;
    visible: boolean;
  }>({
    title: "",
    description: "",
    mentor_ids: [],
    curriculum_ids: [],
    price: 0,
    visible: true,
  });

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
        const [cls, ments, curs] = await Promise.all([
          api<ClassItem[]>("/admin/classes"),
          api<Mentor[]>("/admin/mentors"),
          api<Curriculum[]>("/curriculum"),
        ]);
        if (cancel) return;
        setClasses(cls);
        setMentors(ments);
        setCurriculum(curs);
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

  const idxMentor = useMemo(() => {
    const m = new Map<string, Mentor>();
    mentors.forEach((x) => m.set(x.id, x));
    return m;
  }, [mentors]);
  const idxCur = useMemo(() => {
    const m = new Map<string, Curriculum>();
    curriculum.forEach((x) => m.set(x.id, x));
    return m;
  }, [curriculum]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return classes;
    return classes.filter((k) => {
      const mentorsTxt = (k.mentor_ids || [])
        .map((id) => idxMentor.get(id)?.name?.toLowerCase() ?? "")
        .join(" ");
      const curs = k.curriculum_ids
        .map((id) => idxCur.get(id)?.name?.toLowerCase() ?? idxCur.get(id)?.code?.toLowerCase() ?? "")
        .join(" ");
      return (
        k.title.toLowerCase().includes(s) ||
        k.description.toLowerCase().includes(s) ||
        mentorsTxt.includes(s) ||
        curs.includes(s)
      );
    });
  }, [classes, q, idxMentor, idxCur]);

  function openNew() {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      mentor_ids: mentors[0]?.id ? [mentors[0].id] : [],
      curriculum_ids: [],
      price: 0,
      visible: true,
    });
    setModalOpen(true);
  }
  function openEdit(it: ClassItem) {
    setEditing(it);
    setForm({
      title: it.title,
      description: it.description,
      mentor_ids: [...(it.mentor_ids || [])],
      curriculum_ids: [...it.curriculum_ids],
      price: it.price,
      visible: it.visible,
    });
    setModalOpen(true);
  }

  async function save() {
    if (!canWrite) return;
    if (!form.title.trim()) return alert("Judul wajib diisi.");
    if (!form.mentor_ids.length) return alert("Pilih minimal 1 mentor.");
    if (!form.curriculum_ids.length) return alert("Pilih minimal 1 kurikulum.");

    setSaving(true);
    try {
      if (editing) {
        const updated = await api<ClassItem>(`/admin/classes/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setClasses((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await api<ClassItem>("/admin/classes", { method: "POST", body: JSON.stringify(form) });
        setClasses((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(it: ClassItem) {
    if (!canWrite) return;
    if (!confirm(`Hapus kelas "${it.title}"?`)) return;
    try {
      await api(`/admin/classes/${it.id}`, { method: "DELETE" });
      setClasses((prev) => prev.filter((x) => x.id !== it.id));
    } catch (e: any) {
      alert(e?.message ?? "Gagal menghapus.");
    }
  }

  async function toggleVisible(it: ClassItem) {
    if (!canWrite) return;
    try {
      const updated = await api<ClassItem>(`/admin/classes/${it.id}`, {
        method: "PATCH",
        body: JSON.stringify({ visible: !it.visible }),
      });
      setClasses((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e: any) {
      alert(e?.message ?? "Gagal memperbarui visibilitas.");
    }
  }

  const rupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse text-white/70">Memuat kelas…</div>;
  }
  if (err) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-red-300">Terjadi kesalahan: {err}</div>;
  }

  const readonly = !canWrite;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Kelas</h1>
            <p className="text-sm text-white/70">
              Kelola katalog kelas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64 max-w-[60vw]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul / mentor / kurikulum…"
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 pl-9 pr-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
              />
            </div>
            {!readonly && (
              <Button variant="secondary" onClick={openNew} className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/70">
        {filtered.length} item • {mentors.length} mentor • {curriculum.length} kurikulum
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:block">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Judul</th>
              <th className="px-4 py-3 text-left font-medium w-56">Mentor</th>
              <th className="px-4 py-3 text-left font-medium">Kurikulum</th>
              <th className="px-4 py-3 text-left font-medium w-32">Harga</th>
              <th className="px-4 py-3 text-left font-medium w-40">Status</th>
              {!readonly ? <th className="px-4 py-3 text-left font-medium w-44">Aksi</th> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it.id} className="border-t border-white/10 hover:bg-white/[0.04]">
                <td className="px-4 py-3 text-white">{it.title}</td>
                <td className="px-4 py-3 text-white/80">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(it.mentor_ids || []).map((mid) => {
                      const m = idxMentor.get(mid);
                      return (
                        <span key={mid} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                          <Users2 className="h-3.5 w-3.5" />
                          {m?.name ?? "—"}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 text-white/80">
                  <div className="flex flex-wrap gap-1.5">
                    {it.curriculum_ids.map((id) => {
                      const c = idxCur.get(id);
                      return (
                        <span key={id} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                          <BookOpen className="h-3.5 w-3.5" />
                          {c ? `${c.code}` : id}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 text-white/80">{rupiah(it.price)}</td>
                <td className="px-4 py-3 text-white/70">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs">
                    {it.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {it.visible ? "Ditampilkan" : "Disembunyikan"}
                  </div>
                </td>
                {!readonly ? (
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
                      <Button variant="ghost" size="sm" onClick={() => remove(it)}>
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

      <div className="grid gap-3 sm:hidden">
        {filtered.map((it) => (
          <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-white font-semibold">{it.title}</div>
                <div className="mt-1 text-xs text-white/60 inline-flex items-center gap-2 flex-wrap">
                  {(it.mentor_ids || []).map((mid, i) => {
                    const m = idxMentor.get(mid);
                    return (
                      <span key={mid} className="inline-flex items-center gap-1">
                        <Users2 className="h-4 w-4" /> {m?.name ?? "—"}
                        {i < (it.mentor_ids?.length || 0) - 1 && <span className="text-white/40">•</span>}
                      </span>
                    );
                  })}
                  <span className="text-white/40">•</span> {rupiah(it.price)}
                </div>
                <div className="mt-2 text-sm text-white/80">{it.description}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {it.curriculum_ids.map((id) => {
                    const c = idxCur.get(id);
                    return (
                      <span key={id} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                        <BookOpen className="h-3.5 w-3.5" />
                        {c ? `${c.code}` : id}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70">
                {it.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {it.visible ? "Tampil" : "Hidden"}
              </div>
            </div>
            {!readonly && (
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(it)}><PencilLine className="h-4 w-4"/>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(it)}><Trash2 className="h-4 w-4"/>Hapus</Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setModalOpen(false)} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-white font-semibold">{editing ? "Edit Kelas" : "Tambah Kelas"}</div>
              <button onClick={() => !saving && setModalOpen(false)} className="rounded-lg border border-white/15 p-2 text-white/80">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3">
              <div>
                <label className="text-xs text-white/60">Judul</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                  placeholder="Nama kelas…"
                />
              </div>
              <div>
                <label className="text-xs text-white/60">Deskripsi</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                  placeholder="Penjelasan singkat kelas…"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs text-white/60">Mentor</label>
                  <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {mentors.map((m) => {
                        const checked = form.mentor_ids.includes(m.id);
                        return (
                          <label
                            key={m.id}
                            className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs
                              ${checked ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-white/5 text-white/70"}`}
                          >
                            <input
                              type="checkbox"
                              className="accent-cyan-400"
                              checked={checked}
                              onChange={(e) => {
                                setForm((f) => {
                                  const set = new Set(f.mentor_ids);
                                  if (e.target.checked) set.add(m.id);
                                  else set.delete(m.id);
                                  return { ...f, mentor_ids: Array.from(set) };
                                });
                              }}
                            />
                            <Users2 className="h-3.5 w-3.5" />
                            {m.name}
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-1 text-[11px] text-white/50">Pilih minimal 1 mentor.</div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs text-white/60">Kurikulum Terkait</label>
                  <div className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      {curriculum.map((c) => {
                        const checked = form.curriculum_ids.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-xs
                              ${checked ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-white/5 text-white/70"}`}
                          >
                            <input
                              type="checkbox"
                              className="accent-cyan-400"
                              checked={checked}
                              onChange={(e) => {
                                setForm((f) => {
                                  const set = new Set(f.curriculum_ids);
                                  if (e.target.checked) set.add(c.id);
                                  else set.delete(c.id);
                                  return { ...f, curriculum_ids: Array.from(set) };
                                });
                              }}
                            />
                            <Tag className="h-3.5 w-3.5" />
                            {c.code}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-white/60">Harga (Rp)</label>
                  <input
                    type="number"
                    value={form.price}
                    min={0}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                  />
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-cyan-400"
                      checked={form.visible}
                      onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
                    />
                    Tampilkan di landing
                  </label>
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
    </div>
  );
}
