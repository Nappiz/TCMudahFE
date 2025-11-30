"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { fetchCatalog } from "../../../lib/api";
import CartButton from "./CartButton";
import ClassCard from "./ClassCard";
import CartDrawer from "./CartDrawer";
import { useLocalCart } from "@/hooks/useLocalCart";
import { Catalog, Curriculum, Mentor, ClassItem } from "@/types/catalog";

const FlyingParticle = ({ startX, startY }: { startX: number; startY: number }) => {
  const targetX = typeof window !== 'undefined' ? window.innerWidth - 80 : 0; 
  const targetY = 80; 

  return (
    <motion.div
      initial={{ x: startX, y: startY, scale: 1, opacity: 1 }}
      animate={{ 
        x: targetX, 
        y: targetY, 
        scale: 0.5, 
        opacity: 0 
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.22, 1, 0.36, 1]
      }}
      className="fixed z-[9999] pointer-events-none"
    >
      <div className="h-6 w-6 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
    </motion.div>
  );
};

export default function DaftarKelasPage() {
  const authChecked = useRequireAuth();

  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const [flyingItems, setFlyingItems] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleAddToCartAnim = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const animId = Date.now();
    setFlyingItems((prev) => [...prev, { id: animId, x: startX, y: startY }]);

    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== animId));
    }, 1000);
  };

  useEffect(() => {
    if (!authChecked) return;
    let cancel = false;
    (async () => {
      try {
        const data = await fetchCatalog();
        if (!cancel) setCatalog(data);
      } catch (e: any) {
        if (!cancel) setErr(e?.message ?? "Gagal memuat katalog");
      }
    })();
    return () => {
      cancel = true;
    };
  }, [authChecked]);

  const { lines, totalCount, inc, dec, clear } = useLocalCart(catalog?.classes ?? null);

  const idxMentor = useMemo(() => {
    const m = new Map<string, Mentor>();
    catalog?.mentors.forEach((x) => m.set(x.id, x));
    return m;
  }, [catalog]);

  const idxCur = useMemo(() => {
    const m = new Map<string, Curriculum>();
    catalog?.curriculum.forEach((x) => m.set(x.id, x));
    return m;
  }, [catalog]);

  const filtered = useMemo(() => {
    if (!catalog) return [];
    const s = q.trim().toLowerCase();
    if (!s) return catalog.classes;
    return catalog.classes.filter((c: ClassItem) => {
      const mentorsTxt = (c.mentor_ids || [])
        .map((id) => idxMentor.get(id)?.name?.toLowerCase() ?? "")
        .join(" ");
      const curs = c.curriculum_ids
        .map((id) => {
          const cur = idxCur.get(id);
          return (cur?.name || cur?.code || "").toLowerCase();
        })
        .join(" ");
      return (
        c.title.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s) ||
        mentorsTxt.includes(s) ||
        curs.includes(s)
      );
    });
  }, [catalog, q, idxMentor, idxCur]);

  const total = useMemo(() => {
    if (!catalog) return 0;
    const priceById = new Map(catalog.classes.map((k) => [k.id, k.price]));
    return lines.reduce((s, l) => s + (priceById.get(l.id) || 0) * l.qty, 0);
  }, [catalog, lines]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
         <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
      
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/20 blur-[120px] rounded-full" />
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      {flyingItems.map((item) => (
        <FlyingParticle key={item.id} startX={item.x} startY={item.y} />
      ))}

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-6 py-12 md:py-24">
        
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-cyan-400 mb-4">
                <Sparkles className="w-3 h-3" /> Semester Baru
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Katalog Kelas</h1>
            <p className="text-slate-400 max-w-lg">Pilih materi yang kamu butuhkan. Tuntaskan satu per satu, raih IPK maksimal.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72 group">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kelas, mentor..."
                className="w-full rounded-xl border border-white/10 bg-slate-900/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:bg-slate-900 transition-all shadow-sm"
              />
            </div>
            <div className="shrink-0 relative z-20">
               <CartButton count={totalCount} />
            </div>
          </div>
        </div>

        {!catalog ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {[1,2,3].map(i => (
                 <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
             ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
             <p className="text-slate-500">Tidak ada kelas yang ditemukan.</p>
             <button onClick={() => setQ("")} className="cursor-pointer mt-2 text-cyan-400 hover:underline text-sm">Reset Pencarian</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((k) => {
              const mentorObjs = (k.mentor_ids || []).map((id) => idxMentor.get(id)).filter(Boolean) as Mentor[];
              
              const combinedMentor: Mentor | undefined = mentorObjs.length
                ? {
                    id: mentorObjs.map((m) => m.id).join(","),
                    name: mentorObjs.map((m) => m.name).join(" & "),
                    angkatan: mentorObjs[0]?.angkatan ?? 0,
                    visible: true,
                  }
                : undefined;

              return (
                <ClassCard
                  key={k.id}
                  item={k as any}
                  mentor={combinedMentor}
                  idxCur={idxCur}
                  qty={lines.find((l) => l.id === k.id)?.qty ?? 0}
                  onInc={inc}
                  onDec={dec}
                  onAddToCartAnim={handleAddToCartAnim}
                />
              );
            })}
          </div>
        )}

        <CartDrawer
          openButtonSelector="#cart-floating"
          lines={lines}
          classes={catalog?.classes ?? []}
          onInc={inc}
          onDec={dec}
          onClear={clear}
          total={total}
        />
      </div>
    </main>
  );
}