"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, User, Hash, Mail, Lock, Sparkles, CheckCircle } from "lucide-react";

import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { apiRegister } from "../../../../lib/api"; 

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const full_name = String(form.get("fullName") ?? "");
    const nim = String(form.get("nim") ?? "") || undefined;
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");

    if (password.length < 6) { setLoading(false); setErr("Password minimal 6 karakter."); return; }
    if (password !== confirm) { setLoading(false); setErr("Konfirmasi password tidak sama."); return; }

    try {
        await apiRegister({ full_name, nim, email, password });
        router.push("/login");
    } catch (e: any) {
        setErr(e.message || "Gagal mendaftar");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex relative bg-slate-950 text-white overflow-hidden z-0">      
      <div className="absolute inset-0 pointer-events-none z-[-1]">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
          <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-cyan-600/20 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-blue-700/20 blur-[180px] rounded-full" />
      </div>

      <div className="w-full lg:w-[50%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 relative z-10 py-12 lg:py-0 backdrop-blur-[1px] lg:backdrop-blur-none">
        <Link href="/" className="absolute top-8 left-6 sm:left-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
           <ArrowLeft size={16} /> Kembali
        </Link>

        <div className="max-w-md w-full mx-auto mt-10 lg:mt-0">
          <div className="mb-8">
             <div className="relative h-10 w-10 mb-4">
                 <Image src="/logo.png" alt="TC Mudah Logo" fill className="object-contain" priority />
             </div>
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-4 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
                <Sparkles size={12} /> Edisi Mahasiswa Baru
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Buat Akun Baru.</h1>
             <p className="text-slate-400">Investasi terbaik untuk semester awalmu.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="fullName">Nama Lengkap</Label>
                 <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <Input id="fullName" name="fullName" placeholder="Nama kamu" required className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:bg-slate-900/50 transition-all h-11 placeholder:text-slate-600" />
                 </div>
               </div>
               <div className="space-y-2">
                 <Label htmlFor="nim">NRP (Opsional)</Label>
                 <div className="relative group">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <Input id="nim" name="nim" placeholder="5025..." className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:bg-slate-900/50 transition-all h-11 placeholder:text-slate-600" />
                 </div>
               </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative group">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                 <Input id="email" name="email" type="email" placeholder="nama@gmail.com" required className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:bg-slate-900/50 transition-all h-11 placeholder:text-slate-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-20 pointer-events-none" size={18} />
                    <PasswordInput id="password" name="password" placeholder="Min. 6 karakter" required className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:bg-slate-900/50 transition-all h-11 placeholder:text-slate-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-20 pointer-events-none" size={18} />
                    <PasswordInput id="confirmPassword" name="confirmPassword" placeholder="Ulangi password" required className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:bg-slate-900/50 transition-all h-11 placeholder:text-slate-600" />
                  </div>
                </div>
            </div>

            {err && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                    {err}
                </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full h-12 mt-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-900/20 border border-cyan-400/20">
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Daftar Sekarang"}
            </Button>

            <div className="text-center text-sm text-slate-500 pt-2">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
                Masuk Sini
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex w-[50%] relative items-center justify-center z-10 pl-12">
         <div className="absolute left-0 inset-y-0 w-40 bg-gradient-to-r from-slate-950/80 to-transparent pointer-events-none"></div>

         <div className="relative z-20 max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-3xl font-bold text-white mb-8 leading-tight">
                    Lebih dari sekedar <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Tempat Belajar.</span>
                </h2>
            </motion.div>
            
            <div className="space-y-5">
                {[
                    { title: "Materi Terstruktur", desc: "Silabus sinkron dengan kurikulum ITS terbaru." },
                    { title: "Mentor Berpengalaman", desc: "Diskusi langsung dengan Asdos & Kating peraih nilai A." },
                    { title: "Komunitas Solid", desc: "Networking dengan teman seangkatan yang ambis." }
                ].map((item, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (idx * 0.1) }}
                        className="flex items-start gap-4 p-5 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md hover:bg-slate-900/60 hover:border-cyan-500/20 transition-all group"
                    >
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-[inset_0_0_10px_rgba(6,182,212,0.2)] border border-cyan-500/10">
                            <CheckCircle size={24} className="group-hover:text-cyan-300 transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-200 transition-colors">{item.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
         </div>
      </div>

    </div>
  );
}