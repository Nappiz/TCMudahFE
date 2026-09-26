"use client";

import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useGlobalError } from "@/components/providers/ErrorProvider";
import Modal from "@/components/modal/Modal";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import { toEmbedUrl } from "../../../../../lib/embed";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type Me = { id: string; email: string; full_name: string; role: Role };

type ClassItem = {
  id: string;
  title: string;
  description: string;
  mentor_ids?: string[];
  curriculum_ids: string[];
  price: number;
  visible: boolean;
};

type Material = {
  id: string;
  class_id: string;
  type: "video" | "ppt";
  title: string;
  url: string;
  visible: boolean;
  created_at?: string;
};

type MaterialForm = {
  type: "video" | "ppt";
  title: string;
  url: string;
  visible: boolean;
};

const API_BASE = "/api";
const EMPTY_FORM: MaterialForm = {
  type: "video",
  title: "",
  url: "",
  visible: true,
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
  if (!response.ok) {
    let message = response.statusText;
    try {
      const payload = await response.json();
      if (payload?.detail) {
        message =
          typeof payload.detail === "string"
            ? payload.detail
            : JSON.stringify(payload.detail);
      }
    } catch {}
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export default function CMSMaterialsByClassPage() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId;
  const { showError } = useGlobalError();
  const { confirm, modal: confirmModal } = useConfirmModal();

  const [me, setMe] = useState<Me | null>(null);
  const [klass, setKlass] = useState<ClassItem | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<Material["type"]>("video");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [visibilityId, setVisibilityId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successTitle, setSuccessTitle] = useState("Materi tersimpan");
  const [successMessage, setSuccessMessage] = useState(
    "Materi baru berhasil ditambahkan ke kelas ini dan siap dikelola.",
  );
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<MaterialForm>(EMPTY_FORM);

  useEffect(() => {
    let cancelled = false;
    setActiveType("video");
    setPreviewId(null);
    setQuery("");
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const currentUser = await api<Me>("/me");
        if (cancelled) return;
        setMe(currentUser);

        const [classData, materialData] = await Promise.all([
          api<ClassItem>(`/admin/classes/${classId}`),
          api<Material[]>(
            `/admin/materials?class_id=${encodeURIComponent(classId)}`,
          ),
        ]);
        if (cancelled) return;
        setKlass(classData);
        setMaterials(materialData);
      } catch (errorValue: unknown) {
        if (!cancelled) {
          setError(
            errorValue instanceof Error
              ? errorValue.message
              : "Gagal memuat materials.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [classId]);

  const canWrite =
    me?.role === "admin" || me?.role === "superadmin" || me?.role === "mentor";

  const filteredMaterials = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return materials;
    return materials.filter((item) =>
      item.title.toLowerCase().includes(normalizedQuery),
    );
  }, [materials, query]);

  const activeMaterials = useMemo(
    () => filteredMaterials.filter((item) => item.type === activeType),
    [activeType, filteredMaterials],
  );

  const typeCounts = useMemo(
    () => ({
      video: materials.filter((item) => item.type === "video").length,
      ppt: materials.filter((item) => item.type === "ppt").length,
    }),
    [materials],
  );
  const activeTypeLabel = activeType === "video" ? "video" : "PPT / Slides";

  function openNew() {
    setEditingMaterial(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  }

  function openEdit(material: Material) {
    setEditingMaterial(material);
    setForm({
      type: material.type,
      title: material.title,
      url: material.url,
      visible: material.visible,
    });
    setModalOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite || saving) return;
    if (!form.title.trim()) return showError("Judul wajib diisi.");
    if (!form.url.trim()) return showError("URL wajib diisi.");

    setSaving(true);
    const isEditing = editingMaterial !== null;
    try {
      const payload = {
        type: form.type,
        title: form.title.trim(),
        url: form.url.trim(),
        visible: form.visible,
      };
      const saved = await api<Material>(
        isEditing
          ? `/admin/materials/${editingMaterial.id}`
          : "/admin/materials",
        {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify(
            isEditing ? payload : { class_id: classId, ...payload },
          ),
        },
      );
      setMaterials((current) =>
        isEditing
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current],
      );
      setSuccessTitle(isEditing ? "Materi diperbarui" : "Materi tersimpan");
      setSuccessMessage(
        isEditing
          ? "Perubahan materi berhasil disimpan."
          : "Materi baru berhasil ditambahkan ke kelas ini dan siap dikelola.",
      );
      setForm({ ...EMPTY_FORM });
      setEditingMaterial(null);
      setModalOpen(false);
      setSuccessOpen(true);
    } catch (errorValue: unknown) {
      showError(
        errorValue instanceof Error
          ? errorValue.message
          : isEditing
            ? "Gagal memperbarui materi."
            : "Gagal menyimpan materi.",
      );
    } finally {
      setSaving(false);
    }
  }

  function closeMaterialModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingMaterial(null);
  }

  async function toggleVisible(material: Material) {
    if (!canWrite || visibilityId) return;
    setVisibilityId(material.id);
    try {
      const updated = await api<Material>(`/admin/materials/${material.id}`, {
        method: "PATCH",
        body: JSON.stringify({ visible: !material.visible }),
      });
      setMaterials((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (errorValue: unknown) {
      showError(
        errorValue instanceof Error
          ? errorValue.message
          : "Gagal memperbarui visibilitas.",
      );
    } finally {
      setVisibilityId(null);
    }
  }

  async function remove(material: Material) {
    if (!canWrite || deletingId) return;
    await confirm({
      title: "Hapus materi?",
      message: `Hapus materi "${material.title}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Hapus materi",
      variant: "danger",
      onConfirm: async () => {
        setDeletingId(material.id);
        try {
          await api(`/admin/materials/${material.id}`, { method: "DELETE" });
          setMaterials((current) =>
            current.filter((item) => item.id !== material.id),
          );
          if (previewId === material.id) setPreviewId(null);
        } catch (errorValue: unknown) {
          showError(
            errorValue instanceof Error
              ? errorValue.message
              : "Gagal menghapus materi.",
          );
        } finally {
          setDeletingId(null);
        }
      },
    });
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-3 w-24 rounded-full bg-white/[0.08]" />
        <div className="h-8 w-72 rounded-full bg-white/[0.08]" />
        <div className="h-4 w-96 max-w-full rounded-full bg-white/[0.06]" />
        <div className="h-52 rounded-2xl border border-white/[0.08] bg-white/[0.03]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-5 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <header className="border-b border-white/[0.08] pb-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <Link
              href="/cms/materials"
              className="text-xs font-medium text-white/45 transition hover:text-cyan-200"
            >
              ← Semua kelas
            </Link>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300/70">
              Materi kelas
            </p>
            <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-white">
              {klass?.title ?? "Kelas"}
            </h1>
            <p className="mt-1 text-sm text-white/50">
              {materials.length} materi tersimpan
            </p>
          </div>
          {canWrite ? (
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center justify-center rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Tambah materi
            </button>
          ) : null}
        </div>
      </header>

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035]">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Daftar materi</h2>
            <p className="mt-1 text-xs text-white/45">
              {activeMaterials.length} dari {typeCounts[activeType]} materi
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-xl border border-white/[0.1] bg-slate-950/45 p-1">
              {[
                { type: "video" as const, label: "Video" },
                { type: "ppt" as const, label: "PPT / Slides" },
              ].map((filter) => {
                const selected = activeType === filter.type;
                return (
                  <button
                    key={filter.type}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setActiveType(filter.type);
                      setPreviewId(null);
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      selected
                        ? "bg-cyan-300 text-slate-950 shadow-sm"
                        : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    {filter.label}
                    <span className="ml-1.5 opacity-60">
                      {typeCounts[filter.type]}
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="relative block w-full sm:w-64">
              <span className="sr-only">Cari materi</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari judul materi..."
                className="w-full rounded-xl border border-white/[0.1] bg-slate-950/45 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40 focus:bg-slate-950/70"
              />
            </label>
          </div>
        </div>

        {activeMaterials.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-white">
              {typeCounts[activeType] === 0
                ? `Belum ada materi ${activeTypeLabel}`
                : "Materi tidak ditemukan"}
            </p>
            <p className="mt-1 text-sm text-white/45">
              {typeCounts[activeType] === 0
                ? "Tambahkan materi dari tombol di atas untuk memulai."
                : "Coba gunakan kata kunci lain."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {activeMaterials.map((material) => {
              const isPreviewOpen = previewId === material.id;
              const isVisibilityUpdating = visibilityId === material.id;
              const isDeleting = deletingId === material.id;

              return (
                <article
                  key={material.id}
                  className="p-5 transition hover:bg-white/[0.02]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
                        <span
                          className={
                            material.visible
                              ? "text-emerald-300/70"
                              : "text-white/35"
                          }
                        >
                          {material.visible ? "Tampil" : "Disembunyikan"}
                        </span>
                      </div>
                      <h3 className="mt-2 truncate text-base font-semibold text-white">
                        {material.title}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-300 transition hover:text-cyan-200 hover:underline"
                        >
                          Buka sumber
                        </a>
                        <span className="text-white/20">•</span>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewId(isPreviewOpen ? null : material.id)
                          }
                          className="text-white/50 transition hover:text-white"
                        >
                          {isPreviewOpen ? "Tutup preview" : "Lihat preview"}
                        </button>
                      </div>
                    </div>

                    {canWrite ? (
                      <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                        <button
                          type="button"
                          onClick={() => openEdit(material)}
                          disabled={
                            Boolean(visibilityId) || Boolean(deletingId)
                          }
                          className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-medium text-cyan-100/80 transition hover:border-cyan-300/40 hover:bg-cyan-300/[0.08] hover:text-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleVisible(material)}
                          disabled={
                            Boolean(visibilityId) || Boolean(deletingId)
                          }
                          className="rounded-lg border border-white/[0.12] px-3 py-2 text-xs font-medium text-white/70 transition hover:border-cyan-300/30 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isVisibilityUpdating
                            ? "Menyimpan..."
                            : material.visible
                              ? "Sembunyikan"
                              : "Tampilkan"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(material)}
                          disabled={
                            Boolean(visibilityId) || Boolean(deletingId)
                          }
                          className="rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-medium text-rose-200/80 transition hover:border-rose-300/40 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {isPreviewOpen ? (
                    <div className="mt-5 max-w-3xl overflow-hidden rounded-xl border border-white/[0.08] bg-black/25">
                      <iframe
                        title={`Pratinjau ${material.title}`}
                        src={toEmbedUrl(material.url)}
                        className="aspect-video w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Modal
        open={modalOpen}
        onClose={closeMaterialModal}
        dismissible={!saving}
        title={editingMaterial ? "Edit materi" : "Tambah materi"}
        size="lg"
      >
        <form onSubmit={(event) => void save(event)}>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-4">
              <fieldset>
                <legend className="text-xs font-medium text-white/55">
                  Jenis materi
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    {
                      type: "video" as const,
                      label: "Video",
                      detail: "YouTube atau Drive",
                    },
                    {
                      type: "ppt" as const,
                      label: "PPT / Slides",
                      detail: "Presentasi pembelajaran",
                    },
                  ].map((option) => {
                    const selected = form.type === option.type;
                    return (
                      <button
                        key={option.type}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            type: option.type,
                          }))
                        }
                        className={`rounded-xl border px-3 py-3 text-left transition ${
                          selected
                            ? "border-cyan-300/45 bg-cyan-300/[0.1] text-white"
                            : "border-white/[0.1] bg-slate-900/45 text-white/55 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <span className="block text-sm font-semibold">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-[11px] text-current/55">
                          {option.detail}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="material-title"
                  className="text-xs font-medium text-white/55"
                >
                  Judul materi
                </label>
                <input
                  id="material-title"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Pertemuan 1 - Pengenalan"
                  className="mt-2 w-full rounded-xl border border-white/[0.1] bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40"
                />
              </div>

              <div>
                <label
                  htmlFor="material-url"
                  className="text-xs font-medium text-white/55"
                >
                  Link sumber
                </label>
                <input
                  id="material-url"
                  value={form.url}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      url: event.target.value,
                    }))
                  }
                  placeholder="https://drive.google.com/... atau https://youtu.be/..."
                  className="mt-2 w-full rounded-xl border border-white/[0.1] bg-slate-900/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/40"
                />
                <p className="mt-2 text-xs leading-relaxed text-white/35">
                  Gunakan link share dari Drive, YouTube, atau Slides.
                </p>
              </div>

              <label className="flex items-center gap-3 text-sm text-white/65">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      visible: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-cyan-300"
                />
                Tampilkan setelah disimpan
              </label>
            </div>

            <div className="min-h-52 rounded-xl border border-white/[0.08] bg-black/20 p-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/40">
                Preview
              </p>
              {form.url.trim() ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-white/[0.08]">
                  <iframe
                    title="Pratinjau materi baru"
                    src={toEmbedUrl(form.url)}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex min-h-40 items-center justify-center px-6 text-center text-sm text-white/35">
                  Tempel link untuk melihat preview.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={closeMaterialModal}
              disabled={saving}
              className="rounded-xl px-3 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving
                ? "Menyimpan..."
                : editingMaterial
                  ? "Simpan perubahan"
                  : "Simpan materi"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={successTitle}
        variant="success"
        size="sm"
        actions={[
          {
            label: "Selesai",
            variant: "primary",
            onClick: () => setSuccessOpen(false),
            autoFocus: true,
          },
        ]}
      >
        <p className="text-sm leading-relaxed text-white/70">
          {successMessage}
        </p>
      </Modal>

      {confirmModal}
    </div>
  );
}
