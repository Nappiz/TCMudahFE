"use client";
import { motion } from "framer-motion";
import { Cpu, BookOpen, Video, Users, ArrowUpRight } from "lucide-react";

const features = [
  {
    title: "Mentor Praktisi & Asdos",
    desc: "Belajar dari mereka yang sudah menaklukan matkul ini dengan nilai A. Bukan teori doang, tapi trik bertahan hidup.",
    icon: <Cpu className="w-6 h-6" />,
    color: "from-cyan-500 to-blue-500",
    colSpan: "md:col-span-2",
  },
  {
    title: "Modul Anti-Basi",
    desc: "Silabus sinkron real-time dengan jadwal kuliah ITS. Dosen bahas A, kita bahas A+.",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-violet-500 to-purple-500",
    colSpan: "md:col-span-1",
  },
  {
    title: "Rekaman 4K & Notes",
    desc: "Akses seumur hidup. Review materi sambil rebahan sebelum kuis.",
    icon: <Video className="w-6 h-6" />,
    color: "from-emerald-400 to-cyan-500",
    colSpan: "md:col-span-1",
  },
  {
    title: "Circle High Value",
    desc: "Masuk ke circle mahasiswa ambis tapi santai. Koneksi buat tubes, lomba, sampai proyekan.",
    icon: <Users className="w-6 h-6" />,
    color: "from-orange-400 to-pink-500",
    colSpan: "md:col-span-2",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 relative bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Cheat Code untuk <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                Survive di TC.
              </span>
            </h2>
            <p className="text-lg text-slate-400">
              Kami mendesain ekosistem belajar yang meminimalisir stress dan memaksimalkan pemahaman konsep.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="h-px w-32 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`group relative overflow-hidden rounded-[2rem] bg-slate-900 border border-white/5 p-8 hover:border-white/10 transition-colors ${f.colSpan}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />              
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${f.color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-white group-hover:scale-110 transition-transform duration-300">
                      {f.icon}
                    </div>
                    <ArrowUpRight className="text-slate-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all">
                    {f.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {f.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}