"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Container from "./ui/Container";
import { Button } from "./ui/Button";

type Role = "superadmin" | "admin" | "mentor" | "peserta";
type User = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
};

const links = [
  { href: "#program", label: "Kurikulum" },
  { href: "#mentor", label: "Mentor" },
  { href: "#testimoni", label: "Testimoni" },
  { href: "#faq", label: "FAQ" },
  { href: "/daftar-kelas", label: "Daftar Kelas" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      if (j?.detail) msg = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {}
    throw new Error(msg);
  }
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await api<User>("/me");
        if (!cancelled) setUser(u);
        // cek akses hanya jika login sukses
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
    <div
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? "backdrop-blur bg-slate-900/60 border-b border-white/10" : "bg-transparent"
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="relative h-7 w-7">
            <Image
              src="/logo.png"
              alt="Logo TC Mudah"
              fill
              sizes="28px"
              className="object-contain"
              priority
            />
          </div>
          <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-white">
            TC Mudah
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {checking ? null : (
            <>
              {isStaff && (
                <Link href="/cms">
                  <Button variant="ghost">Dashboard CMS</Button>
                </Link>
              )}

              {isPesertaApproved && (
                <Link href="/peserta">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}

              {user ? (
                <Button variant="secondary" onClick={onLogout} disabled={loggingOut}>
                  {loggingOut ? "Keluar..." : "Logout"}
                </Button>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Masuk</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="secondary">Daftar</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile */}
        <MobileMenu
          checking={checking}
          user={user}
          isStaff={isStaff}
          isPesertaApproved={isPesertaApproved}
          onLogout={onLogout}
          loggingOut={loggingOut}
        />
      </Container>

      <div className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

function MobileMenu({
  checking,
  user,
  isStaff,
  isPesertaApproved,
  onLogout,
  loggingOut,
}: {
  checking: boolean;
  user: User | null;
  isStaff: boolean;
  isPesertaApproved: boolean;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        aria-label="Toggle Menu"
        onClick={() => setOpen((s) => !s)}
        className="p-2 rounded-xl border border-white/20 text-white/80"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-3 origin-top rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur p-4 mx-4">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white"
              >
                {l.label}
              </Link>
            ))}

            {!checking && (
              <div className="mt-2 grid gap-2">
                {isStaff && (
                  <Link href="/cms" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full">Dashboard CMS</Button>
                  </Link>
                )}

                {isPesertaApproved && (
                  <Link href="/peserta" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full">Dashboard</Button>
                  </Link>
                )}

                {user ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setOpen(false);
                      onLogout();
                    }}
                    disabled={loggingOut}
                  >
                    {loggingOut ? "Keluar..." : "Logout"}
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button variant="ghost" className="w-full">Masuk</Button>
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      <Button variant="secondary" className="w-full">Daftar</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
