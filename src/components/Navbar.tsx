"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./ui/Button"; 
import { motion, AnimatePresence } from "framer-motion";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type User = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
};

const links = [
  { href: "#program", label: "Kurikulum" },
  { href: "#features", label: "Fitur" }, 
  { href: "#mentor", label: "Mentor" },
  { href: "#testimoni", label: "Testimoni" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(res.statusText);
  return (await res.json()) as T;
}

type HasAccessResp = { has_access: boolean };

async function getHasAccess(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/me/has-access`, { credentials: "include" });
    if (!r.ok) return false;
    const j = (await r.json()) as HasAccessResp;
    return !!j?.has_access;
  } catch {
    return false;
  }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await api<User>("/me");
        if (!cancelled) setUser(u);
        const allowed = await getHasAccess();
        if (!cancelled) setHasAccess(allowed);
      } catch {
        if (!cancelled) { setUser(null); setHasAccess(false); }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const isStaff = !!user && user.role !== "peserta";
  const isPesertaApproved = !!user && user.role === "peserta" && hasAccess;

  async function onLogout() {
    try {
      setLoggingOut(true);
      await api<{ ok: boolean }>("/auth/logout", { method: "POST" });
      setUser(null);
      setHasAccess(false);
      window.location.href = "/";
    } catch (e) {
      console.error(e);
      setLoggingOut(false);
    }
  }

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`
          pointer-events-auto
          relative flex items-center justify-between p-2 rounded-full transition-all duration-300
          ${scrolled 
            ? "w-full max-w-4xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50" 
            : "w-full max-w-7xl bg-transparent border border-transparent"}
        `}
      >
        <Link href="/" className="flex items-center gap-3 pl-4 group">
          <div className="relative h-8 w-8 transition-transform group-hover:scale-110">
             <Image src="/logo.png" alt="TC Mudah" fill className="object-contain" priority />
          </div>
          <span className="font-bold text-white tracking-tight hidden sm:block">TC Mudah</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/5 mx-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/daftar-kelas" className="px-4 py-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all">
            Daftar Kelas
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2 pr-1">
           {checking ? (
             <div className="h-9 w-20 bg-white/10 animate-pulse rounded-full" />
           ) : !user ? (
             <>
                <Link href="/login">
                  <button className="cursor-pointer px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Masuk</button>
                </Link>
                <Link href="/register">
                  <button className="cursor-pointer px-5 py-2 text-sm font-medium bg-white text-slate-950 rounded-full hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">
                    Daftar
                  </button>
                </Link>
             </>
           ) : (
             <div className="flex items-center gap-2">
                {isStaff && <Link href="/cms"><button className="cursor-pointer px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 rounded-full">CMS</button></Link>}
                {isPesertaApproved && <Link href="/peserta"><button className="cursor-pointer px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 rounded-full">Dashboard</button></Link>}
                <button 
                  onClick={onLogout} 
                  disabled={loggingOut}
                  className="cursor-pointer px-5 py-2 text-sm font-medium bg-slate-800 text-white border border-white/10 rounded-full hover:bg-slate-700 transition-colors"
                >
                  {loggingOut ? "..." : "Keluar"}
                </button>
             </div>
           )}
        </div>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full hover:bg-white/10 text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="pointer-events-auto absolute top-20 inset-x-4 p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl z-40 flex flex-col gap-2"
          >
             {links.map(l => (
               <Link key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} className="p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl">
                 {l.label}
               </Link>
             ))}
             <div className="h-px bg-white/10 my-2" />
             {!user ? (
               <div className="grid grid-cols-2 gap-2">
                 <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="p-3 text-center text-slate-300 border border-white/10 rounded-xl">Masuk</Link>
                 <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="p-3 text-center bg-white text-slate-950 rounded-xl font-semibold">Daftar</Link>
               </div>
             ) : (
                <button onClick={onLogout} className="p-3 text-center bg-red-500/10 text-red-400 rounded-xl">Logout</button>
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
