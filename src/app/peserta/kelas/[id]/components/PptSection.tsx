"use client";

import type { ClassMaterial } from "@/types/catalog";
import { FileText, Maximize2, Download } from "lucide-react";
import {
  toDrivePreview,
  toDriveDownload,
  toDocsViewer,
} from "../../../../../../lib/mediaEmbeds";

type PptSectionProps = {
  ppts: ClassMaterial[];
  onOpenFullscreen: (title: string, src: string) => void;
};

export function PptSection({ ppts, onOpenFullscreen }: PptSectionProps) {
  if (ppts.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
        <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/70">
          <FileText className="h-4 w-4" /> PPT Materi
        </div>
        <div className="text-sm text-white/60">Belum ada materi.</div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
      <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/70">
        <FileText className="h-4 w-4" /> PPT Materi
      </div>

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
                <div className="line-clamp-2 pr-3 text-sm text-white">
                  {d.title}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenFullscreen(d.title, preview)}
                    className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98]"
                    title="Tampilkan layar penuh"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Full screen
                  </button>
                  <a
                    href={download}
                    target="_blank"
                    rel="noreferrer"
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
    </section>
  );
}
