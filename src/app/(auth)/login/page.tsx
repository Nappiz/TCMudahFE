"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";

import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function apiLogin(payload: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "Gagal masuk.";
    try {
        const j = await res.json();
        if (j?.detail) msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
        if(!email || !password) throw new Error("Email dan password harus diisi");
        await apiLogin({ email, password });
        router.replace("/");
    } catch (error: any) {
        setErr(error?.message ?? "Gagal masuk. Periksa kembali email dan password Anda.");
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex relative bg-slate-950 text-white overflow-hidden z-0">
      
      <div className="absolute inset-0 pointer-events-none z-[-1]">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/20 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-700/20 blur-[180px] rounded-full" />
      </div>

      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 relative z-10 backdrop-blur-[1px] lg:backdrop-blur-none">
        <Link href="/" className="absolute top-8 left-6 sm:left-12 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
           <ArrowLeft size={16} /> Kembali
        </Link>

        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
             <div className="relative h-12 w-12 mb-6">
                 <Image src="/logo.png" alt="TC Mudah Logo" fill className="object-contain" priority />
             </div>
             <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back.</h1>
             <p className="text-slate-400">Masuk untuk melanjutkan progres belajarmu.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative group">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                 <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@student.its.ac.id"
                  required
                  className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:bg-slate-900/50 transition-all h-11 placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors z-20 pointer-events-none" size={18} />
                
                <PasswordInput
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    className="pl-10 bg-white/5 border-white/10 focus:border-cyan-500/50 focus:bg-slate-900/50 transition-all h-11 placeholder:text-slate-600"
                />
              </div>
            </div>

            {err && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                    {err}
                </div>
            )}

            <Button type="submit" size="lg" disabled={loading} className="w-full h-11 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-900/20 border border-cyan-400/20">
              {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Masuk"}
            </Button>

            <div className="text-center text-sm text-slate-500 pt-4">
              Belum punya akun?{" "}
              <Link href="/register" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
                Daftar sekarang
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex w-[55%] relative items-center justify-center z-10">
         <div className="absolute left-0 inset-y-0 w-32 bg-gradient-to-r from-slate-950/80 to-transparent pointer-events-none"></div>
         <div className="relative z-20 max-w-md text-center p-8">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}
               className="mb-8 relative group"
            >
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-left shadow-2xl">
                    <QuoteIcon className="w-8 h-8 text-cyan-500/40 mb-4" />
                    <p className="text-slate-200 text-lg leading-relaxed font-medium">
                        "Nilai Dasprog gw naik drastis sejak join TC Mudah. Materi yang diajarkan bener-bener relate sama soal ujian."
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-inner flex items-center justify-center font-bold">R</div>
                        <div>
                            <div className="text-white font-bold">Raka D.</div>
                            <div className="text-slate-500 text-sm">Mahasiswa Informatika 23</div>
                        </div>
                    </div>
                </div>
            </motion.div>
         </div>
      </div>
    </div>
  );
}

const QuoteIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
)