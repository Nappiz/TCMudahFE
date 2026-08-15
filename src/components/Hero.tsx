"use client";
import Link from "next/link";
import { useState, useEffect, useRef, MouseEvent } from "react";
import { ArrowRight, Play, Terminal, Minus, Square, XCircle, Lock, CheckCircle2, FileCode } from "lucide-react";

const videoId = "Gp495cTLFKo";

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.matchMedia("(max-width: 768px)").matches);
  }, []);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (isMobile || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - left) / width - 0.5;
    const yPct = (e.clientY - top) / height - 0.5;
    
    // Limits: rotateX between -5 and 5, rotateY between -5 and 5
    const rotateX = yPct * -10; 
    const rotateY = xPct * 10;
    const brightness = 1 - (yPct * 0.2); // 0.9 to 1.1

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      filter: `brightness(${brightness})`,
    });
  }

  function onMouseLeave() {
    if (isMobile) return;
    setStyle({
      transform: `perspective(1000px) rotateX(0deg) rotateY(0deg)`,
      filter: `brightness(1)`,
      transition: "transform 0.5s ease, filter 0.5s ease"
    });
  }
  
  function onMouseEnter() {
    if (isMobile) return;
    setStyle(prev => ({ ...prev, transition: "none" }));
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      style={{ ...style, transformStyle: "preserve-3d" }}
      className="relative w-full max-w-5xl group cursor-pointer px-4 sm:px-0 transition-all duration-300 ease-out"
    >
      {children}
    </div>
  );
}

const CodeEditorVisual = () => {
  const [activeTab, setActiveTab] = useState<'problem' | 'solusi'>('problem');

  return (
    <div className="relative w-full max-w-[90vw] sm:max-w-lg perspective-1000 group mx-auto animate-zoom-in">
      <div className={`absolute -inset-1 bg-gradient-to-r rounded-xl opacity-20 group-hover:opacity-40 transition-all duration-500 blur-xl ${activeTab === 'problem' ? 'from-red-500 to-orange-500' : 'from-cyan-500 to-blue-600'}`}></div>
      <div className="relative bg-[#0d1117] rounded-xl border border-white/10 shadow-2xl overflow-hidden min-h-[280px] sm:min-h-[340px] flex flex-col transition-transform duration-300 hover:rotate-0 -rotate-1 lg:-rotate-2">
        {/* Editor header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-0 bg-[#161b22] border-b border-white/5 h-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
          </div>

          <div className="flex h-full items-end gap-1 px-2 sm:px-4">
            <button
              onClick={() => setActiveTab('problem')}
              className={`
                    cursor-pointer relative group/tab px-3 sm:px-4 h-8 text-[10px] sm:text-[11px] font-mono flex items-center gap-1.5 sm:gap-2 rounded-t-md transition-all shrink-0
                    ${activeTab === 'problem'
                  ? 'bg-[#0d1117] text-red-400 border-t-2 border-red-500'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-t-2 border-transparent'}
                `}
            >
              <FileCode size={12} />
              problem.cpp
            </button>

            <button
              onClick={() => setActiveTab('solusi')}
              className={`
                    cursor-pointer relative group/tab px-3 sm:px-4 h-8 text-[10px] sm:text-[11px] font-mono flex items-center gap-1.5 sm:gap-2 rounded-t-md transition-all shrink-0
                    ${activeTab === 'solusi'
                  ? 'bg-[#0d1117] text-cyan-400 border-t-2 border-cyan-500'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border-t-2 border-transparent'}
                `}
            >
              <FileCode size={12} />
              solusi.cpp
            </button>
          </div>

          <div className="hidden sm:flex gap-2 text-slate-500 opacity-50 shrink-0">
            <Minus size={12} /> <Square size={10} /> <XCircle size={12} />
          </div>
        </div>

        <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed relative flex-1 bg-[#0d1117]">
          <div className="absolute left-2 sm:left-4 top-4 sm:top-6 text-slate-700 select-none text-right flex flex-col gap-1 w-4 sm:w-6">
            {Array.from({ length: 10 }).map((_, i) => <span key={i}>{i + 1}</span>)}
          </div>

          <div className="ml-6 sm:ml-10 pl-2 sm:pl-4 border-l border-white/5 h-full relative">
            <div className={`transition-opacity duration-300 absolute inset-0 ${activeTab === 'problem' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
                <div className="text-slate-300 whitespace-pre-wrap break-words">
                  <p><span className="text-purple-400">int</span> main() {'{'}</p>
                  <p className="ml-2 sm:ml-4 text-slate-500">// Realita Maba IF:</p>
                  <p className="ml-2 sm:ml-4">string mood = <span className="text-red-400">"Stress"</span>;</p>
                  <p className="ml-2 sm:ml-4">while (<span className="text-orange-400">!paham</span>) {'{'}</p>
                  <p className="ml-4 sm:ml-8 text-red-400">error: segmentation fault</p>
                  <p className="ml-4 sm:ml-8 text-red-400">throw panic("Tugas");</p>
                  <p className="ml-2 sm:ml-4">{'}'}</p>
                  <p>{'}'}</p>
                  <div className="mt-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] sm:text-xs text-red-300 flex items-center gap-2">
                    <XCircle size={12} className="shrink-0" /> Build Failed: 12 errors
                  </div>
                </div>
            </div>
            
            <div className={`transition-opacity duration-300 absolute inset-0 ${activeTab === 'solusi' ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
                <div className="text-slate-300 whitespace-pre-wrap break-words">
                  <p><span className="text-purple-400">#include</span> <span className="text-green-400">"tc_mudah.h"</span></p>
                  <p>&nbsp;</p>
                  <p><span className="text-purple-400">int</span> main() {'{'}</p>
                  <p className="ml-2 sm:ml-4 text-slate-500">// Join TC Mudah:</p>
                  <p className="ml-2 sm:ml-4">Mentor asdos = <span className="text-cyan-400">new Mentor()</span>;</p>
                  <p className="ml-2 sm:ml-4">string mood = <span className="text-green-400">"Confident"</span>;</p>
                  <p className="ml-2 sm:ml-4"><span className="text-yellow-400">return</span> IPK_4_0;</p>
                  <p>{'}'}</p>
                  <div className="mt-4 p-2 bg-green-500/10 border border-green-500/20 rounded text-[10px] sm:text-xs text-green-300 flex items-center gap-2">
                    <CheckCircle2 size={12} className="shrink-0" /> Build Succeeded (0.4s)
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const YoutubeFacade = () => {
    const [showVideo, setShowVideo] = useState(false);
    
    if (showVideo) {
        return (
            <iframe
                className="w-full h-full animate-fade-in-up"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`}
                title="Preview Tutoring TC Mudah"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        );
    }
    
    return (
        <button 
            onClick={() => setShowVideo(true)}
            className="relative w-full h-full group cursor-pointer overflow-hidden flex items-center justify-center"
        >
            {/* Fallback image if thumbnail doesn't load */}
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <Play className="w-12 h-12 text-slate-700" />
            </div>
            
            <img 
                src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`} 
                alt="Video thumbnail"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Play button overlay */}
            <div className="absolute z-10 w-20 h-16 bg-red-600/90 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-600 shadow-lg backdrop-blur-sm">
                <Play className="w-8 h-8 text-white fill-white" />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent pointer-events-none" />
        </button>
    );
};

export default function Hero() {
  return (
    <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-32 overflow-hidden bg-slate-950 flex flex-col items-center">

      <div className="absolute inset-0 pointer-events-none -z-10 hidden md:block">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/10 blur-3xl rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-3xl rounded-full mix-blend-screen" />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center mb-24 lg:mb-32">
          <div className="text-left order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-6 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              TC Mudah Batch 8
            </div>

            <h1 className="text-5xl sm:text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6 animate-fade-in-up delay-100">
              Belajar Mata Kuliah <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 animate-gradient-x">
                TC jadi Mudah.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 mb-8 max-w-xl leading-relaxed animate-fade-in-up delay-200">
              TC Mudah adalah tutoring online untuk Mahasiswa Baru Teknik Informatika ITS. Materi terstruktur, mentor berpengalaman, dan dukungan komunitas membuat belajarmu fokus serta menyenangkan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:items-center animate-fade-in-up delay-300">
              <Link href="/daftar-kelas" className="w-full sm:w-auto">
                <button className="cursor-pointer w-full sm:w-auto h-14 px-8 rounded-full bg-white text-slate-950 font-bold text-lg hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] transform hover:scale-105 duration-200">
                  Daftar Sekarang <ArrowRight size={20} />
                </button>
              </Link>

              <div className="flex items-center gap-3 px-2 mt-4 sm:mt-0">
                <div className="flex -space-x-3">
                  {[
                    { bg: "bg-cyan-500", letter: "A" },
                    { bg: "bg-blue-500", letter: "R" },
                    { bg: "bg-indigo-500", letter: "B" },
                    { bg: "bg-purple-500", letter: "K" }
                  ].map((avatar, i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-950 ${avatar.bg} z-${10 - i} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                      {avatar.letter}
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium text-slate-300">
                  50+ Mahasiswa Joined
                </div>
              </div>
            </div>
          </div>

          <div className="order-2 flex justify-center lg:justify-end relative mt-4 lg:mt-0">
            <CodeEditorVisual />
            <div className="absolute -right-4 top-8 bg-slate-800/80 backdrop-blur p-2 pr-4 rounded-lg border border-white/10 shadow-xl hidden lg:flex items-center gap-2 animate-[bounce_5s_infinite]">
              <div className="p-1 bg-green-500/20 rounded"><CheckCircle2 className="text-green-400 w-4 h-4" /></div>
              <span className="text-xs font-mono text-slate-300">Pass: 100%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-8 text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 text-sm text-slate-400 mb-4 cursor-default transition-colors">
              <Play size={14} className="fill-slate-400" /> Tonton Preview Kelas
            </div>
          </div>

          <TiltCard>
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-[2rem] blur-2xl opacity-50 -z-10 transition-opacity duration-500 hidden sm:block"></div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl animate-fade-in-up delay-100">
              <div className="h-11 bg-slate-800/90 border-b border-white/5 flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-inner" /> {/* Red */}
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-inner" /> {/* Yellow */}
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-inner" /> {/* Green */}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-medium text-slate-400/80 font-mono">
                  <Lock size={10} />
                  <span className="hidden sm:inline">preview-materi-dasprog.mp4</span>
                  <span className="sm:hidden">preview.mp4</span>
                </div>
                <div className="w-10"></div>
              </div>

              <div className="aspect-video w-full bg-black relative">
                 <YoutubeFacade />
              </div>
            </div>
          </TiltCard>
        </div>

      </div>
    </section>
  );
}