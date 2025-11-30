"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, ArrowRight, Loader2 } from "lucide-react";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type Me = { id: string; email: string; full_name: string; role: Role };
type Enrollment = { id: string; user_id: string; class_id: string; active: boolean };
type ClassItem = { id: string; title: string; description: string; visible: boolean };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!r.ok) throw new Error(await r.text() || r.statusText);
  return (await r.json()) as T;
}

export default function PesertaIndex() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [myClasses, setMyClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const m = await api<Me>("/me");
        if (cancelled) return;
        setMe(m);

        if (m.role === "peserta") {
           const check = await fetch(`${API_BASE}/me/has-access`, { credentials: "include" });
           const { has_access } = await check.json();
           
           if(!has_access) {
              router.replace("/");
              return;
           }

           const enrolls = await api<Enrollment[]>("/enrollments/me");
           const activeIds = enrolls.filter(e => e.active).map(e => e.class_id);
           
           if(activeIds.length > 0) {
               const allCols = await fetch(`${API_BASE}/classes`); 
               const allData = await allCols.json();
               const myData = allData.filter((c: ClassItem) => activeIds.includes(c.id));
               setMyClasses(myData);
           }
        } else {
           const cls = await api<ClassItem[]>("/admin/classes");
           setMyClasses(cls || []);
        }

      } catch (e) {
         console.error(e);
      } finally {
         if(!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
         <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-white/5 p-8">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-4">
                <Sparkles className="w-3 h-3" /> Dashboard Belajar
             </div>
             <h1 className="text-3xl font-bold text-white mb-2">Halo, {me?.full_name?.split(" ")[0]}! 👋</h1>
             <p className="text-slate-400 max-w-xl">
                Siap melanjutkan progres belajarmu hari ini? Pilih kelas di bawah ini untuk mulai belajar.
             </p>
          </div>
       </div>

       <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
             <BookOpen className="w-5 h-5 text-slate-500" /> Kelas Kamu
          </h2>
          
          {myClasses.length === 0 ? (
             <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                <p className="text-slate-500 mb-4">Kamu belum memiliki kelas aktif.</p>
                <Link href="/daftar-kelas">
                   <button className="cursor-pointer px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-200 transition-colors">
                      Cari Kelas Sekarang
                   </button>
                </Link>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {myClasses.map((c, i) => (
                   <Link href={`/peserta/kelas/${c.id}`} key={c.id}>
                      <motion.div 
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: i * 0.1 }}
                         className="group relative h-full flex flex-col justify-between p-6 rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-500/30 hover:bg-slate-800/80 transition-all duration-300"
                      >
                         <div>
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4 text-cyan-400 border border-white/5">
                               <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">{c.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-2">{c.description}</p>
                         </div>
                         
                         <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-mono">ID: {c.id.slice(0,4)}</span>
                            <span className="flex items-center gap-1 text-xs font-bold text-white group-hover:gap-2 transition-all">
                               Buka Kelas <ArrowRight className="w-3 h-3" />
                            </span>
                         </div>
                      </motion.div>
                   </Link>
                ))}
             </div>
          )}
       </div>
    </div>
  );
}