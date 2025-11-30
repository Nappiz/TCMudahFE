"use client";

import { useEffect, useMemo, useState } from "react";
import { apiMyEnrollments, fetchCatalog, API_BASE } from "../../../../lib/api";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Star, Send, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type MyFeedback = {
  id: string;
  class_id: string;
  rating?: number | null;
  message: string;
  created_at: string;
};

type ClassLite = { id: string; title: string };

type Enrollment = {
    id: string;
    class_id: string;
    active: boolean;
};

export default function FeedbackPage() {
  const [catalogClasses, setCatalogClasses] = useState<ClassLite[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  
  const [classId, setClassId] = useState<string>("");
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [mine, setMine] = useState<MyFeedback[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [enrolls, catalog] = await Promise.all([
            apiMyEnrollments(), 
            fetchCatalog()
        ]);
        
        const activeIds = enrolls.filter((e: Enrollment) => e.active).map((e: Enrollment) => e.class_id);
        setEnrolledIds(activeIds);
        
        const cls = catalog.classes.map((c) => ({ id: c.id, title: c.title }));
        setCatalogClasses(cls);
        
        const firstEligible = cls.find(c => activeIds.includes(c.id));
        if (firstEligible) {
            setClassId(firstEligible.id);
        }
      } catch (e: any) {
        console.error("Gagal memuat data:", e);
        setErr("Gagal memuat data kelas. Silakan refresh.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function loadMyFeedback() {
    try {
      const r = await fetch(`${API_BASE}/feedback/me`, { credentials: "include" });
      if (!r.ok) {
          return; 
      }
      const data = (await r.json()) as MyFeedback[];
      setMine(data);
    } catch (e: any) {
      console.warn("Gagal load history feedback:", e);
      setMine([]);
    }
  }

  useEffect(() => {
    loadMyFeedback();
  }, []);

  const eligibleClasses = useMemo(
    () => catalogClasses.filter(c => enrolledIds.includes(c.id)),
    [catalogClasses, enrolledIds]
  );

  const classNameMap = useMemo(() => {
    const m = new Map<string, string>();
    catalogClasses.forEach(c => m.set(c.id, c.title));
    return m;
  }, [catalogClasses]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);

    if (!classId) {
      setErr("Silakan pilih kelas terlebih dahulu.");
      return;
    }
    if (message.trim().length < 4) {
      setErr("Feedback terlalu pendek (min. 4 karakter).");
      return;
    }
    if (message.trim().length > 1000) {
      setErr("Feedback terlalu panjang (maks. 1000 karakter).");
      return;
    }

    try {
      setSubmitting(true);
      const r = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          rating: rating ?? null,
          message: message.trim(),
        }),
      });

      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || r.statusText);
      }

      setOk("Terima kasih! Masukan kamu sangat berarti.");
      setMessage("");
      setRating(null);
      
      await loadMyFeedback();
      
    } catch (e: any) {
      setErr(e?.message || "Gagal mengirim feedback. Coba lagi nanti.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
      return (
          <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              <p>Memuat data...</p>
          </div>
      )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
       
       <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-2 ring-1 ring-cyan-500/20">
             <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Kirim Masukan</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
             Bantu kami meningkatkan kualitas materi. Feedback kamu sangat berharga dan <strong>bersifat anonim</strong> di mata pengajar.
          </p>
       </div>

       <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500/20 to-blue-600/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition duration-500"></div>
          
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
            <form onSubmit={onSubmit} className="space-y-8">
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                            Kelas yang dinilai
                        </label>
                        <div className="relative">
                            <select
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                className="w-full h-12 pl-4 pr-10 rounded-xl bg-slate-950 border border-white/10 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all appearance-none cursor-pointer"
                            >
                                {eligibleClasses.length === 0 && <option value="">(Tidak ada kelas aktif)</option>}
                                {eligibleClasses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                            Rating Kepuasan
                        </label>
                        <div className="flex gap-2">
                            {[1,2,3,4,5].map(n => (
                                <button
                                    type="button"
                                    key={n}
                                    onClick={() => setRating(rating === n ? null : n)}
                                    className={`cursor-pointer flex-1 h-12 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                                        rating && rating >= n 
                                        ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                                        : 'bg-white/5 border-white/5 text-slate-600 hover:bg-white/10 hover:text-slate-400'
                                    }`}
                                >
                                    <Star className={`w-5 h-5 ${rating && rating >= n ? 'fill-current' : ''}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pesan kamu</label>
                        <span className={`text-[10px] ${message.length > 1000 ? 'text-red-400' : 'text-slate-600'}`}>
                            {message.length}/1000
                        </span>
                    </div>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        className="w-full rounded-xl bg-slate-950 border border-white/10 p-4 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all resize-none leading-relaxed"
                        placeholder="Ceritakan pengalamanmu... Apa materinya mudah dipahami? Mentornya asik? Atau ada kendala teknis?"
                    />
                </div>

                {err && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {err}
                    </div>
                )}
                {ok && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        {ok}
                    </div>
                )}

                <Button 
                    type="submit" 
                    size="lg" 
                    className="cursor-pointer w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl h-14 shadow-lg shadow-cyan-900/20 active:scale-[0.98] transition-transform" 
                    disabled={submitting || !classId}
                >
                    {submitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Mengirim...</>
                    ) : (
                        <><Send className="w-5 h-5 mr-2" /> Kirim Feedback</>
                    )}
                </Button>
            </form>
          </div>
       </div>

       <div className="space-y-6 pt-8 border-t border-white/5">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div> Riwayat Masukan
          </h3>
          
          {mine.length === 0 ? (
             <div className="text-center py-12 rounded-2xl border border-dashed border-white/5 bg-white/[0.02]">
                <p className="text-slate-600 text-sm">Belum ada riwayat feedback.</p>
             </div>
          ) : (
             <div className="grid gap-4">
                {mine.map(f => (
                   <div key={f.id} className="group p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-start mb-3">
                         <div>
                             <div className="text-sm font-medium text-cyan-400 mb-0.5">
                                {classNameMap.get(f.class_id) || <span className="font-mono opacity-70">{f.class_id}</span>}
                             </div>
                             <div className="text-[10px] text-slate-500 font-mono">
                                {new Date(f.created_at).toLocaleDateString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                             </div>
                         </div>
                         {f.rating && (
                            <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/10">
                               <Star className="w-3 h-3 text-yellow-400 fill-current" />
                               <span className="text-xs font-bold text-yellow-200">{f.rating}</span>
                            </div>
                         )}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-3 mt-1">
                        "{f.message}"
                      </p>
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
}