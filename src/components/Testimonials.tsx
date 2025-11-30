"use client";
import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

const TestimonialCard = ({ item }: { item: any }) => (
  <div className="
    relative flex-shrink-0 
    w-[280px] md:w-[350px] 
    rounded-2xl border border-white/10 
    bg-slate-900/60 backdrop-blur-md 
    p-5 md:p-6 
    transition-colors hover:border-cyan-500/30 hover:bg-slate-800/80
  ">
    <div className="absolute top-5 right-5 md:top-6 md:right-6 text-slate-700">
      <Quote size={18} className="md:w-5 md:h-5" />
    </div>
    
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg">
        {item.name ? item.name[0] : "?"}
      </div>
      <div>
        <div className="text-white font-bold text-xs md:text-sm flex items-center gap-1">
            {item.name}
            <svg className="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.02-2.147 3.6 0 1.457.748 2.795 1.867 3.61-.5 1.45.607 3.297 2.533 3.017.91 1.13 2.558 1.418 3.687.548.88.88 2.41.88 3.29 0 1.128.87 2.775.582 3.687-.548 1.926.28 3.033-1.567 2.533-3.017 1.12-.815 1.868-2.153 1.868-3.61z"/></svg>
        </div>
        <div className="text-slate-500 text-[10px] md:text-xs">{item.role || 'Mahasiswa'}</div>
      </div>
    </div>
    
    <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
      "{item.text}"
    </p>
  </div>
);

export default function Testimonials() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
        try {
            const res = await fetch(`${API_BASE}/testimonials`, { headers: { "Content-Type": "application/json" } });
            if(res.ok) {
                const data = await res.json();
                if(Array.isArray(data) && data.length > 0) setItems(data);
            }
        } catch (e) {
            console.error("Gagal load testimoni:", e);
        }
    })();
  }, []);

  if (items.length === 0) {
    return null;
  }

  const marqueeItems = [...items, ...items, ...items];

  return (
    <section id="testimoni" className="py-20 md:py-32 bg-slate-950 overflow-hidden relative">
       <div className="text-center mb-12 relative z-10 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">TC Mudah di Mata Mereka</h2>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
             Apa kata mahasiswa yang sudah merasakan dampaknya.
          </p>
       </div>

       <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
       <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />

       <div className="relative flex w-full overflow-hidden mask-linear-gradient">
          <div 
            className="flex animate-scroll gap-4 md:gap-6 min-w-full hover:[animation-play-state:paused]"
            style={{ animationDuration: '40s' }} 
          >
            {marqueeItems.map((item, idx) => (
               <TestimonialCard key={`${item.id}-${idx}`} item={item} />
            ))}
          </div>
       </div>

       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
    </section>
  );
}