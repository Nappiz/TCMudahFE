"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Database, Calculator, Code, Braces, Layers } from "lucide-react";

type Item = {
  id: string;
  code: string;
  name: string;
  sem: 1 | 2;
  blurb: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

const getIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("pemrograman")) return <Terminal className="w-6 h-6 text-cyan-400" />;
  if (n.includes("data")) return <Database className="w-6 h-6 text-purple-400" />;
  if (n.includes("matematika") || n.includes("kalkulus")) return <Calculator className="w-6 h-6 text-orange-400" />;
  if (n.includes("sistem")) return <Layers className="w-6 h-6 text-blue-400" />;
  if (n.includes("algoritma")) return <Braces className="w-6 h-6 text-emerald-400" />;
  return <Code className="w-6 h-6 text-slate-400" />;
};

export default function ProgramGrid() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/curriculum`, { headers: { "Content-Type": "application/json" } });
        if (res.ok) {
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        }
      } catch (e) {
         console.error("Gagal load kurikulum", e);
      } finally {
         setLoading(false);
      }
    })();
  }, []);

  return (
    <section id="program" className="py-24 bg-slate-950 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:flex md:items-end md:justify-between">
           <div className="max-w-2xl">
             <h2 className="text-4xl font-bold text-white mb-4">Kurikulum Semester 1 & 2</h2>
             <p className="text-slate-400 text-lg">Materi yang kami bahas 100% sinkron dengan silabus.</p>
           </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {loading && Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="h-[280px] rounded-2xl bg-slate-900 border border-white/5 p-6 animate-pulse">
                <div className="flex justify-between mb-6">
                    <div className="h-12 w-12 rounded-xl bg-slate-800" />
                    <div className="h-6 w-20 rounded-full bg-slate-800" />
                </div>
                <div className="h-4 w-16 bg-slate-800 mb-3 rounded" />
                <div className="h-6 w-3/4 bg-slate-800 mb-4 rounded" />
                <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-800 rounded" />
                    <div className="h-3 w-5/6 bg-slate-800 rounded" />
                </div>
             </div>
          ))}

          {!loading && items.length === 0 && (
             <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                <Code className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white font-medium">Belum ada kurikulum</h3>
                <p className="text-slate-500 text-sm mt-1">Silakan cek kembali nanti atau hubungi admin.</p>
             </div>
          )}

          {!loading && items.map((x, i) => (
             <motion.div
               key={x.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.05 }}
               className="group relative h-full rounded-2xl bg-slate-900 border border-white/5 p-6 hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
             >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-6">
                        <div className="p-3 rounded-xl bg-slate-800 border border-white/5 group-hover:scale-110 transition-transform duration-300">
                           {getIcon(x.name)}
                        </div>
                        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${x.sem === 1 ? 'border-cyan-500/30 bg-cyan-950/30 text-cyan-400' : 'border-purple-500/30 bg-purple-950/30 text-purple-400'}`}>
                           SEMESTER {x.sem}
                        </span>
                    </div>

                    <div className="mb-2 font-mono text-xs text-slate-500">{x.code}</div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">{x.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">{x.blurb}</p>

                    <div className="mt-auto pt-4 border-t border-white/5 flex flex-wrap gap-2">
                       {['Modul', 'Video', 'Latihan'].map(tag => (
                         <span key={tag} className="text-[10px] px-2 py-1 rounded bg-white/5 text-slate-400 border border-white/5">
                           {tag}
                         </span>
                       ))}
                    </div>
                </div>
             </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}