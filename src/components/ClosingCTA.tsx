"use client";
import Link from "next/link";
import { Button } from "./ui/Button"; 
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function ClosingCTA() {
  return (
    <section className="relative py-32 overflow-hidden bg-slate-950 flex flex-col items-center justify-center">
      
      <div className="z-10 absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)] blur-3xl" />
      <div className="z-10 absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none" />
      
      <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-[linear-gradient(to_bottom,transparent,rgba(2,6,23,1)_90%),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none transform perspective-[500px] rotate-x-60 origin-bottom" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-sm font-medium mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4" />
          <span>Batch Terbatas untuk Semester Ini</span>
        </motion.div>

        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-tight">
          Siap Amankan <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
            IPK Semester ini?
          </span>
        </h2>
        
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Jangan tunggu sampai nilai keluar baru panik. Gabung TC Mudah sekarang dan bangun pondasi coding yang kuat bareng mentor terbaik.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Link href="/daftar-kelas" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer group relative w-full sm:w-auto px-8 py-4 bg-white text-slate-950 rounded-full font-bold text-lg overflow-hidden shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Daftar Kelas Sekarang
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </Link>

          <a href="https://wa.me/6281519291757" target="_blank" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Konsultasi Gratis
            </motion.button>
          </a>
        </div>
        
        <p className="mt-8 text-sm text-slate-500">
          Garansi materi 100% relevan dengan kurikulum.
        </p>
      </div>
    </section>
  );
}