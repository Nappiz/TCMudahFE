"use client";

import { useMemo, useState } from "react";
import type { ClassMaterial } from "@/types/catalog";
import { useClassMaterials } from "@/hooks/useClassMaterials";
import { VideoSection } from "./VideoSection";
import { PptSection } from "./PptSection";
import { Loader2, PlayCircle, FileText, ChevronRight, AlertCircle } from "lucide-react";

type Props = {
  classId: string;
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

export default function KelasDetailPage({ classId }: Props) {
  const { materials, catalog, loading, error } = useClassMaterials(classId);
  const [activeTab, setActiveTab] = useState<Tab>("video");
  const [activeVideo, setActiveVideo] = useState<ClassMaterial | null>(null);

  const cls = useMemo(() => catalog?.classes.find((c) => c.id === classId), [catalog, classId]);
  const videos = useMemo(() => materials.filter((m) => m.type === "video"), [materials]);
  const ppts = useMemo(() => materials.filter((m) => m.type === "ppt"), [materials]);

  useMemo(() => {
     if (videos.length > 0 && !activeVideo) setActiveVideo(videos[0]);
  }, [videos, activeVideo]);

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500" /></div>;
  
  if (error) return (
    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-200 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" /> 
        <span>Gagal memuat materi: {error}</span>
    </div>
  );

  return (
    <div className="space-y-6">
       
       <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
             <span>Dashboard</span> <ChevronRight className="w-3 h-3" /> <span>{cls?.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{cls?.title}</h1>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-2 space-y-6">
             {activeTab === 'video' ? (
                activeVideo ? (
                    <div className="rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl aspect-video relative group">
                        <iframe
                            src={getEmbedUrl(activeVideo.url)} 
                            className="w-full h-full"
                            allowFullScreen
                            allow="autoplay; encrypted-media; picture-in-picture"
                            referrerPolicy="no-referrer"
                        />
                        
                        <div className="absolute top-0 right-0 w-16 h-16 z-20 cursor-default bg-transparent" />
                        
                    </div>
                ) : (
                    <div className="rounded-2xl bg-slate-900 border border-white/10 h-64 flex flex-col items-center justify-center text-slate-500 gap-3">
                       <PlayCircle className="w-10 h-10 opacity-50" />
                       <p>Tidak ada video di kelas ini.</p>
                    </div>
                )
             ) : activeTab === 'ppt' ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                   <FileText className="w-16 h-16 text-slate-700 mb-4" />
                   <h3 className="text-lg font-medium text-white mb-2">Materi Presentasi</h3>
                   <p className="text-slate-400 max-w-sm">
                      Silakan pilih dan unduh materi (PPT/PDF) melalui daftar di sebelah kanan.
                   </p>
                </div>
             ) : null}

             {activeTab === 'video' && activeVideo && (
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                   <h3 className="text-lg font-semibold text-white mb-1">{activeVideo.title}</h3>
                   <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                      <span className="bg-white/5 px-2 py-1 rounded">Video Recording</span>
                      <span>•</span>
                      <span>Dipublikasikan pada {new Date(activeVideo.created_at || Date.now()).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                   </div>
                </div>
             )}
          </div>

          <div className="lg:col-span-1 flex flex-col h-[calc(100vh-100px)] sticky top-6">
             <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 mb-4 shrink-0">
                <button 
                   onClick={() => setActiveTab('video')}
                   className={`cursor-pointer flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'video' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                >
                   <PlayCircle className="w-3.5 h-3.5" /> Video ({videos.length})
                </button>
                <button 
                   onClick={() => setActiveTab('ppt')}
                   className={`cursor-pointer flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'ppt' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}
                >
                   <FileText className="w-3.5 h-3.5" /> File Materi ({ppts.length})
                </button>
             </div>

             <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/10 pb-10">
                {activeTab === 'video' ? (
                   videos.length > 0 ? (
                       videos.map((v, i) => (
                          <button 
                             key={v.id}
                             onClick={() => setActiveVideo(v)}
                             className={`cursor-pointer w-full text-left p-3 rounded-xl border transition-all flex gap-3 group ${activeVideo?.id === v.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'}`}
                          >
                             <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${activeVideo?.id === v.id ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-500 group-hover:text-white'}`}>
                                {i+1}
                             </div>
                             <div className="min-w-0">
                                <div className={`text-sm font-medium truncate ${activeVideo?.id === v.id ? 'text-cyan-400' : 'text-slate-300 group-hover:text-white'}`}>
                                   {v.title}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                                   Klik untuk memutar
                                </div>
                             </div>
                          </button>
                       ))
                   ) : (
                       <div className="text-center py-10 text-xs text-slate-500">Belum ada video.</div>
                   )
                ) : (
                   <PptSection ppts={ppts} onOpenFullscreen={() => {}} /> 
                )}
             </div>
          </div>

       </div>
    </div>
  );
}