"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { apiMaterialsByClass, fetchCatalog } from "../../../../../lib/api";
import type { ClassMaterial, Catalog } from "@/types/catalog";
import { PlayCircle, FileText, Download, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function extractDriveId(url: string): string | null {
  const m = url.match(/\/file\/d\/([^/]+)\//);
  if (m?.[1]) return m[1];
  const m2 = url.match(/[?&]id=([^&]+)/);
  if (m2?.[1]) return m2[1];
  return null;
}
function toDrivePreview(url: string): string | null {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}
function toDriveDownload(url: string): string | null {
  const id = extractDriveId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : null;
}

function extractYouTubeId(url: string): string | null {
  let m = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (m?.[1]) return m[1];
  m = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (m?.[1]) return m[1];
  m = url.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
  if (m?.[1]) return m[1];
  return null;
}
function toYouTubeEmbed(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&controls=1&fs=1` : null;
}

function toDocsViewer(url: string): string {
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
}

function FullscreenOverlay({
  open,
  title,
  src,
  onClose,
}: {
  open: boolean;
  title: string;
  src: string | null;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const el = containerRef.current;
    (async () => {
      try {
        await el.requestFullscreen?.();
      } catch {}
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().finally(onClose);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const closeAll = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().finally(onClose);
    } else {
      onClose();
    }
  }, [onClose]);

  const onBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeAll();
      }
    },
    [closeAll]
  );

  return (
    <AnimatePresence>
      {open && src && (
        <motion.div
          className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={onBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_50%,rgba(59,130,246,0.18),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_70%_30%,rgba(14,165,233,0.18),transparent_60%)]" />
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col p-4" ref={containerRef}>
            <div className="mb-3 flex items-center justify-between text-white">
              <div className="line-clamp-1 text-sm opacity-80">{title}</div>
              <button
                onClick={closeAll}
                className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
                Tutup
              </button>
            </div>

            <motion.div
              className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <iframe
                src={src}
                className="h-full w-full"
                allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer"
              />
              <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function KelasDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [fsOpen, setFsOpen] = useState(false);
  const [fsSrc, setFsSrc] = useState<string | null>(null);
  const [fsTitle, setFsTitle] = useState<string>("");

  const openFs = useCallback((title: string, src: string) => {
    setFsTitle(title);
    setFsSrc(src);
    setFsOpen(true);
  }, []);
  const closeFs = useCallback(() => {
    setFsOpen(false);
    setFsSrc(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [m, c] = await Promise.all([apiMaterialsByClass(id), fetchCatalog()]);
        setMaterials(m);
        setCatalog(c);
      } catch (e: any) {
        setErr(e?.message || "Gagal memuat materi.");
      }
    })();
  }, [id]);

  const cls = useMemo(() => catalog?.classes.find((c) => c.id === id), [catalog, id]);
  const videos = materials.filter((m) => m.type === "video");
  const ppts = materials.filter((m) => m.type === "ppt");

  const onContextMenu = useCallback((e: React.MouseEvent) => e.preventDefault(), []);
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) e.preventDefault();
  }, []);

  return (
    <div className="space-y-6" onContextMenu={onContextMenu} onKeyDown={onKeyDown} tabIndex={0}>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6">
        <div aria-hidden className="pointer-events-none absolute -inset-10 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(55%_40%_at_20%_10%,rgba(59,130,246,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(45%_35%_at_80%_10%,rgba(14,165,233,0.18),transparent_65%)]" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Kelas Aktif
          </span>
          <span className="text-white/60 text-xs">/</span>
          <span className="text-white/70 text-xs">Materi & Rekaman</span>
        </div>

        <div className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">
          {cls?.title ?? "Kelas"}
        </div>
        {cls?.description && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">{cls.description}</p>
        )}
      </div>

      {err && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">{err}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/70">
            <PlayCircle className="h-4 w-4" /> Video Recording
          </div>

          {videos.length === 0 ? (
            <div className="text-sm text-white/60">Belum ada video.</div>
          ) : (
            <ul className="space-y-4">
              {videos.map((v) => {
                const yt = toYouTubeEmbed(v.url);
                const drv = toDrivePreview(v.url);
                const src = yt || drv || toDocsViewer(v.url);

                return (
                  <li
                    key={v.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-3 transition hover:border-white/20"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="line-clamp-2 pr-3 text-sm text-white">{v.title}</div>
                      <button
                        onClick={() => openFs(v.title, src!)}
                        className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98]"
                        title="Tampilkan layar penuh"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        Full screen
                      </button>
                    </div>

                    <div className="relative">
                      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-0 blur-xl transition group-hover:opacity-40">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/10 to-indigo-400/20" />
                      </div>

                      <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                        <iframe
                          src={src!}
                          className="h-full w-full"
                          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                          allowFullScreen={false}
                          sandbox="allow-scripts allow-same-origin allow-forms"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-white/50">
                      Catatan: Download dinonaktifkan. Diharapkan tidak membagikan ke luar kelas.
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
          <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/70">
            <FileText className="h-4 w-4" /> PPT Materi
          </div>

          {ppts.length === 0 ? (
            <div className="text-sm text-white/60">Belum ada materi.</div>
          ) : (
            <ul className="space-y-4">
              {ppts.map((d) => {
                const preview = toDrivePreview(d.url) || toDocsViewer(d.url);
                const download = toDriveDownload(d.url) || d.url;

                return (
                  <li
                    key={d.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-3 transition hover:border-white/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="line-clamp-2 pr-3 text-sm text-white">{d.title}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openFs(d.title, preview)}
                          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98]"
                          title="Tampilkan layar penuh"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                          Full screen
                        </button>
                        <a
                          href={download}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98]"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    </div>

                    <div className="mt-2 h-[440px] w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                      <iframe
                        src={preview}
                        className="h-full w-full"
                        allow="autoplay; encrypted-media; fullscreen"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <FullscreenOverlay open={fsOpen} title={fsTitle} src={fsSrc} onClose={closeFs} />
    </div>
  );
}
