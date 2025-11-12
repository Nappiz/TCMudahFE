"use client";

import type { ClassMaterial } from "@/types/catalog";
import { PlayCircle, Maximize2 } from "lucide-react";
import {
  toYouTubeEmbed,
  toDrivePreview,
  toDocsViewer,
} from "../../../../../../lib/mediaEmbeds";

type VideoSectionProps = {
  videos: ClassMaterial[];
  onOpenFullscreen: (title: string, src: string) => void;
};

export function VideoSection({ videos, onOpenFullscreen }: VideoSectionProps) {
  if (videos.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
        <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/70">
          <PlayCircle className="h-4 w-4" /> Video Recording
        </div>
        <div className="text-sm text-white/60">Belum ada video.</div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
      <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/70">
        <PlayCircle className="h-4 w-4" /> Video Recording
      </div>

      <ul className="space-y-4">
        {videos.map((v) => {
          const yt = toYouTubeEmbed(v.url);
          const drv = toDrivePreview(v.url);
          const src = yt || drv || toDocsViewer(v.url);

          if (!src) return null;

          return (
            <li
              key={v.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-3 transition hover:border-white/20"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="line-clamp-2 pr-3 text-sm text-white">
                  {v.title}
                </div>
                <button
                  onClick={() => onOpenFullscreen(v.title, src)}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98]"
                  title="Tampilkan layar penuh"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Full screen
                </button>
              </div>

              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 opacity-0 blur-xl transition group-hover:opacity-40"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-blue-500/10 to-indigo-400/20" />
                </div>

                <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                  <iframe
                    src={src}
                    className="h-full w-full"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen={false}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <p className="mt-2 text-xs text-white/50">
                Catatan: Download dinonaktifkan. Diharapkan tidak membagikan ke
                luar kelas.
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
