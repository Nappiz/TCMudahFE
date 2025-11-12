"use client";

import { useCallback, useMemo, useState } from "react";
import type { ClassMaterial } from "@/types/catalog";
import { useClassMaterials } from "@/hooks/useClassMaterials";
import { FullscreenOverlay } from "./FullscreenOverlay";
import { VideoSection } from "./VideoSection";
import { PptSection } from "./PptSection";

type Props = {
  classId: string;
};

type Tab = "video" | "ppt";

export default function KelasDetailPage({ classId }: Props) {
  const { materials, catalog, loading, error } = useClassMaterials(classId);

  const [activeTab, setActiveTab] = useState<Tab>("video");
  const [fsOpen, setFsOpen] = useState(false);
  const [fsSrc, setFsSrc] = useState<string | null>(null);
  const [fsTitle, setFsTitle] = useState<string>("");

  const cls = useMemo(
    () => catalog?.classes.find((c) => c.id === classId),
    [catalog, classId]
  );

  const videos: ClassMaterial[] = useMemo(
    () => materials.filter((m) => m.type === "video"),
    [materials]
  );

  const ppts: ClassMaterial[] = useMemo(
    () => materials.filter((m) => m.type === "ppt"),
    [materials]
  );

  const openFs = useCallback((title: string, src: string) => {
    setFsTitle(title);
    setFsSrc(src);
    setFsOpen(true);
  }, []);

  const closeFs = useCallback(() => {
    setFsOpen(false);
    setFsSrc(null);
  }, []);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      ["s", "p"].includes(e.key.toLowerCase())
    ) {
      e.preventDefault();
    }
  }, []);

  const rupiah = useCallback(
    (n: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(n),
    []
  );

  return (
    <div
      className="space-y-6"
      onContextMenu={onContextMenu}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-10 -z-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(55%_40%_at_20%_10%,rgba(59,130,246,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(45%_35%_at_80%_10%,rgba(14,165,233,0.18),transparent_65%)]" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Kelas Aktif
              </span>
              <span className="text-white/60 text-xs">
                / Materi & Rekaman
              </span>
            </div>

            <div className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">
              {cls?.title ?? "Kelas"}
            </div>
            {cls?.description && (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
                {cls.description}
              </p>
            )}
          </div>

        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          Memuat materi kelas…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("video")}
            className={`cursor-pointer min-w-[140px] px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === "video"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            Video Recording
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ppt")}
            className={`cursor-pointer min-w-[140px] px-4 py-2 text-xs font-medium rounded-xl transition ${
              activeTab === "ppt"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            PPT Materi
          </button>
        </div>
      </div>

      {!loading && !error && (
        <>
          {activeTab === "video" ? (
            <VideoSection videos={videos} onOpenFullscreen={openFs} />
          ) : (
            <PptSection ppts={ppts} onOpenFullscreen={openFs} />
          )}
        </>
      )}

      <FullscreenOverlay
        open={fsOpen}
        title={fsTitle}
        src={fsSrc}
        onClose={closeFs}
      />
    </div>
  );
}
