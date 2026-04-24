"use client";

import { useMemo, useState } from "react";
import type { ClassMaterial } from "@/types/catalog";
import { useClassMaterials } from "@/hooks/useClassMaterials";
import { Loader2, PlayCircle, FileText, ChevronRight, AlertCircle, Sparkles, Video, Download, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toDrivePreview, toDriveDownload, toDocsViewer } from "../../../../../../lib/mediaEmbeds";

type Props = {
  classId?: string;
  slug?: string;
};

type Tab = "video" | "ppt";

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
     let id = "";
     if (url.includes("v=")) {
        id = url.split("v=")[1]?.split("&")[0];
     } else {
        id = url.split("/").pop() || "";
     }
     return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
  }
  if (url.includes("drive.google.com")) {
     return url.replace(/\/view.*/, "/preview").replace(/\/edit.*/, "/preview");
  }
  return url;
};

export default function KelasDetailPage({ classId, slug }: Props) {
  const { materials, catalog, loading, error } = useClassMaterials({ id: classId, slug });
  const [activeTab, setActiveTab] = useState<Tab>("video");
  const [activeVideo, setActiveVideo] = useState<ClassMaterial | null>(null);
  const [activePpt, setActivePpt] = useState<ClassMaterial | null>(null);

  const cls = useMemo(() => {
     if (!catalog) return undefined;
     if (classId) return catalog.classes.find((c) => c.id === classId);
     if (slug) {
         const decoded = decodeURIComponent(slug);
         return catalog.classes.find(c => 
             c.title.toLowerCase().replace(/\s+/g, '-') === decoded ||
             encodeURIComponent(c.title.toLowerCase().replace(/\s+/g, '-')) === slug
         );
     }
     return undefined;
  }, [catalog, classId, slug]);

  const videos = useMemo(() => materials.filter((m) => m.type === "video"), [materials]);
  const ppts = useMemo(() => materials.filter((m) => m.type === "ppt"), [materials]);

  useMemo(() => {
     if (videos.length > 0 && !activeVideo) setActiveVideo(videos[0]);
  }, [videos, activeVideo]);

  useMemo(() => {
     if (ppts.length > 0 && !activePpt) setActivePpt(ppts[0]);
  }, [ppts, activePpt]);

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" /></div>;
  
  if (error) return (
    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" /> 
        <span>Gagal memuat materi: {error}</span>
    </div>
  );

  return (
    <motion.div 
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="space-y-8 pb-10"
    >
       {/* HEADER SECTION */}
       <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-900/30 to-blue-900/20 border border-white/5 p-6 md:p-10 shadow-2xl shadow-cyan-900/10 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
             <div className="flex items-center gap-2 text-[11px] font-bold text-cyan-400 uppercase tracking-widest mb-4">
                <span>Dashboard</span> 
                <ChevronRight className="w-3 h-3 text-cyan-500/50" /> 
                <span className="text-white">Kelas</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-md">
                 {cls?.title}
             </h1>
             <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
                 Pelajari materi yang tersedia di bawah ini. Pastikan Anda menyelesaikan kelas dari awal agar mendapatkan pemahaman yang mendalam.
             </p>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* MAIN PLAYER AREA */}
          <div className="lg:col-span-2 space-y-6">
             <AnimatePresence mode="wait">
                 <motion.div
                    key={activeTab + (activeVideo?.id || '')}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                 >
                     {activeTab === 'video' ? (
                        activeVideo ? (
                            <div className="space-y-6">
                                <div className="rounded-3xl overflow-hidden bg-black/80 border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.1)] ring-1 ring-cyan-500/20 aspect-video relative group">
                                    <iframe
                                        src={getEmbedUrl(activeVideo.url)} 
                                        className="w-full h-full relative z-10"
                                        allowFullScreen
                                        allow="autoplay; encrypted-media; picture-in-picture"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute top-0 right-0 w-24 h-24 z-20 cursor-default bg-transparent" />
                                </div>
                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                                   <div className="flex items-center gap-3 mb-2">
                                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                                         <Video className="w-5 h-5" />
                                      </div>
                                      <h3 className="text-xl font-bold text-white tracking-tight">{activeVideo.title}</h3>
                                   </div>
                                   <div className="flex items-center gap-3 text-xs text-slate-400 mt-4 border-t border-white/5 pt-4">
                                      <span className="flex items-center gap-1.5 bg-cyan-500/10 text-cyan-300 font-medium px-3 py-1 rounded-full border border-cyan-500/20">
                                          <Sparkles className="w-3 h-3" /> Video Recording
                                      </span>
                                      <span>&bull;</span>
                                      <span>Diunggah pada {new Date(activeVideo.created_at || Date.now()).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                   </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-3xl bg-slate-900/50 border border-white/5 h-80 flex flex-col items-center justify-center text-slate-500 gap-4 backdrop-blur-md shadow-inner">
                               <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                   <PlayCircle className="w-10 h-10 opacity-30" />
                               </div>
                               <p className="font-medium text-sm">Tidak ada video di kelas ini.</p>
                            </div>
                        )
                     ) : activeTab === 'ppt' ? (
                        activePpt ? (() => {
                            const preview = toDrivePreview(activePpt.url) || toDocsViewer(activePpt.url);
                            const download = toDriveDownload(activePpt.url) || activePpt.url;
                            return (
                                <div className="space-y-6">
                                    <div className="rounded-3xl overflow-hidden bg-black/80 border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.1)] ring-1 ring-cyan-500/20 h-[600px] relative group">
                                        <iframe
                                            src={preview} 
                                            className="w-full h-full relative z-10"
                                            allowFullScreen
                                            allow="autoplay; encrypted-media; picture-in-picture"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                           <div className="flex items-center gap-3">
                                              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                                                 <FileText className="w-5 h-5" />
                                              </div>
                                              <h3 className="text-xl font-bold text-white tracking-tight">{activePpt.title}</h3>
                                           </div>
                                           <div className="flex items-center gap-2">
                                              <a href={download} target="_blank" rel="noreferrer" className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                                                  <Download className="w-4 h-4" /> Unduh Dokumen
                                              </a>
                                           </div>
                                       </div>
                                       <div className="flex items-center gap-3 text-xs text-slate-400 mt-4 border-t border-white/5 pt-4">
                                          <span className="flex items-center gap-1.5 bg-cyan-500/10 text-cyan-300 font-medium px-3 py-1 rounded-full border border-cyan-500/20">
                                              <FileText className="w-3 h-3" /> Dokumen Materi
                                          </span>
                                          <span>&bull;</span>
                                          <span>Ditambahkan pada {new Date(activePpt.created_at || Date.now()).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                       </div>
                                    </div>
                                </div>
                            );
                        })() : (
                            <div className="rounded-3xl bg-slate-900/50 border border-white/5 h-80 flex flex-col items-center justify-center text-slate-500 gap-4 backdrop-blur-md shadow-inner">
                               <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                   <FileText className="w-10 h-10 opacity-30" />
                               </div>
                               <p className="font-medium text-sm">Tidak ada materi presentasi di kelas ini.</p>
                            </div>
                        )
                     ) : null}
                 </motion.div>
             </AnimatePresence>
          </div>

          {/* SIDEBAR TABS & PLAYLIST */}
          <div className="lg:col-span-1 flex flex-col h-[calc(100vh-140px)] sticky top-8">
             <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-white/5 mb-6 shrink-0 backdrop-blur-xl shadow-lg ring-1 ring-white/5">
                <button 
                   onClick={() => setActiveTab('video')}
                   className={`cursor-pointer flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'video' ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                   <PlayCircle className="w-4 h-4" /> Video ({videos.length})
                </button>
                <button 
                   onClick={() => setActiveTab('ppt')}
                   className={`cursor-pointer flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'ppt' ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                   <FileText className="w-4 h-4" /> Materi PPT ({ppts.length})
                </button>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/10 pb-10">
                <AnimatePresence>
                    {activeTab === 'video' ? (
                       videos.length > 0 ? (
                           videos.map((v, i) => (
                              <motion.button 
                                 initial={{ opacity: 0, x: 20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: i * 0.05 }}
                                 key={v.id}
                                 onClick={() => setActiveVideo(v)}
                                 className={`w-full text-left p-4 rounded-2xl transition-all flex gap-4 group cursor-pointer border ${activeVideo?.id === v.id ? 'bg-white/10 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] backdrop-blur-md' : 'bg-slate-900/40 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                              >
                                 <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner transition-colors duration-300 ${activeVideo?.id === v.id ? 'bg-cyan-500 text-slate-950 shadow-cyan-400' : 'bg-white/[0.05] text-slate-400 group-hover:bg-white/10 group-hover:text-white'}`}>
                                    {activeVideo?.id === v.id ? <PlayCircle className="w-5 h-5 fill-slate-950/20" /> : i+1}
                                 </div>
                                 <div className="min-w-0 flex-1 flex flex-col justify-center">
                                    <div className={`text-sm font-bold tracking-tight truncate transition-colors duration-300 ${activeVideo?.id === v.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                       {v.title}
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500/80 mt-1 truncate">
                                       {activeVideo?.id === v.id ? "Sedang diputar" : "Klik untuk memutar"}
                                    </div>
                                 </div>
                              </motion.button>
                           ))
                       ) : (
                           <div className="text-center py-10 text-sm font-medium text-slate-500 border border-dashed border-white/10 rounded-3xl bg-slate-900/30">Belum ada video.</div>
                       )
                    ) : (
                       ppts.length > 0 ? (
                           ppts.map((p, i) => (
                              <motion.button 
                                 initial={{ opacity: 0, x: 20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: i * 0.05 }}
                                 key={p.id}
                                 onClick={() => setActivePpt(p)}
                                 className={`w-full text-left p-4 rounded-2xl transition-all flex gap-4 group cursor-pointer border ${activePpt?.id === p.id ? 'bg-white/10 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] backdrop-blur-md' : 'bg-slate-900/40 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                              >
                                 <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-inner transition-colors duration-300 ${activePpt?.id === p.id ? 'bg-cyan-500 text-slate-950 shadow-cyan-400' : 'bg-white/[0.05] text-slate-400 group-hover:bg-white/10 group-hover:text-white'}`}>
                                    {activePpt?.id === p.id ? <FileText className="w-5 h-5 fill-slate-950/20" /> : i+1}
                                 </div>
                                 <div className="min-w-0 flex-1 flex flex-col justify-center">
                                    <div className={`text-sm font-bold tracking-tight truncate transition-colors duration-300 ${activePpt?.id === p.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                       {p.title}
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500/80 mt-1 truncate">
                                       {activePpt?.id === p.id ? "Sedang dibuka" : "Klik untuk membaca dokumen"}
                                    </div>
                                 </div>
                              </motion.button>
                           ))
                       ) : (
                           <div className="text-center py-10 text-sm font-medium text-slate-500 border border-dashed border-white/10 rounded-3xl bg-slate-900/30">Belum ada materi.</div>
                       )
                    )}
                </AnimatePresence>
             </div>
          </div>

       </div>
    </motion.div>
  );
}