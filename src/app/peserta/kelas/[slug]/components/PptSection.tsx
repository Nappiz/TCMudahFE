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

import { motion } from "framer-motion";

export function PptSection({ ppts, onOpenFullscreen }: PptSectionProps) {
  if (ppts.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/30 p-10 text-center">
        <div className="mb-3 mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white/30">
          <FileText className="h-6 w-6" />
        </div>
        <div className="text-sm font-medium text-white/60">Belum ada materi dokumen.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ppts.map((d, i) => {
        const preview = toDrivePreview(d.url) || toDocsViewer(d.url);
        const download = toDriveDownload(d.url) || d.url;

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={d.id}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-4 transition duration-300 hover:border-cyan-500/30 hover:bg-slate-900/80 shadow-lg backdrop-blur-sm"
          >
            <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3">
                 <div className="shrink-0 p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                 </div>
                 <div>
                    <div className="font-bold text-white text-base leading-tight group-hover:text-cyan-300 transition-colors">
                      {d.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-medium">Format PDF / PPTX</div>
                 </div>
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2">
                <button
                  onClick={() => onOpenFullscreen(d.title, preview)}
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold text-cyan-400 transition hover:bg-cyan-500 hover:text-slate-950 shadow-sm"
                  title="Expand preview"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Expand
                </button>
                <a
                  href={download}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:bg-white hover:text-slate-900 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  Unduh
                </a>
              </div>
            </div>

            <div className="mt-3 h-[420px] w-full overflow-hidden rounded-2xl border border-white/5 bg-black/60 shadow-inner group-hover:border-cyan-500/20 transition-colors">
              <iframe
                src={preview}
                className="h-full w-full opacity-90 group-hover:opacity-100 transition-opacity"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
