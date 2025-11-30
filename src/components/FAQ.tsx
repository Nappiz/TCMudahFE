"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, MessageCircle } from "lucide-react";

const faqs = [
  { q: "Apa bedanya TC Mudah sama belajar sendiri?", a: "Struktur. Belajar sendiri sering loncat-loncat dan bikin bingung. Di sini, materi urut sesuai kurikulum ITS, plus ada mentor yang bisa ditanya kapan aja saat stuck." },
  { q: "Apakah materinya update?", a: "100%. Kami punya tim riset yang sinkron dengan silabus terbaru Teknik Informatika ITS setiap semesternya." },
  { q: "Gimana kalau saya skip kelas?", a: "Tenang, rekaman HD dan catatan PDF tersedia H+1 setelah kelas. Kamu bisa akses selamanya via dashboard." },
  { q: "Bisa konsultasi tugas kuliah?", a: "Boleh banget untuk diskusi konsep dan arah pengerjaan. Tapi kami tidak melayani joki atau pengerjaan penuh ya, biar kamu tetap pinter!" },
  { q: "Platform apa yang digunakan?", a: "Live class via Zoom/Gmeet, diskusi via Discord/WhatsApp, dan akses materi via Dashboard Web TC Mudah." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 bg-slate-950 relative overflow-hidden">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
          
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
            <span className="text-cyan-500 font-bold tracking-wider text-sm uppercase mb-4 block">FAQ</span>
            <h2 className="text-4xl font-bold text-white mb-6">
              Masih ada <br/> pertanyaan?
            </h2>
            <p className="text-slate-400 mb-8 text-lg leading-relaxed">
              Kami rangkum pertanyaan yang paling sering ditanyakan maba. Kalau belum terjawab, chat aja langsung.
            </p>
            <a 
              href="https://wa.me/6281519291757" 
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 font-bold hover:bg-cyan-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat WhatsApp
            </a>
          </div>

          <div className="lg:col-span-8">
            <div className="space-y-4">
              {faqs.map((item, idx) => {
                const isOpen = open === idx;
                return (
                  <motion.div 
                    key={idx}
                    initial={false}
                    className={`border rounded-2xl transition-all duration-300 ${isOpen ? "border-cyan-500/50 bg-slate-900/80" : "border-white/10 bg-slate-900/30 hover:border-white/20"}`}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : idx)}
                      className="cursor-pointer w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className={`text-lg font-medium transition-colors ${isOpen ? "text-white" : "text-slate-300"}`}>
                        {item.q}
                      </span>
                      <span className={`p-1 rounded-full border transition-all ${isOpen ? "border-cyan-500 bg-cyan-500/20 text-cyan-400" : "border-white/10 text-slate-500"}`}>
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}