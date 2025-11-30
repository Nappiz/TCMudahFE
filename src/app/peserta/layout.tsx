"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Asumsi ada logo
import { usePathname } from "next/navigation";
import { apiMyEnrollments, fetchCatalog } from "../../../lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Catalog } from "@/types/catalog";
import { BookOpen, MessageSquare, Home, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PesertaLayout({ children }: { children: React.ReactNode }) {
  const authChecked = useRequireAuth();
  const [enroll, setEnroll] = useState<{ class_id: string }[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!authChecked) return;
    (async () => {
      try {
        const [e, c] = await Promise.all([apiMyEnrollments(), fetchCatalog()]);
        setEnroll(e.filter((x) => x.active));
        setCatalog(c);
      } catch (e: any) {
        console.error("Gagal memuat data layout", e);
      }
    })();
  }, [authChecked]);

  const classes = useMemo(() => {
    if (!catalog) return [];
    const idx = new Map(catalog.classes.map((c) => [c.id, c]));
    return enroll.map((e) => idx.get(e.class_id)).filter(Boolean);
  }, [catalog, enroll]);

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 selection:bg-cyan-500/30 font-sans flex">
      
      <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-[#0B0E14] h-screen sticky top-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5">
           <div className="w-8 h-8 relative">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
           </div>
           <span className="font-bold text-white tracking-tight">TC Mudah</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           
           <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu Utama</div>
              <ul className="space-y-1">
                 <li>
                    <Link href="/peserta" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive('/peserta') ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                       <Home className="w-4 h-4" /> Dashboard
                    </Link>
                 </li>
                 <li>
                    <Link href="/peserta/feedback" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive('/peserta/feedback') ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                       <MessageSquare className="w-4 h-4" /> Feedback
                    </Link>
                 </li>
              </ul>
           </div>

           <div>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
                 Kelas Saya 
                 <span className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[9px]">{classes.length}</span>
              </div>
              
              {classes.length === 0 ? (
                 <div className="px-3 py-4 text-xs text-slate-600 text-center border border-dashed border-white/5 rounded-xl">
                    Belum ada kelas aktif.
                 </div>
              ) : (
                 <ul className="space-y-1">
                    {classes.map((c: any) => {
                       const href = `/peserta/kelas/${c.id}`;
                       const active = pathname?.startsWith(href);
                       return (
                          <li key={c.id}>
                             <Link href={href} className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${active ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <div className="flex items-center gap-3 truncate">
                                   <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-600 group-hover:bg-slate-400'}`}></div>
                                   <span className="truncate">{c.title}</span>
                                </div>
                                {active && <ChevronRight className="w-3 h-3 text-white/50" />}
                             </Link>
                          </li>
                       )
                    })}
                 </ul>
              )}
           </div>
        </div>

        <div className="p-4 border-t border-white/5">
           <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
              <LogOut className="w-4 h-4" /> Kembali ke Home
           </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
         <main className="p-4 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {children}
         </main>
      </div>

    </div>
  );
}