"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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

const API_BASE = "/api";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
  if (!res.ok) throw new Error(res.statusText);
  return (await res.json()) as T;
}

type HasAccessResp = { has_access: boolean };

async function getHasAccess(): Promise<boolean> {
  try {
    const r = await fetch(`${API_BASE}/me/has-access`, {
      credentials: "include",
    });
    if (!r.ok) return false;
    const j = (await r.json()) as HasAccessResp;
    return !!j?.has_access;
  } catch {
    return false;
  }
}

async function getDisableDaftarKelas(): Promise<{
  disabled: boolean;
  message: string;
}> {
  try {
    const params = new URLSearchParams();
    params.append("keys", "disable_daftar_kelas");
    params.append("keys", "disabled_daftar_kelas_msg");
    const response = await fetch(`${API_BASE}/settings?${params.toString()}`);
    if (!response.ok) throw new Error("Gagal memuat settings");
    const settings = (await response.json()) as Record<string, string>;

    return {
      disabled: settings.disable_daftar_kelas === "true",
      message:
        settings.disabled_daftar_kelas_msg ||
        "Pendaftaran kelas ditutup sementara.",
    };
  } catch {
    return { disabled: false, message: "" };
  }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [disableDaftarKelas, setDisableDaftarKelas] = useState({
    disabled: false,
    message: "",
  });

  useEffect(() => {
    getDisableDaftarKelas().then(setDisableDaftarKelas);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
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
        if (!cancelled) {
          setUser(null);
          setHasAccess(false);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isStaff = !!user && user.role !== "peserta";
  const isPesertaApproved = !!user && user.role === "peserta" && hasAccess;
  const canAccessDashboard = isPesertaApproved || isStaff;

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
      <nav
        className={`
          pointer-events-auto
          relative flex items-center justify-between p-2 rounded-full transition-all duration-300 animate-fade-in-up
          ${
            scrolled
              ? "w-full max-w-4xl bg-slate-900/95 md:bg-slate-900/80 md:backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50"
              : "w-full max-w-7xl bg-transparent border border-transparent"
          }
        `}
      >
        <Link href="/" className="flex items-center gap-3 pl-4 group">
          <div className="relative h-8 w-8 transition-transform group-hover:scale-110">
            <Image
              src="/logo.png"
              alt="TC Mudah"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-white tracking-tight hidden sm:block">
            TC Mudah
          </span>
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
          {disableDaftarKelas.disabled &&
          (!user || (user.role !== "admin" && user.role !== "superadmin")) ? (
            <div className="group relative px-4 py-1.5 text-sm font-medium text-slate-500 bg-white/5 rounded-full cursor-not-allowed flex items-center gap-1.5 transition-all">
              <svg
                aria-hidden="true"
                className="w-3.5 h-3.5 opacity-60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Daftar Kelas
              {/* Premium Tooltip */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-max max-w-[250px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none z-50">
                <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-white/10 text-center leading-relaxed">
                  {disableDaftarKelas.message}
                </div>
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45 border-l border-t border-white/10"></div>
              </div>
            </div>
          ) : (
            <Link
              href="/daftar-kelas"
              className="px-4 py-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-full transition-all"
            >
              Daftar Kelas
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 pr-1">
          {checking ? (
            <div className="h-9 w-20 bg-white/10 animate-pulse rounded-full" />
          ) : !user ? (
            <>
              <Link
                href="/login"
                className="cursor-pointer px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="cursor-pointer px-5 py-2 text-sm font-medium bg-white text-slate-950 rounded-full hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
              >
                Daftar
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {isStaff && (
                <Link
                  href="/cms"
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 rounded-full"
                >
                  CMS
                </Link>
              )}
              {canAccessDashboard && (
                <Link
                  href="/peserta"
                  className="cursor-pointer px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 rounded-full"
                >
                  Dashboard
                </Link>
              )}
              <button
                type="button"
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
          type="button"
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full hover:bg-white/10 text-white"
        >
          <svg
            aria-hidden="true"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`pointer-events-auto absolute top-20 inset-x-4 p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl z-40 flex flex-col gap-2 transition-all duration-300 origin-top
        ${mobileMenuOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4 pointer-events-none"}`}
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setMobileMenuOpen(false)}
            className="p-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl"
          >
            {l.label}
          </Link>
        ))}
        <div className="h-px bg-white/10 my-2" />
        {!user ? (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-center text-slate-300 border border-white/10 rounded-xl"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-center bg-white text-slate-950 rounded-xl font-semibold"
            >
              Daftar
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {isStaff && (
              <Link
                href="/cms"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-center bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                CMS
              </Link>
            )}
            {canAccessDashboard && (
              <Link
                href="/peserta"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-center bg-cyan-900/30 text-cyan-400 rounded-xl hover:bg-cyan-900/50 transition-colors"
              >
                Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="p-3 text-center bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
