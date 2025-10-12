"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Plus, Search, Trash2, Save, X, Eye, EyeOff, Film, FileText, Link2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toEmbedUrl } from "../../../../../lib/embed";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type Me = { id: string; email: string; full_name: string; role: Role };

type ClassItem = {
  id: string;
  title: string;
  description: string;
  mentor_ids?: string[]; // ignore disini
  curriculum_ids: string[];
  price: number;
  visible: boolean;
};

type Material = {
  id: string;
  class_id: string;
  kind: "video" | "ppt";
  title: string;
  url: string;
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

export default function CMSMaterialsByClassPage() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId;

  const [me, setMe] = useState<Me | null>(null);
  const [klass, setKlass] = useState<ClassItem | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // UI state
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<{
    kind: "video" | "ppt";
    title: string;
    url: string; // <<< paste URL Drive/Slides/YouTube
    visible: boolean;
  }>({
    kind: "video",
    title: "",
    url: "",
    visible: true,
  });

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const m = await api<Me>("/me");
        if (cancel) return;
        setMe(m);

        // ambil 1 kelas & daftar materials
        const [c, mats] = await Promise.all([
          api<ClassItem>(`/admin/classes/${classId}`),
          api<Material[]>(`/admin/materials?class_id=${encodeURIComponent(classId)}`),
        ]);
        if (cancel) return;
        setKlass(c);
        setMaterials(mats);
      } catch (e: any) {
        setErr(e?.message ?? "Gagal memuat materials.");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [classId]);

  const canWrite = useMemo(() => me && (me.role === "admin" || me.role === "superadmin" || me.role === "mentor"), [me]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return materials;
    return materials.filter((m) => (m.title || "").toLowerCase().includes(s));
  }, [materials, q]);

  function openNew() {
    setForm({
      kind: "video",
      title: "",
      url: "",
      visible: true,
    });
    setModalOpen(true);
  }

  async function save() {
    if (!canWrite) return;
    if (!form.title.trim()) return alert("Judul wajib diisi.");
    if (!form.url.trim()) return alert("URL wajib diisi.");

    setSaving(true);
    try {
      const payload = {
        class_id: classId,
        kind: form.kind,
        title: form.title,
        url: form.url.trim(),
        visible: form.visible,
      };
      const created = await api<Material>("/admin/materials", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMaterials((prev) => [created, ...prev]);
      setModalOpen(false);
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan materi.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisible(it: Material) {
    if (!canWrite) return;
    try {
      const updated = await api<Material>(`/admin/materials/${it.id}`, {
        method: "PATCH",
        body: JSON.stringify({ visible: !it.visible }),
      });
      setMaterials((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e: any) {
      alert(e?.message ?? "Gagal memperbarui visibilitas.");
    }
  }

  async function remove(it: Material) {
    if (!canWrite) return;
    if (!confirm(`Hapus materi "${it.title}"?`)) return;
    try {
      await api(`/admin/materials/${it.id}`, { method: "DELETE" });
      setMaterials((prev) => prev.filter((x) => x.id !== it.id));
    } catch (e: any) {
      alert(e?.message ?? "Gagal menghapus materi.");
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-pulse text-white/70">Memuat…</div>;
  }
  if (err) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-rose-300">{String(err)}</div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs text-white/60">Materi untuk kelas</div>
            <h1 className="text-xl font-bold text-white">{klass?.title ?? "—"}</h1>
            <p className="text-sm text-white/70">Upload via Drive/YouTube/Slides, lalu tempel URL di sini.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64 max-w-[60vw]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul materi…"
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

      {/* List */}
      <div className="grid gap-3">
        {filtered.map((m) => {
          const isVideo = m.kind === "video";
          const embed = toEmbedUrl(m.url);
          return (
            <div key={m.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 text-xs text-white/70">
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/10 px-2 py-0.5">
                      {isVideo ? <Film className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                      {isVideo ? "Video" : "PPT / Slides"}
                    </span>
                    <span className="text-white/40">•</span>
                    <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan-300 hover:underline">
                      <Link2 className="h-3.5 w-3.5" />
                      Buka sumber
                    </a>
                  </div>
                  <div className="mt-1 text-white font-medium truncate">{m.title}</div>

                  <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                    <iframe
                      src={embed}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
                <div className="shrink-0 space-y-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleVisible(m)} className="w-28 inline-flex items-center gap-2">
                    {m.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {m.visible ? "Tampilkan" : "Hidden"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(m)} className="w-28 inline-flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">Belum ada materi.</div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setModalOpen(false)} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-white font-semibold">Tambah Materi</div>
              <button onClick={() => !saving && setModalOpen(false)} className="rounded-lg border border-white/15 p-2 text-white/80">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-white/60">Jenis</label>
                  <select
                    value={form.kind}
                    onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as "video" | "ppt" }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                  >
                    <option value="video">Video (Drive / YouTube)</option>
                    <option value="ppt">PPT / Slides</option>
                  </select>
                </div>
                <div className="sm:col-span-2 flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-cyan-400"
                      checked={form.visible}
                      onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
                    />
                    Tampilkan
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60">Judul</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                  placeholder="Contoh: Pertemuan 1 - Pengenalan"
                />
              </div>

              <div>
                <label className="text-xs text-white/60">URL (Drive/YouTube/Slides)</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-white outline-none focus:border-white/30"
                  placeholder="Tempel link share, mis. https://drive.google.com/file/d/..../view atau https://youtu.be/....."
                />
                {form.url ? (
                  <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                    <iframe
                      src={toEmbedUrl(form.url)}
                      className="aspect-video w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button variant="secondary" onClick={save} disabled={saving} className="inline-flex items-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
