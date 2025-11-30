"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award, Star } from "lucide-react";

type Mentor = {
  id: string;
  name: string;
  angkatan: number;
  achievements: string[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
}

export default function Mentors() {
  const [data, setData] = useState<Mentor[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/mentors`, { credentials: "include" });
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch { setData([]); }
    })();
  }, []);

  return (
    <section id="mentor" className="py-32 bg-slate-950 relative">
      <div className="absolute left-0 top-1/4 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Mentor & Asisten Dosen</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Belajar langsung dari mereka yang sudah menaklukan soal-soal tersulit di TC.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {!data && [1,2,3,4].map(i => <div key={i} className="h-[400px] rounded-2xl bg-slate-900 animate-pulse border border-white/5" />)}
          {data && data.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">Data mentor belum tersedia.</div>}

          {data?.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative h-[420px] rounded-3xl overflow-hidden bg-slate-900 border border-white/10 hover:border-cyan-500/50 transition-colors duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-950" />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
              
              <div className="absolute top-0 left-0 w-full h-2/3 flex items-center justify-center bg-gradient-to-b from-slate-800/50 to-slate-950/0 group-hover:scale-105 transition-transform duration-700">
                 <span className="text-9xl font-bold text-slate-800 select-none group-hover:text-slate-700 transition-colors">
                    {getInitials(m.name)}
                 </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-20">
                <div className="mb-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                  <GraduationCap className="w-3 h-3" />
                  Angkatan 20{m.angkatan}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  {m.name}
                </h3>
                
                <div className="space-y-2">
                  {m.achievements.slice(0, 3).map((ach, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                      <Star className="w-3 h-3 text-yellow-500/70 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{ach}</span>
                    </div>
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